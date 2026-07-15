import { useEffect, useMemo, useState } from 'react'
import type { HTMLAttributes } from 'react'
import { Alert, Button, Card, Form, Input, Select, Space, Switch, Table, Typography } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { createMenuApi } from '../api/menu'
import type { Category, MenuItem } from '../types/menu'
import './MenuManager.css'

export interface MenuManagerProps {
  /** Backend origin. Defaults to VITE_API_BASE_URL / localhost. */
  apiBaseUrl?: string
  /**
   * Owner bearer token. When absent, the screen renders read-only: no add
   * forms, no edit/delete/availability controls. Real enforcement happens
   * server-side -- this only gates the UI.
   */
  authToken?: string | null
}

interface AddCategoryValues {
  name: string
}

interface AddItemValues {
  name: string
  price: string
  category_id: number
  available: boolean
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

/**
 * Owner-facing menu management screen: fetches categories and menu items on
 * mount, and lets the Owner create/edit/delete both, including toggling a
 * menu item's availability. Mirrors TableLayoutEditor's fetch-on-mount,
 * owner-gated, optimistic-local-state pattern. Category and menu item rows
 * edit in place (click Edit -> row becomes editable -> Save/Cancel) rather
 * than via a modal, so the rest of the list stays visible while editing.
 */
export function MenuManager({ apiBaseUrl, authToken = null }: MenuManagerProps) {
  const isOwner = Boolean(authToken)
  const api = useMemo(() => createMenuApi({ baseUrl: apiBaseUrl, token: authToken }), [apiBaseUrl, authToken])

  const [categories, setCategories] = useState<Category[] | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [addCategoryForm] = Form.useForm<AddCategoryValues>()
  const [addItemForm] = Form.useForm<AddItemValues>()

  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
  const [editCategoryName, setEditCategoryName] = useState('')

  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [editItemName, setEditItemName] = useState('')
  const [editItemPrice, setEditItemPrice] = useState('')
  const [editItemCategoryId, setEditItemCategoryId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setError(null)
    Promise.all([api.categories.list(), api.menuItems.list()])
      .then(([fetchedCategories, fetchedMenuItems]) => {
        if (cancelled) return
        setCategories(fetchedCategories)
        setMenuItems(fetchedMenuItems)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err, 'Failed to load menu'))
      })
    return () => {
      cancelled = true
    }
  }, [api])

  function categoryName(categoryId: number): string {
    return categories?.find((category) => category.id === categoryId)?.name ?? 'Unknown category'
  }

  const categoryOptions = (categories ?? []).map((category) => ({ value: category.id, label: category.name }))

  async function handleAddCategory(values: AddCategoryValues) {
    try {
      const created = await api.categories.create({ name: values.name.trim() })
      setCategories((prev) => [...(prev ?? []), created])
      addCategoryForm.resetFields()
    } catch (err) {
      setError(errorMessage(err, 'Failed to add category'))
    }
  }

  function startEditCategory(category: Category) {
    setEditingCategoryId(category.id)
    setEditCategoryName(category.name)
  }

  async function handleSaveCategory(id: number) {
    try {
      const updated = await api.categories.update(id, { name: editCategoryName.trim() })
      setCategories((prev) => (prev ?? []).map((category) => (category.id === id ? updated : category)))
      setEditingCategoryId(null)
    } catch (err) {
      setError(errorMessage(err, 'Failed to update category'))
    }
  }

  async function handleDeleteCategory(category: Category) {
    try {
      await api.categories.remove(category.id)
      setCategories((prev) => (prev ?? []).filter((c) => c.id !== category.id))
    } catch (err) {
      const status = (err as { status?: number } | undefined)?.status
      if (status === 409) {
        setError(`Cannot delete "${category.name}": it still has menu items assigned to it.`)
      } else {
        setError(errorMessage(err, 'Failed to delete category'))
      }
    }
  }

  async function handleAddItem(values: AddItemValues) {
    try {
      const created = await api.menuItems.create({
        name: values.name.trim(),
        price: values.price,
        category_id: values.category_id,
        available: values.available ?? true,
      })
      setMenuItems((prev) => [...(prev ?? []), created])
      addItemForm.resetFields()
    } catch (err) {
      setError(errorMessage(err, 'Failed to add menu item'))
    }
  }

  function startEditItem(item: MenuItem) {
    setEditingItemId(item.id)
    setEditItemName(item.name)
    setEditItemPrice(item.price)
    setEditItemCategoryId(item.category_id)
  }

  async function handleSaveItem(id: number) {
    try {
      const updated = await api.menuItems.update(id, {
        name: editItemName.trim(),
        price: editItemPrice,
        category_id: editItemCategoryId ?? undefined,
      })
      setMenuItems((prev) => (prev ?? []).map((item) => (item.id === id ? updated : item)))
      setEditingItemId(null)
    } catch (err) {
      setError(errorMessage(err, 'Failed to update menu item'))
    }
  }

  async function handleToggleAvailable(item: MenuItem) {
    try {
      const updated = await api.menuItems.update(item.id, { available: !item.available })
      setMenuItems((prev) => (prev ?? []).map((i) => (i.id === item.id ? updated : i)))
    } catch (err) {
      setError(errorMessage(err, 'Failed to update availability'))
    }
  }

  async function handleDeleteItem(item: MenuItem) {
    try {
      await api.menuItems.remove(item.id)
      setMenuItems((prev) => (prev ?? []).filter((i) => i.id !== item.id))
    } catch (err) {
      setError(errorMessage(err, 'Failed to delete menu item'))
    }
  }

  const categoryColumns = [
    {
      title: 'Category',
      key: 'name',
      render: (_: unknown, category: Category) =>
        editingCategoryId === category.id ? (
          <Input
            value={editCategoryName}
            onChange={(event) => setEditCategoryName(event.target.value)}
            onPressEnter={() => handleSaveCategory(category.id)}
          />
        ) : (
          <span className="menu-manager__row-name">{category.name}</span>
        ),
    },
    ...(isOwner
      ? [
          {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, category: Category) =>
              editingCategoryId === category.id ? (
                <Space>
                  <Button size="small" type="primary" onClick={() => handleSaveCategory(category.id)}>
                    Save
                  </Button>
                  <Button size="small" onClick={() => setEditingCategoryId(null)}>
                    Cancel
                  </Button>
                </Space>
              ) : (
                <Space>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    aria-label={`Edit ${category.name}`}
                    onClick={() => startEditCategory(category)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    aria-label={`Delete ${category.name}`}
                    onClick={() => handleDeleteCategory(category)}
                  >
                    Delete
                  </Button>
                </Space>
              ),
          },
        ]
      : []),
  ]

  const itemColumns = [
    {
      title: 'Name',
      key: 'name',
      render: (_: unknown, item: MenuItem) =>
        editingItemId === item.id ? (
          <Input
            aria-label={`Edit name for ${item.name}`}
            value={editItemName}
            onChange={(event) => setEditItemName(event.target.value)}
          />
        ) : (
          <span className="menu-manager__row-name">{item.name}</span>
        ),
    },
    {
      title: 'Price',
      key: 'price',
      render: (_: unknown, item: MenuItem) =>
        editingItemId === item.id ? (
          <Input
            aria-label={`Edit price for ${item.name}`}
            type="number"
            min={0}
            step="0.01"
            value={editItemPrice}
            onChange={(event) => setEditItemPrice(event.target.value)}
          />
        ) : (
          <span className="menu-manager__row-price">{item.price}</span>
        ),
    },
    {
      title: 'Category',
      key: 'category',
      render: (_: unknown, item: MenuItem) =>
        editingItemId === item.id ? (
          <Select
            aria-label={`Edit category for ${item.name}`}
            value={editItemCategoryId ?? undefined}
            onChange={(value) => setEditItemCategoryId(value)}
            options={categoryOptions}
            style={{ minWidth: 140 }}
          />
        ) : (
          <span>{categoryName(item.category_id)}</span>
        ),
    },
    {
      title: 'Availability',
      key: 'available',
      render: (_: unknown, item: MenuItem) =>
        isOwner ? (
          <Switch
            checked={item.available}
            aria-label={`${item.name} available`}
            onChange={() => handleToggleAvailable(item)}
          />
        ) : (
          <span>{item.available ? 'Available' : 'Unavailable'}</span>
        ),
    },
    ...(isOwner
      ? [
          {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, item: MenuItem) =>
              editingItemId === item.id ? (
                <Space>
                  <Button size="small" type="primary" onClick={() => handleSaveItem(item.id)}>
                    Save
                  </Button>
                  <Button size="small" onClick={() => setEditingItemId(null)}>
                    Cancel
                  </Button>
                </Space>
              ) : (
                <Space>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    aria-label={`Edit ${item.name}`}
                    onClick={() => startEditItem(item)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    aria-label={`Delete ${item.name}`}
                    onClick={() => handleDeleteItem(item)}
                  >
                    Delete
                  </Button>
                </Space>
              ),
          },
        ]
      : []),
  ]

  return (
    <div className="menu-manager">
      <Typography.Title level={2}>Menu</Typography.Title>

      {error && <Alert className="menu-manager__error" type="error" message={error} showIcon closable onClose={() => setError(null)} />}

      <Card title="Categories" className="menu-manager__section">
        {isOwner && (
          <Form<AddCategoryValues>
            form={addCategoryForm}
            name="add-category"
            layout="inline"
            className="menu-manager__toolbar"
            onFinish={handleAddCategory}
          >
            <Form.Item label="Category name" name="name" rules={[{ required: true, message: 'Required' }]}>
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Add category
              </Button>
            </Form.Item>
          </Form>
        )}

        <Table<Category>
          columns={categoryColumns}
          dataSource={categories ?? []}
          rowKey="id"
          loading={categories === null}
          pagination={false}
          onRow={(category) => ({ 'data-testid': `category-${category.id}` }) as HTMLAttributes<HTMLElement>}
        />
      </Card>

      <Card title="Menu Items" className="menu-manager__section">
        {isOwner && (
          <Form<AddItemValues>
            form={addItemForm}
            name="add-item"
            layout="inline"
            className="menu-manager__toolbar"
            initialValues={{ available: true }}
            onFinish={handleAddItem}
          >
            <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Required' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Price" name="price" rules={[{ required: true, message: 'Required' }]}>
              <Input type="number" min={0} step="0.01" />
            </Form.Item>
            <Form.Item label="Category" name="category_id" rules={[{ required: true, message: 'Required' }]}>
              <Select options={categoryOptions} placeholder="Select a category" style={{ minWidth: 160 }} />
            </Form.Item>
            <Form.Item label="Available" name="available" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Add item
              </Button>
            </Form.Item>
          </Form>
        )}

        <Table<MenuItem>
          columns={itemColumns}
          dataSource={menuItems ?? []}
          rowKey="id"
          loading={menuItems === null}
          pagination={false}
          onRow={(item) => ({ 'data-testid': `item-${item.id}` }) as HTMLAttributes<HTMLElement>}
        />
      </Card>
    </div>
  )
}

export default MenuManager
