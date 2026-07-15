import { useEffect, useMemo, useState } from 'react'
import type { HTMLAttributes } from 'react'
import { Alert, Button, Card, Form, Input, Modal, Popconfirm, Select, Table, Tag, Typography } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import { createEmployeesApi } from '../api/employees'
import type { Employee, EmployeeRole, EmployeeUpdate } from '../types/employee'
import './EmployeeManager.css'

export interface EmployeeManagerProps {
  /** Backend origin. Defaults to VITE_API_BASE_URL / localhost. */
  apiBaseUrl?: string
  /**
   * Owner bearer token. When absent, the screen renders read-only: no add
   * form, no edit/deactivate/reactivate controls. Real enforcement happens
   * server-side (auth:sanctum + role:owner on every /api/employees route)
   * -- this only gates the UI.
   */
  authToken?: string | null
}

const ROLE_OPTIONS: { value: EmployeeRole; label: string }[] = [
  { value: 'owner', label: 'Owner' },
  { value: 'cashier', label: 'Cashier' },
  { value: 'server', label: 'Server' },
  { value: 'kitchen', label: 'Kitchen' },
]

const ROLE_LABEL: Record<EmployeeRole, string> = {
  owner: 'Owner',
  cashier: 'Cashier',
  server: 'Server',
  kitchen: 'Kitchen',
}

/** Kitchen is PIN-authenticated; every other role logs in with email + password. */
function isLoginRole(role: EmployeeRole): boolean {
  return role !== 'kitchen'
}

interface AddEmployeeValues {
  name: string
  role: EmployeeRole
  email?: string
  password?: string
  pin?: string
}

interface EditEmployeeValues {
  role: EmployeeRole
  password?: string
  pin?: string
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

/**
 * Owner-facing employee management screen (C-22): fetches every employee on
 * mount, and lets the Owner add, edit (role + credential reset), deactivate,
 * and reactivate them. Mirrors MenuManager's fetch-on-mount,
 * owner-gated, optimistic-local-state pattern.
 *
 * Editing uses a Modal+Form rather than MenuManager's editable-cell pattern:
 * an employee row has more fields (role plus a role-conditional credential)
 * than a category/menu-item row, and the credential field's identity
 * (password vs. PIN) needs to react to an in-progress role change, which is
 * fiddlier to express as inline cell state.
 *
 * Closes a gap flagged in C-21's review: the backend's update endpoint
 * doesn't require a new credential when a role change crosses the
 * login-role/Kitchen boundary (e.g. Cashier -> Kitchen with no PIN would
 * leave the employee unable to ever clock in). This form enforces that
 * client-side -- crossing the boundary makes the new credential required
 * before Save is allowed.
 */
export function EmployeeManager({ apiBaseUrl, authToken = null }: EmployeeManagerProps) {
  const isOwner = Boolean(authToken)
  const api = useMemo(() => createEmployeesApi({ baseUrl: apiBaseUrl, token: authToken }), [apiBaseUrl, authToken])

  const [employees, setEmployees] = useState<Employee[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [addForm] = Form.useForm<AddEmployeeValues>()
  const addRole = Form.useWatch('role', addForm)

  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [editForm] = Form.useForm<EditEmployeeValues>()
  const editRole = Form.useWatch('role', editForm)

  useEffect(() => {
    let cancelled = false
    setError(null)
    api
      .list()
      .then((fetched) => {
        if (!cancelled) setEmployees(fetched)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err, 'Failed to load employees'))
      })
    return () => {
      cancelled = true
    }
  }, [api])

  async function handleAddEmployee(values: AddEmployeeValues) {
    try {
      const payload =
        values.role === 'kitchen'
          ? { name: values.name.trim(), role: values.role, pin: values.pin }
          : { name: values.name.trim(), role: values.role, email: values.email, password: values.password }
      const created = await api.create(payload)
      setEmployees((prev) => [...(prev ?? []), created])
      addForm.resetFields()
    } catch (err) {
      setError(errorMessage(err, 'Failed to add employee'))
    }
  }

  function openEditModal(employee: Employee) {
    setError(null)
    setEditingEmployee(employee)
    editForm.resetFields()
    editForm.setFieldsValue({ role: employee.role })
  }

  function closeEditModal() {
    setEditingEmployee(null)
  }

  async function handleEditSubmit(values: EditEmployeeValues) {
    if (!editingEmployee) return
    try {
      const payload: EmployeeUpdate = { role: values.role }
      if (values.role === 'kitchen') {
        if (values.pin) payload.pin = values.pin
      } else if (values.password) {
        payload.password = values.password
      }
      const updated = await api.update(editingEmployee.id, payload)
      setEmployees((prev) => (prev ?? []).map((employee) => (employee.id === updated.id ? updated : employee)))
      closeEditModal()
    } catch (err) {
      setError(errorMessage(err, 'Failed to update employee'))
    }
  }

  async function handleDeactivate(employee: Employee) {
    try {
      const updated = await api.deactivate(employee.id)
      setEmployees((prev) => (prev ?? []).map((e) => (e.id === updated.id ? updated : e)))
    } catch (err) {
      setError(errorMessage(err, 'Failed to deactivate employee'))
    }
  }

