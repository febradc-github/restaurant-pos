import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMenuApi } from './menu'
import type { Category, MenuItem } from '../types/menu'

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

const sampleCategory: Category = { id: 1, name: 'Appetizers' }

const sampleMenuItem: MenuItem = {
  id: 1,
  name: 'Spring Rolls',
  price: '5.99',
  category_id: 1,
  available: true,
}

describe('createMenuApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('categories', () => {
    it('lists categories without an Authorization header when no token is given', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([sampleCategory]))

      const api = createMenuApi({ baseUrl: 'http://api.test' })
      const result = await api.categories.list()

      expect(result).toEqual([sampleCategory])
      expect(fetch).toHaveBeenCalledWith(
        'http://api.test/api/categories',
        expect.objectContaining({ headers: expect.not.objectContaining({ Authorization: expect.anything() }) }),
      )
    })

    it('creates a category with a Bearer token and JSON body', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(sampleCategory, { status: 201 }))

      const api = createMenuApi({ baseUrl: 'http://api.test', token: 'owner-token' })
      const result = await api.categories.create({ name: 'Appetizers' })

      expect(result).toEqual(sampleCategory)
      const [calledUrl, calledInit] = vi.mocked(fetch).mock.calls[0]
      expect(calledUrl).toBe('http://api.test/api/categories')
      expect(calledInit).toMatchObject({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer owner-token' }),
      })
      expect(JSON.parse(calledInit!.body as string)).toEqual({ name: 'Appetizers' })
    })

    it('updates a category via PATCH to /api/categories/{id}', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ ...sampleCategory, name: 'Starters' }))

      const api = createMenuApi({ baseUrl: 'http://api.test', token: 'owner-token' })
      await api.categories.update(1, { name: 'Starters' })

      const [calledUrl, calledInit] = vi.mocked(fetch).mock.calls[0]
      expect(calledUrl).toBe('http://api.test/api/categories/1')
      expect(calledInit).toMatchObject({ method: 'PATCH' })
      expect(JSON.parse(calledInit!.body as string)).toEqual({ name: 'Starters' })
    })

    it('deletes a category via DELETE to /api/categories/{id}', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 }))

      const api = createMenuApi({ baseUrl: 'http://api.test', token: 'owner-token' })
      await api.categories.remove(1)

      const [calledUrl, calledInit] = vi.mocked(fetch).mock.calls[0]
      expect(calledUrl).toBe('http://api.test/api/categories/1')
      expect(calledInit).toMatchObject({ method: 'DELETE' })
    })

    it('throws with a status property when deleting a category that still has items (409)', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response('Cannot delete a category that still has menu items assigned to it.', { status: 409 }),
      )

      const api = createMenuApi({ baseUrl: 'http://api.test', token: 'owner-token' })

      await expect(api.categories.remove(1)).rejects.toMatchObject({ status: 409 })
    })
  })

  describe('menuItems', () => {
    it('lists menu items without a category filter by default', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([sampleMenuItem]))

      const api = createMenuApi({ baseUrl: 'http://api.test' })
      const result = await api.menuItems.list()

      expect(result).toEqual([sampleMenuItem])
      expect(fetch).toHaveBeenCalledWith('http://api.test/api/menu-items', expect.anything())
    })

    it('lists menu items filtered by category_id when given', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([sampleMenuItem]))

      const api = createMenuApi({ baseUrl: 'http://api.test' })
      await api.menuItems.list(1)

      expect(fetch).toHaveBeenCalledWith('http://api.test/api/menu-items?category_id=1', expect.anything())
    })

    it('creates a menu item with a Bearer token and JSON body', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(sampleMenuItem, { status: 201 }))

      const api = createMenuApi({ baseUrl: 'http://api.test', token: 'owner-token' })
      const result = await api.menuItems.create({
        name: 'Spring Rolls',
        price: '5.99',
        category_id: 1,
        available: true,
      })

      expect(result).toEqual(sampleMenuItem)
      const [calledUrl, calledInit] = vi.mocked(fetch).mock.calls[0]
      expect(calledUrl).toBe('http://api.test/api/menu-items')
      expect(calledInit).toMatchObject({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer owner-token' }),
      })
      expect(JSON.parse(calledInit!.body as string)).toEqual({
        name: 'Spring Rolls',
        price: '5.99',
        category_id: 1,
        available: true,
      })
    })

    it('updates a menu item via PATCH to /api/menu-items/{id}', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ ...sampleMenuItem, available: false }))

      const api = createMenuApi({ baseUrl: 'http://api.test', token: 'owner-token' })
      await api.menuItems.update(1, { available: false })

      const [calledUrl, calledInit] = vi.mocked(fetch).mock.calls[0]
      expect(calledUrl).toBe('http://api.test/api/menu-items/1')
      expect(calledInit).toMatchObject({ method: 'PATCH' })
      expect(JSON.parse(calledInit!.body as string)).toEqual({ available: false })
    })

    it('deletes a menu item via DELETE to /api/menu-items/{id}', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 }))

      const api = createMenuApi({ baseUrl: 'http://api.test', token: 'owner-token' })
      await api.menuItems.remove(1)

      const [calledUrl, calledInit] = vi.mocked(fetch).mock.calls[0]
      expect(calledUrl).toBe('http://api.test/api/menu-items/1')
      expect(calledInit).toMatchObject({ method: 'DELETE' })
    })

    it('throws when the response is not ok', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(new Response('nope', { status: 500 }))

      const api = createMenuApi({ baseUrl: 'http://api.test' })

      await expect(api.menuItems.list()).rejects.toThrow(/500/)
    })
  })
})
