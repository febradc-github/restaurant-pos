import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmployeeManager } from './EmployeeManager'
import type { Employee } from '../types/employee'

const BASE_URL = 'http://api.test'

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

const owner: Employee = {
  id: 1,
  name: 'Olive Owner',
  email: 'owner@example.com',
  role: 'owner',
  active: true,
  has_pin: false,
}

const cashier: Employee = {
  id: 2,
  name: 'Cass Ashier',
  email: 'cashier@example.com',
  role: 'cashier',
  active: true,
  has_pin: false,
}

const cook: Employee = {
  id: 3,
  name: 'Casey Cook',
  email: null,
  role: 'kitchen',
  active: false,
  has_pin: true,
}

/** Mocks the initial GET /api/employees fired on mount. */
function mockInitialLoad(employees: Employee[]) {
  vi.mocked(fetch).mockImplementation((input) => {
    const url = typeof input === 'string' ? input : input.toString()
    if (url.includes('/api/employees')) return Promise.resolve(jsonResponse(employees))
    throw new Error(`Unexpected fetch to ${url}`)
  })
}

/** Selects an antd Select option by opening its dropdown then clicking the option's text. */
async function selectAntOption(user: ReturnType<typeof userEvent.setup>, combobox: HTMLElement, optionText: string) {
  await user.click(combobox)
  const option = await screen.findByTitle(optionText)
  await user.click(option)
}

