import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
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

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

/**
 * Owner-facing menu management screen: fetches categories and menu items on
 * mount, and lets the Owner create/edit/delete both, including toggling a
 * menu item's availability. Mirrors TableLayoutEditor's fetch-on-mount,
 * owner-gated, optimistic-local-state pattern.
 */
export function MenuManager({ apiBaseUrl, authToken = null }: MenuManagerProps) {
  const isOwner = Boolean(authToken)
  const api = useMemo(() => createMenuApi({ baseUrl: apiBaseUrl, token: authToken }), [apiBaseUrl, authToken])

  const [categories, setCategories] = useState<Category[] | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
  const [editCategoryName, setEditCategoryName] = useState('')

  const [newItemName, setNewItemName] = useState('')
  const [newItemPrice, setNewItemPrice] = useState('')
  const [newItemCategoryId, setNewItemCategoryId] = useState('')
  const [newItemAvailable, setNewItemAvailable] = useState(true)

  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [editItemName, setEditItemName] = useState('')
  const [editItemPrice, setEditItemPrice] = useState('')
  const [editItemCategoryId, setEditItemCategoryId] = useState('')

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

  async function handleAddCategory(event: FormEvent) {
    event.preventDefault()
    try {
      const created = await api.categories.create({ name: newCategoryName.trim() })
      setCategories((prev) => [...(prev ?? []), created])
      setNewCategoryName('')
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

  async function handleAddItem(event: FormEvent) {
    event.preventDefault()
    try {
      const created = await api.menuItems.create({
        name: newItemName.trim(),
        price: newItemPrice,
        category_id: Number(newItemCategoryId),
        available: newItemAvailable,
      })
      setMenuItems((prev) => [...(prev ?? []), created])
      setNewItemName('')
      setNewItemPrice('')
      setNewItemAvailable(true)
    } catch (err) {
      setError(errorMessage(err, 'Failed to add menu item'))
    }
  }

  function startEditItem(item: MenuItem) {
    setEditingItemId(item.id)
    setEditItemName(item.name)
    setEditItemPrice(item.price)
    setEditItemCategoryId(String(item.category_id))
  }

  async function handleSaveItem(id: number) {
    try {
      const updated = await api.menuItems.update(id, {
        name: editItemName.trim(),
        price: editItemPrice,
        category_id: Number(editItemCategoryId),
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

  return (
    <div className="menu-manager">
      <h2>Menu</h2>

      {error && (
        <p className="menu-manager__error" role="alert">
          {error}
        </p>
      )}

      <section className="menu-manager__section">
        <h3>Categories</h3>

        {isOwner && (
          <form className="menu-manager__toolbar" onSubmit={handleAddCategory}>
            <label>
              Category name
              <input value={newCategoryName} onChange={(event) => setNewCategoryName(event.target.value)} required />
            </label>
            <button type="submit">Add category</button>
          </form>
        )}

        {categories === null ? (
          <p>Loading categories…</p>
        ) : (
          <ul className="menu-manager__list">
            {categories.map((category) => (
              <li key={category.id} className="menu-manager__row" data-testid={`category-${category.id}`}>
                {editingCategoryId === category.id ? (
                  <>
                    <label>
                      Category name
                      <input
                        value={editCategoryName}
                        onChange={(event) => setEditCategoryName(event.target.value)}
                      />
                    </label>
                    <button type="button" onClick={() => handleSaveCategory(category.id)}>
                      Save
                    </button>
                    <button type="button" onClick={() => setEditingCategoryId(null)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="menu-manager__row-name">{category.name}</span>
                    {isOwner && (
                      <>
                        <button type="button" aria-label={`Edit ${category.name}`} onClick={() => startEditCategory(category)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${category.name}`}
                          onClick={() => handleDeleteCategory(category)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="menu-manager__section">
        <h3>Menu Items</h3>

        {isOwner && (
          <form className="menu-manager__toolbar" onSubmit={handleAddItem}>
            <label>
              Name
              <input value={newItemName} onChange={(event) => setNewItemName(event.target.value)} required />
            </label>
            <label>
              Price
              <input
                type="number"
                min={0}
                step="0.01"
                value={newItemPrice}
                onChange={(event) => setNewItemPrice(event.target.value)}
                required
              />
            </label>
            <label>
              Category
              <select
                value={newItemCategoryId}
                onChange={(event) => setNewItemCategoryId(event.target.value)}
                required
              >
                <option value="" disabled>
                  Select a category
                </option>
                {(categories ?? []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Available
              <input
                type="checkbox"
                checked={newItemAvailable}
                onChange={(event) => setNewItemAvailable(event.target.checked)}
              />
            </label>
            <button type="submit">Add item</button>
          </form>
        )}

        {menuItems === null ? (
          <p>Loading menu items…</p>
        ) : (
          <ul className="menu-manager__list">
            {menuItems.map((item) => (
              <li key={item.id} className="menu-manager__row" data-testid={`item-${item.id}`}>
                {editingItemId === item.id ? (
                  <>
                    <label>
                      Name
                      <input value={editItemName} onChange={(event) => setEditItemName(event.target.value)} />
                    </label>
                    <label>
                      Price
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={editItemPrice}
                        onChange={(event) => setEditItemPrice(event.target.value)}
                      />
                    </label>
                    <label>
                      Category
                      <select
                        value={editItemCategoryId}
                        onChange={(event) => setEditItemCategoryId(event.target.value)}
                      >
                        {(categories ?? []).map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button type="button" onClick={() => handleSaveItem(item.id)}>
                      Save
                    </button>
                    <button type="button" onClick={() => setEditingItemId(null)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="menu-manager__row-name">{item.name}</span>
                    <span className="menu-manager__row-price">{item.price}</span>
                    <span>{categoryName(item.category_id)}</span>
                    {isOwner ? (
                      <>
                        <label>
                          Available
                          <input
                            type="checkbox"
                            checked={item.available}
                            aria-label={`${item.name} available`}
                            onChange={() => handleToggleAvailable(item)}
                          />
                        </label>
                        <button type="button" aria-label={`Edit ${item.name}`} onClick={() => startEditItem(item)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${item.name}`}
                          onClick={() => handleDeleteItem(item)}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <span>{item.available ? 'Available' : 'Unavailable'}</span>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default MenuManager
