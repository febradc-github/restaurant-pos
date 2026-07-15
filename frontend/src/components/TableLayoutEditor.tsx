import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Statistic,
  Typography,
  theme as antdTheme,
} from 'antd'
import { createTablesApi } from '../api/tables'
import type { NewTable, Table, TableShape, TableUpdate } from '../types/table'
import { groupTablesByZone, UNASSIGNED_ZONE } from './tableZoneGrouping'
import './TableLayoutEditor.css'

const SHAPE_DEFAULTS: Record<TableShape, { width: number; height: number }> = {
  round: { width: 80, height: 80 },
  square: { width: 80, height: 80 },
  rectangular: { width: 120, height: 80 },
}

const SHAPE_OPTIONS: { value: TableShape; label: string }[] = [
  { value: 'round', label: 'Round' },
  { value: 'square', label: 'Square' },
  { value: 'rectangular', label: 'Rectangular' },
]

const SHAPE_LABEL: Record<TableShape, string> = {
  round: 'Round',
  square: 'Square',
  rectangular: 'Rectangular',
}

interface AddTableValues {
  label?: string
  shape: TableShape
  capacity: number
  zone?: string
}

interface EditTableValues {
  label: string
  shape: TableShape
  capacity: number
  zone?: string
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

export interface TableLayoutEditorProps {
  /** Backend origin. Defaults to VITE_API_BASE_URL / localhost. */
  apiBaseUrl?: string
  /**
   * Owner bearer token. When absent, the grid renders read-only: no add
   * form, no Edit/Duplicate/Remove controls. Real enforcement happens
   * server-side -- this only gates the UI.
   */
  authToken?: string | null
}

/**
 * Owner-facing table management screen (C-37): a zone-grouped grid of
 * color-coded table cards, replacing the earlier canvas-based drag/resize
 * floor-plan editor (see AR-frontend-design-system's redesign-exception
 * reversal, adr-012). A stat row summarizes table/seat/occupancy counts, an
 * inline form adds tables, and selecting a card opens a detail panel with
 * Edit/Duplicate/Remove actions.
 *
 * Occupancy (green/red card coloring) is read straight off each table's
 * server-computed `is_occupied` flag (TableController@index, C-37) rather
 * than fetched/derived here from /api/orders -- one shared definition of
 * "occupied" for every consumer of the tables endpoint, not a second one
 * reimplemented client-side. Only two states exist: available and occupied.
 * A third "reserved" state was cut from this ticket's scope (see SP-37's
 * amendment) since no reservation data model exists anywhere in this
 * system yet -- building one is tracked separately as C-40.
 */
export function TableLayoutEditor({ apiBaseUrl, authToken = null }: TableLayoutEditorProps) {
  const isOwner = Boolean(authToken)
  const api = useMemo(
    () => createTablesApi({ baseUrl: apiBaseUrl, token: authToken }),
    [apiBaseUrl, authToken],
  )
  const { token } = antdTheme.useToken()

  const [tables, setTables] = useState<Table[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const [addForm] = Form.useForm<AddTableValues>()

  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [editForm] = Form.useForm<EditTableValues>()

  useEffect(() => {
    let cancelled = false
    setError(null)
    api
      .list()
      .then((fetched) => {
        if (!cancelled) setTables(fetched)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err, 'Failed to load tables'))
      })
    return () => {
      cancelled = true
    }
  }, [api])

  async function handleAddTable(values: AddTableValues) {
    const index = tables?.length ?? 0
    const shape = values.shape ?? 'square'
    const { width, height } = SHAPE_DEFAULTS[shape]
    // x/y/width/height are vestigial now that the canvas is gone (C-37) --
    // the backend still stores them, so placeholder values keep the create
    // request valid without exposing position/size controls in this form.
    const payload: NewTable = {
      label: values.label?.trim() || `Table ${index + 1}`,
      shape,
      capacity: values.capacity ?? 4,
      zone: values.zone?.trim() || null,
      x: 0,
      y: 0,
      width,
      height,
    }

    try {
      const created = await api.create(payload)
      setTables((prev) => [...(prev ?? []), created])
      addForm.resetFields()
    } catch (err) {
      setError(errorMessage(err, 'Failed to add table'))
    }
  }

  function openEditModal(table: Table) {
    setError(null)
    setEditingTable(table)
    editForm.resetFields()
    editForm.setFieldsValue({
      label: table.label,
      shape: table.shape,
      capacity: table.capacity,
      zone: table.zone ?? undefined,
    })
  }

  function closeEditModal() {
    setEditingTable(null)
  }

  async function handleEditSubmit(values: EditTableValues) {
    if (!editingTable) return
    const updates: TableUpdate = {
      label: values.label.trim(),
      shape: values.shape,
      capacity: values.capacity,
      zone: values.zone?.trim() || null,
    }
    try {
      const updated = await api.update(editingTable.id, updates)
      setTables((prev) => (prev ?? []).map((table) => (table.id === updated.id ? updated : table)))
      closeEditModal()
    } catch (err) {
      setError(errorMessage(err, 'Failed to update table'))
    }
  }

  async function handleDuplicate(table: Table) {
    const payload: NewTable = {
      label: `${table.label} (Copy)`,
      shape: table.shape,
      capacity: table.capacity,
      zone: table.zone,
      x: table.x,
      y: table.y,
      width: table.width,
      height: table.height,
    }
    try {
      const created = await api.create(payload)
      setTables((prev) => [...(prev ?? []), created])
    } catch (err) {
      setError(errorMessage(err, 'Failed to duplicate table'))
    }
  }

  async function handleRemove(table: Table) {
    try {
      await api.remove(table.id)
      setTables((prev) => (prev ?? []).filter((t) => t.id !== table.id))
      setSelectedId((prev) => (prev === table.id ? null : prev))
    } catch (err) {
      setError(errorMessage(err, 'Failed to remove table'))
    }
  }