  async function handleReactivate(employee: Employee) {
    try {
      const updated = await api.reactivate(employee.id)
      setEmployees((prev) => (prev ?? []).map((e) => (e.id === updated.id ? updated : e)))
    } catch (err) {
      setError(errorMessage(err, 'Failed to reactivate employee'))
    }
  }

  // Whether Save should require a brand-new credential: the employee's
  // stored role and the role currently selected in the modal fall on
  // different sides of the login/Kitchen authentication boundary.
  const crossingAuthBoundary = Boolean(
    editingEmployee && editRole !== undefined && isLoginRole(editingEmployee.role) !== isLoginRole(editRole),
  )

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (_: unknown, employee: Employee) => employee.name,
    },
    {
      title: 'Role',
      key: 'role',
      render: (_: unknown, employee: Employee) => ROLE_LABEL[employee.role],
    },
    {
      title: 'Status',
      key: 'active',
      render: (_: unknown, employee: Employee) =>
        employee.active ? <Tag color="success">Active</Tag> : <Tag color="default">Inactive</Tag>,
    },
    ...(isOwner
      ? [
          {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, employee: Employee) => (
              <div className="employee-manager__row-actions">
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  aria-label={`Edit ${employee.name}`}
                  onClick={() => openEditModal(employee)}
                >
                  Edit
                </Button>
                {employee.active ? (
                  <Popconfirm
                    title="Deactivate this employee?"
                    okText="Yes, deactivate"
                    cancelText="Cancel"
                    onConfirm={() => handleDeactivate(employee)}
                  >
                    <Button size="small" danger aria-label={`Deactivate ${employee.name}`}>
                      Deactivate
                    </Button>
                  </Popconfirm>
                ) : (
                  <Button
                    size="small"
                    aria-label={`Reactivate ${employee.name}`}
                    onClick={() => handleReactivate(employee)}
                  >
                    Reactivate
                  </Button>
                )}
              </div>
            ),
          },
        ]
      : []),
  ]

  return (
    <div className="employee-manager">
      <Typography.Title level={2}>Employee Management</Typography.Title>

      {error && (
        <Alert
          className="employee-manager__error"
          type="error"
          message={error}
          showIcon
          closable
          onClose={() => setError(null)}
        />
      )}

      <Card title="Employees" className="employee-manager__section">
        {isOwner && (
          <Form<AddEmployeeValues>
            form={addForm}
            name="add-employee"
            layout="inline"
            className="employee-manager__toolbar"
            onFinish={handleAddEmployee}
          >
            <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Name is required.' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Role" name="role" rules={[{ required: true, message: 'Role is required.' }]}>
              <Select options={ROLE_OPTIONS} placeholder="Select a role" style={{ minWidth: 140 }} />
            </Form.Item>
            {addRole === 'kitchen' ? (
              <Form.Item
                label="PIN"
                name="pin"
                rules={[
                  { required: true, message: 'A 6-digit PIN is required.' },
                  { pattern: /^\d{6}$/, message: 'PIN must be exactly 6 digits.' },
                ]}
              >
                <Input inputMode="numeric" maxLength={6} />
              </Form.Item>
            ) : (
              <>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[{ required: true, type: 'email', message: 'A valid email is required.' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    { required: true, message: 'A password is required.' },
                    { min: 8, message: 'Password must be at least 8 characters.' },
                  ]}
                >
                  <Input.Password />
                </Form.Item>
              </>
            )}
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Add employee
              </Button>
            </Form.Item>
          </Form>
        )}

        <Table<Employee>
          columns={columns}
          dataSource={employees ?? []}
          rowKey="id"
          loading={employees === null}
          pagination={false}
          onRow={(employee) => ({ 'data-testid': `employee-${employee.id}` }) as HTMLAttributes<HTMLElement>}
        />
      </Card>

      <Modal
        title={editingEmployee ? `Edit ${editingEmployee.name}` : 'Edit employee'}
        open={editingEmployee !== null}
        onCancel={closeEditModal}
        destroyOnHidden
        footer={null}
      >
        <Form<EditEmployeeValues> form={editForm} name="edit-employee" layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item label="Role" name="role" rules={[{ required: true, message: 'Role is required.' }]}>
            <Select options={ROLE_OPTIONS} style={{ minWidth: 140 }} />
          </Form.Item>
          {editRole === 'kitchen' ? (
            <Form.Item
              label="PIN"
              name="pin"
              rules={[
                ...(crossingAuthBoundary ? [{ required: true, message: 'A new PIN is required when changing this role.' }] : []),
                { pattern: /^\d{6}$/, message: 'PIN must be exactly 6 digits.' },
              ]}
            >
              <Input inputMode="numeric" maxLength={6} placeholder="Leave blank to keep the current PIN" />
            </Form.Item>
          ) : (
            <Form.Item
              label="Password"
              name="password"
              rules={[
                ...(crossingAuthBoundary
                  ? [{ required: true, message: 'A new password is required when changing this role.' }]
                  : []),
                { min: 8, message: 'Password must be at least 8 characters.' },
              ]}
            >
              <Input.Password placeholder="Leave blank to keep the current password" />
            </Form.Item>
          )}
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
            <Button onClick={closeEditModal} className="employee-manager__cancel-edit">
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default EmployeeManager
