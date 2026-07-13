import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, PointerEvent as ReactPointerEvent } from 'react'
import { createTablesApi } from '../api/tables'
import type { NewTable, Table, TableShape } from '../types/table'
import './TableLayoutEditor.css'

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600
const MIN_TABLE_SIZE = 20

const SHAPE_DEFAULTS: Record<TableShape, { width: number; height: number }> = {
  round: { width: 80, height: 80 },
  square: { width: 80, height: 80 },
  rectangular: { width: 120, height: 80 },
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min
  return Math.min(Math.max(value, min), max)
}

interface DragState {
  id: number
  pointerId: number
  startX: number
  startY: number
  originX: number
  originY: number
  width: number
  height: number
  currentX: number
  currentY: number
}

interface ResizeState {
  id: number
  pointerId: number
  startX: number
  startY: number
  originWidth: number
  originHeight: number
  tableX: number
  tableY: number
  currentWidth: number
  currentHeight: number
}

export interface TableLayoutEditorProps {
  /** Backend origin. Defaults to VITE_API_BASE_URL / localhost. */
  apiBaseUrl?: string
  /**
   * Owner bearer token. When absent, the canvas renders read-only: no add
   * form, no delete/resize controls, and dragging is disabled. Real
   * enforcement happens server-side -- this only gates the UI.
   */
  authToken?: string | null
}

/**
 * Drag-and-drop floor-plan editor: fetches the table layout on mount and
 * lets an Owner add, move, resize, and delete tables on a fixed-size canvas.
 */