  const selectedTable = tables?.find((table) => table.id === selectedId) ?? null
  const zoneGroups = useMemo(() => groupTablesByZone(tables ?? []), [tables])

  const totalTables = tables?.length ?? 0
  const totalSeats = tables?.reduce((sum, table) => sum + table.capacity, 0) ?? 0
  const occupiedCount = tables?.filter((table) => table.is_occupied).length ?? 0

  /** Green for available, red for occupied -- see the component doc comment for why there's no third state. */
  function cardStyle(table: Table): CSSProperties {
    return table.is_occupied
      ? { background: token.colorErrorBg, borderColor: token.colorErrorBorder }
      : { background: token.colorSuccessBg, borderColor: token.colorSuccessBorder }
  }

  return (
    <div className="table-layout-editor">
      <Typography.Title level={2}>Tables</Typography.Title>

      {error && (
        <Alert
          className="table-layout-editor__error"
          type="error"
          message={error}
          showIcon
          closable
          onClose={() => setError(null)}
        />
      )}

      <div className="table-layout-editor__stats" data-testid="table-stats">
        <Card size="small">
          <Statistic title="Tables" value={totalTables} />
        </Card>
        <Card size="small">
          <Statistic title="Seats" value={totalSeats} />
        </Card>
        <Card size="small">
          <Statistic title="Occupied" value={occupiedCount} />
        </Card>
      </div>

      {isOwner && (
        <Card className="table-layout-editor__toolbar-card" size="small">
          <Form<AddTableValues>
            form={addForm}
            name="add-table"
            layout="inline"
            className="table-layout-editor__toolbar"
            initialValues={{ shape: 'square', capacity: 4 }}
            onFinish={handleAddTable}
          >
            <Form.Item label="Label" name="label">
              <Input placeholder={`Table ${(tables?.length ?? 0) + 1}`} />
            </Form.Item>
            <Form.Item label="Shape" name="shape">
              <Select options={SHAPE_OPTIONS} style={{ minWidth: 140 }} />
            </Form.Item>
            <Form.Item label="Capacity" name="capacity">
              <InputNumber min={1} />
            </Form.Item>
            <Form.Item label="Zone" name="zone">
              <Input placeholder="e.g. Patio" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Add table
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}

      <div className="table-layout-editor__body">
        <div className="table-layout-editor__grid" data-testid="table-grid">
          {tables === null ? (
            <p>Loading tables…</p>
          ) : (
            zoneGroups.map(({ zone, tables: zoneTables }) => (
              <div key={zone} className="table-layout-editor__zone">
                <Typography.Title level={4}>{zone}</Typography.Title>
                <div className="table-layout-editor__cards">
                  {zoneTables.map((table) => (
                    <button
                      key={table.id}
                      type="button"
                      data-testid={`table-card-${table.id}`}
                      className={[
                        'table-layout-editor__card',
                        table.is_occupied
                          ? 'table-layout-editor__card--occupied'
                          : 'table-layout-editor__card--available',
                        selectedId === table.id ? 'table-layout-editor__card--selected' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      style={cardStyle(table)}
                      aria-pressed={selectedId === table.id}
                      onClick={() => setSelectedId(table.id)}
                    >
                      <span className="table-layout-editor__card-label">{table.label}</span>
                      <span className="table-layout-editor__card-seats">Seats {table.capacity}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {selectedTable && (
          <Card
            className="table-layout-editor__detail"
            data-testid="table-detail-panel"
            title={selectedTable.label}
          >
            <Descriptions
              column={1}
              size="small"
              items={[
                { key: 'shape', label: 'Shape', children: SHAPE_LABEL[selectedTable.shape] },
                { key: 'seats', label: 'Seats', children: selectedTable.capacity },
                { key: 'zone', label: 'Zone', children: selectedTable.zone ?? UNASSIGNED_ZONE },
                // No Order->user/server relation exists anywhere in this
                // codebase yet (checked Order model, C-37) -- rather than
                // invent a new backend field out of this ticket's scope,
                // this line stays a static placeholder until one exists.
                { key: 'server', label: 'Server', children: '--' },
              ]}
            />

            {isOwner && (
              <div className="table-layout-editor__detail-actions">
                <Button onClick={() => openEditModal(selectedTable)}>Edit</Button>
                <Button onClick={() => handleDuplicate(selectedTable)}>Duplicate</Button>
                <Popconfirm
                  title="Remove this table?"
                  okText="Yes, remove"
                  cancelText="Cancel"
                  onConfirm={() => handleRemove(selectedTable)}
                >
                  <Button danger>Remove</Button>
                </Popconfirm>
              </div>
            )}
          </Card>
        )}
      </div>

      <Modal
        title={editingTable ? `Edit ${editingTable.label}` : 'Edit table'}
        open={editingTable !== null}
        onCancel={closeEditModal}
        destroyOnHidden
        footer={null}
      >
        <Form<EditTableValues> form={editForm} name="edit-table" layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item label="Label" name="label" rules={[{ required: true, message: 'Label is required.' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Shape" name="shape" rules={[{ required: true, message: 'Shape is required.' }]}>
            <Select options={SHAPE_OPTIONS} />
          </Form.Item>
          <Form.Item
            label="Capacity"
            name="capacity"
            rules={[{ required: true, message: 'Capacity is required.' }]}
          >
            <InputNumber min={1} />
          </Form.Item>
          <Form.Item label="Zone" name="zone">
            <Input placeholder="e.g. Patio" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
            <Button onClick={closeEditModal} className="table-layout-editor__cancel-edit">
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TableLayoutEditor