describe('EmployeeManager', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the page heading with the antd Typography token, not a bare h2', async () => {
    mockInitialLoad([])

    render(<EmployeeManager apiBaseUrl={BASE_URL} authToken="owner-token" />)

    const heading = await screen.findByRole('heading', { level: 2, name: 'Employee Management' })
    expect(heading).toHaveClass('ant-typography')
  })

  it('fetches and displays every employee with name, role, and active status', async () => {
    mockInitialLoad([owner, cook])

    render(<EmployeeManager apiBaseUrl={BASE_URL} authToken="owner-token" />)

    const ownerRow = await screen.findByTestId('employee-1')
    expect(ownerRow).toHaveTextContent('Olive Owner')
    expect(ownerRow).toHaveTextContent('Owner')
    expect(ownerRow).toHaveTextContent('Active')

    const cookRow = screen.getByTestId('employee-3')
    expect(cookRow).toHaveTextContent('Casey Cook')
    expect(cookRow).toHaveTextContent('Kitchen')
    expect(cookRow).toHaveTextContent('Inactive')

    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/employees`,
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer owner-token' }) }),
    )
  })

  it('does not render mutating controls when no auth token is provided', async () => {
    mockInitialLoad([owner])

    render(<EmployeeManager apiBaseUrl={BASE_URL} authToken={null} />)

    await screen.findByText('Olive Owner')

    expect(screen.queryByRole('button', { name: /add employee/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^edit/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /deactivate/i })).not.toBeInTheDocument()
  })

  it('reveals a password field (and hides PIN) when Owner/Cashier/Server is selected in the Add Employee form', async () => {
    const user = userEvent.setup()
    mockInitialLoad([])

    render(<EmployeeManager apiBaseUrl={BASE_URL} authToken="owner-token" />)
    await waitFor(() => expect(fetch).toHaveBeenCalled())

    await selectAntOption(user, screen.getByLabelText(/^role$/i), 'Cashier')

    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/^pin$/i)).not.toBeInTheDocument()
  })

  it('reveals a 6-digit PIN field (and hides email/password) when Kitchen is selected in the Add Employee form', async () => {
    const user = userEvent.setup()
    mockInitialLoad([])

    render(<EmployeeManager apiBaseUrl={BASE_URL} authToken="owner-token" />)
    await waitFor(() => expect(fetch).toHaveBeenCalled())

    await selectAntOption(user, screen.getByLabelText(/^role$/i), 'Kitchen')

    expect(screen.getByLabelText(/^pin$/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/^email$/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/^password$/i)).not.toBeInTheDocument()
  })

  it('lets the owner create a login-role employee, calling the API with name/role/email/password', async () => {
    const user = userEvent.setup()
    const created: Employee = { id: 4, name: 'Sam Server', email: 'sam@example.com', role: 'server', active: true, has_pin: false }
    mockInitialLoad([])

    render(<EmployeeManager apiBaseUrl={BASE_URL} authToken="owner-token" />)
    await waitFor(() => expect(fetch).toHaveBeenCalled())

    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(created, { status: 201 }))

    await user.type(screen.getByLabelText(/^name$/i), 'Sam Server')
    await selectAntOption(user, screen.getByLabelText(/^role$/i), 'Server')
    await user.type(screen.getByLabelText(/^email$/i), 'sam@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'secret123')
    await user.click(screen.getByRole('button', { name: /add employee/i }))

    expect(await screen.findByTestId('employee-4')).toHaveTextContent('Sam Server')
    const createCall = vi.mocked(fetch).mock.calls.find(([, init]) => init?.method === 'POST')
    expect(createCall?.[0]).toBe(`${BASE_URL}/api/employees`)
    expect(JSON.parse(createCall![1]!.body as string)).toEqual({
      name: 'Sam Server',
      role: 'server',
      email: 'sam@example.com',
      password: 'secret123',
    })
  })

  it('lets the owner create a Kitchen employee, calling the API with name/role/pin', async () => {
    const user = userEvent.setup()
    const created: Employee = { id: 5, name: 'Kit Chen', email: null, role: 'kitchen', active: true, has_pin: true }
    mockInitialLoad([])

    render(<EmployeeManager apiBaseUrl={BASE_URL} authToken="owner-token" />)
    await waitFor(() => expect(fetch).toHaveBeenCalled())

    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(created, { status: 201 }))

    await user.type(screen.getByLabelText(/^name$/i), 'Kit Chen')
    await selectAntOption(user, screen.getByLabelText(/^role$/i), 'Kitchen')
    await user.type(screen.getByLabelText(/^pin$/i), '123456')
    await user.click(screen.getByRole('button', { name: /add employee/i }))

    expect(await screen.findByTestId('employee-5')).toHaveTextContent('Kit Chen')
    const createCall = vi.mocked(fetch).mock.calls.find(([, init]) => init?.method === 'POST')
    expect(createCall?.[0]).toBe(`${BASE_URL}/api/employees`)
    expect(JSON.parse(createCall![1]!.body as string)).toEqual({
      name: 'Kit Chen',
      role: 'kitchen',
      pin: '123456',
    })
  })

  it('lets the owner edit a role without crossing the login/Kitchen boundary, without requiring a new credential', async () => {
    const user = userEvent.setup()
    mockInitialLoad([cashier])

    render(<EmployeeManager apiBaseUrl={BASE_URL} authToken="owner-token" />)
    await screen.findByTestId('employee-2')

    const updated: Employee = { ...cashier, role: 'server' }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(updated))

    await user.click(screen.getByRole('button', { name: /edit cass ashier/i }))
    const dialog = await screen.findByRole('dialog')
    await selectAntOption(user, within(dialog).getByLabelText(/^role$/i), 'Server')
    await user.click(within(dialog).getByRole('button', { name: /save/i }))

    await waitFor(() => expect(screen.getByTestId('employee-2')).toHaveTextContent('Server'))
    const updateCall = vi.mocked(fetch).mock.calls.find(([, init]) => init?.method === 'PATCH')
    expect(updateCall?.[0]).toBe(`${BASE_URL}/api/employees/2`)
    expect(JSON.parse(updateCall![1]!.body as string)).toEqual({ role: 'server' })
  })

  it('requires the new PIN before allowing submission when editing a login-role employee to Kitchen', async () => {
    const user = userEvent.setup()
    mockInitialLoad([cashier])

    render(<EmployeeManager apiBaseUrl={BASE_URL} authToken="owner-token" />)
    await screen.findByTestId('employee-2')

    await user.click(screen.getByRole('button', { name: /edit cass ashier/i }))
    const dialog = await screen.findByRole('dialog')
    await selectAntOption(user, within(dialog).getByLabelText(/^role$/i), 'Kitchen')
    await user.click(within(dialog).getByRole('button', { name: /save/i }))

    expect(await within(dialog).findByText(/pin is required/i)).toBeInTheDocument()
    // Blocked client-side: no PATCH request was ever sent.
    expect(vi.mocked(fetch).mock.calls.find(([, init]) => init?.method === 'PATCH')).toBeUndefined()

    const updated: Employee = { ...cashier, role: 'kitchen', email: null, has_pin: true }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(updated))

    await user.type(within(dialog).getByLabelText(/^pin$/i), '654321')
    await user.click(within(dialog).getByRole('button', { name: /save/i }))

    await waitFor(() => {
      const updateCall = vi.mocked(fetch).mock.calls.find(([, init]) => init?.method === 'PATCH')
      expect(updateCall).toBeDefined()
    })
    const updateCall = vi.mocked(fetch).mock.calls.find(([, init]) => init?.method === 'PATCH')
    expect(updateCall?.[0]).toBe(`${BASE_URL}/api/employees/2`)
    expect(JSON.parse(updateCall![1]!.body as string)).toEqual({ role: 'kitchen', pin: '654321' })
  })

  it('requires a new password before allowing submission when editing a Kitchen employee to a login role', async () => {
    const user = userEvent.setup()
    mockInitialLoad([cook])

    render(<EmployeeManager apiBaseUrl={BASE_URL} authToken="owner-token" />)
    await screen.findByTestId('employee-3')

    await user.click(screen.getByRole('button', { name: /edit casey cook/i }))
    const dialog = await screen.findByRole('dialog')
    await selectAntOption(user, within(dialog).getByLabelText(/^role$/i), 'Cashier')
    await user.click(within(dialog).getByRole('button', { name: /save/i }))

    expect(await within(dialog).findByText(/password is required/i)).toBeInTheDocument()
    expect(vi.mocked(fetch).mock.calls.find(([, init]) => init?.method === 'PATCH')).toBeUndefined()
  })

  it('lets the owner deactivate an employee after confirming, calling the deactivate endpoint', async () => {
    const user = userEvent.setup()
    mockInitialLoad([cashier])

    render(<EmployeeManager apiBaseUrl={BASE_URL} authToken="owner-token" />)
    await screen.findByTestId('employee-2')

    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ ...cashier, active: false }))

    await user.click(screen.getByRole('button', { name: /deactivate cass ashier/i }))
    await user.click(await screen.findByRole('button', { name: /yes, deactivate/i }))

    await waitFor(() => expect(screen.getByTestId('employee-2')).toHaveTextContent('Inactive'))
    const deactivateCall = vi.mocked(fetch).mock.calls.find(([, init]) => init?.method === 'PATCH')
    expect(deactivateCall?.[0]).toBe(`${BASE_URL}/api/employees/2/deactivate`)
  })

  it('lets the owner reactivate a deactivated employee, calling the reactivate endpoint', async () => {
    const user = userEvent.setup()
    mockInitialLoad([cook])

    render(<EmployeeManager apiBaseUrl={BASE_URL} authToken="owner-token" />)
    await screen.findByTestId('employee-3')

    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ ...cook, active: true }))

    await user.click(screen.getByRole('button', { name: /reactivate casey cook/i }))

    await waitFor(() => expect(screen.getByTestId('employee-3')).toHaveTextContent('Active'))
    const reactivateCall = vi.mocked(fetch).mock.calls.find(([, init]) => init?.method === 'PATCH')
    expect(reactivateCall?.[0]).toBe(`${BASE_URL}/api/employees/3/reactivate`)
  })

  it('surfaces the backend error clearly when self-deactivation is refused (422)', async () => {
    const user = userEvent.setup()
    mockInitialLoad([owner])

    render(<EmployeeManager apiBaseUrl={BASE_URL} authToken="owner-token" />)
    await screen.findByTestId('employee-1')

    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(
        { message: 'The given data was invalid.', errors: { user: ['You cannot deactivate your own account.'] } },
        { status: 422 },
      ),
    )

    await user.click(screen.getByRole('button', { name: /deactivate olive owner/i }))
    await user.click(await screen.findByRole('button', { name: /yes, deactivate/i }))

    expect(await screen.findByText(/you cannot deactivate your own account/i)).toBeInTheDocument()
    // The employee must still show as active -- the deactivation was rejected, not applied.
    expect(screen.getByTestId('employee-1')).toHaveTextContent('Active')
  })

  it('surfaces the backend error clearly when deactivating the last active Owner is refused (422)', async () => {
    const user = userEvent.setup()
    mockInitialLoad([owner, cashier])

    render(<EmployeeManager apiBaseUrl={BASE_URL} authToken="owner-token" />)
    await screen.findByTestId('employee-1')

    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(
        { message: 'The given data was invalid.', errors: { user: ['Cannot deactivate the last remaining active Owner.'] } },
        { status: 422 },
      ),
    )

    await user.click(screen.getByRole('button', { name: /deactivate olive owner/i }))
    await user.click(await screen.findByRole('button', { name: /yes, deactivate/i }))

    expect(await screen.findByText(/cannot deactivate the last remaining active owner/i)).toBeInTheDocument()
  })
})