export function TableLayoutEditor({ apiBaseUrl, authToken = null }: TableLayoutEditorProps) {
  const isOwner = Boolean(authToken)
  const api = useMemo(
    () => createTablesApi({ baseUrl: apiBaseUrl, token: authToken }),
    [apiBaseUrl, authToken],
  )

  const [tables, setTables] = useState<Table[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [newLabel, setNewLabel] = useState('')
  const [newShape, setNewShape] = useState<TableShape>('square')
  const [newCapacity, setNewCapacity] = useState(4)

  const dragState = useRef<DragState | null>(null)
  const resizeState = useRef<ResizeState | null>(null)

  useEffect(() => {
    let cancelled = false
    setError(null)
    api
      .list()
      .then((fetched) => {
        if (!cancelled) setTables(fetched)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load layout')
      })
    return () => {
      cancelled = true
    }
  }, [api])

  async function handleAddTable(event: FormEvent) {
    event.preventDefault()
    const index = tables?.length ?? 0
    const { width, height } = SHAPE_DEFAULTS[newShape]
    const payload: NewTable = {
      label: newLabel.trim() || `Table ${index + 1}`,
      shape: newShape,
      capacity: newCapacity,
      x: 20 + (index % 5) * 100,
      y: 20 + Math.floor(index / 5) * 100,
      width,
      height,
    }

    try {
      const created = await api.create(payload)
      setTables((prev) => [...(prev ?? []), created])
      setNewLabel('')
      setNewCapacity(4)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add table')
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.remove(id)
      setTables((prev) => (prev ?? []).filter((table) => table.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete table')
    }
  }

  function handleDragPointerMove(event: PointerEvent) {
    const drag = dragState.current
    if (!drag) return
    const nextX = clamp(drag.originX + (event.clientX - drag.startX), 0, CANVAS_WIDTH - drag.width)
    const nextY = clamp(drag.originY + (event.clientY - drag.startY), 0, CANVAS_HEIGHT - drag.height)
    drag.currentX = nextX
    drag.currentY = nextY
    setTables((prev) =>
      (prev ?? []).map((table) => (table.id === drag.id ? { ...table, x: nextX, y: nextY } : table)),
    )
  }

  async function handleDragPointerUp() {
    const drag = dragState.current
    dragState.current = null
    window.removeEventListener('pointermove', handleDragPointerMove)
    window.removeEventListener('pointerup', handleDragPointerUp)
    if (!drag) return
    try {
      await api.update(drag.id, { x: drag.currentX, y: drag.currentY })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move table')
    }
  }

  function handleTablePointerDown(table: Table, event: ReactPointerEvent<HTMLDivElement>) {
    if (!isOwner) return
    dragState.current = {
      id: table.id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: table.x,
      originY: table.y,
      width: table.width,
      height: table.height,
      currentX: table.x,
      currentY: table.y,
    }
    window.addEventListener('pointermove', handleDragPointerMove)
    window.addEventListener('pointerup', handleDragPointerUp)
  }

  function handleResizePointerMove(event: PointerEvent) {
    const resize = resizeState.current
    if (!resize) return
    const nextWidth = clamp(
      resize.originWidth + (event.clientX - resize.startX),
      MIN_TABLE_SIZE,
      CANVAS_WIDTH - resize.tableX,
    )
    const nextHeight = clamp(
      resize.originHeight + (event.clientY - resize.startY),
      MIN_TABLE_SIZE,
      CANVAS_HEIGHT - resize.tableY,
    )
    resize.currentWidth = nextWidth
    resize.currentHeight = nextHeight
    setTables((prev) =>
      (prev ?? []).map((table) =>
        table.id === resize.id ? { ...table, width: nextWidth, height: nextHeight } : table,
      ),
    )
  }

  async function handleResizePointerUp() {
    const resize = resizeState.current
    resizeState.current = null
    window.removeEventListener('pointermove', handleResizePointerMove)
    window.removeEventListener('pointerup', handleResizePointerUp)
    if (!resize) return
    try {
      await api.update(resize.id, { width: resize.currentWidth, height: resize.currentHeight })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resize table')
    }
  }

  function handleResizeHandlePointerDown(table: Table, event: ReactPointerEvent<HTMLDivElement>) {
    if (!isOwner) return
    event.stopPropagation()
    resizeState.current = {
      id: table.id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originWidth: table.width,
      originHeight: table.height,
      tableX: table.x,
      tableY: table.y,
      currentWidth: table.width,
      currentHeight: table.height,
    }
    window.addEventListener('pointermove', handleResizePointerMove)
    window.addEventListener('pointerup', handleResizePointerUp)
  }

  return (
    <div className="table-layout-editor">
      <h2>Floor Plan</h2>

      {error && (
        <p className="table-layout-editor__error" role="alert">
          {error}
        </p>
      )}

      {isOwner && (
        <form className="table-layout-editor__toolbar" onSubmit={handleAddTable}>
          <label>
            Label
            <input
              value={newLabel}
              onChange={(event) => setNewLabel(event.target.value)}
              placeholder={`Table ${(tables?.length ?? 0) + 1}`}
            />
          </label>
          <label>
            Shape
            <select value={newShape} onChange={(event) => setNewShape(event.target.value as TableShape)}>
              <option value="round">Round</option>
              <option value="square">Square</option>
              <option value="rectangular">Rectangular</option>
            </select>
          </label>
          <label>
            Capacity
            <input
              type="number"
              min={1}
              value={newCapacity}
              onChange={(event) => setNewCapacity(Number(event.target.value))}
            />
          </label>
          <button type="submit">Add table</button>
        </form>
      )}

      {tables === null ? (
        <p>Loading layout…</p>
      ) : (
        <div
          className="table-layout-editor__canvas"
          data-testid="floor-plan-canvas"
          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
        >
          {tables.map((table) => (
            <div
              key={table.id}
              data-testid={`table-${table.id}`}
              data-shape={table.shape}
              className={[
                'table-layout-editor__table',
                `table-layout-editor__table--${table.shape}`,
                isOwner ? 'table-layout-editor__table--editable' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ left: table.x, top: table.y, width: table.width, height: table.height }}
              onPointerDown={isOwner ? (event) => handleTablePointerDown(table, event) : undefined}
            >
              <span>{table.label}</span>
              <span>Seats {table.capacity}</span>

              {isOwner && (
                <>
                  <button
                    type="button"
                    className="table-layout-editor__delete"
                    aria-label={`Delete ${table.label}`}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => handleDelete(table.id)}
                  >
                    ×
                  </button>
                  <div
                    className="table-layout-editor__resize-handle"
                    data-testid={`resize-${table.id}`}
                    aria-label={`Resize ${table.label}`}
                    onPointerDown={(event) => handleResizeHandlePointerDown(table, event)}
                  />
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TableLayoutEditor
