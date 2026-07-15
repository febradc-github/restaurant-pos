import { useMemo, useState } from 'react'
import { Alert, Button, Card, Form, Input, Typography } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { createAuthApi } from '../api/auth'
import type { AuthSession } from '../types/auth'
import './Login.css'

export interface LoginProps {
  /** Backend origin. Defaults to VITE_API_BASE_URL / localhost. */
  apiBaseUrl?: string
  /** Called with the resulting session once the login call succeeds. */
  onLogin: (session: AuthSession) => void
}

interface LoginFormValues {
  identifier: string
  password: string
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

/**
 * Login screen shared by Owner, Cashier and Server -- there's no separate
 * signup or role picker; the backend's /api/login response carries the
 * role, and the caller (App) decides which authenticated route to send the
 * session to from it.
 */
export function Login({ apiBaseUrl, onLogin }: LoginProps) {
  const api = useMemo(() => createAuthApi({ baseUrl: apiBaseUrl }), [apiBaseUrl])

  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleFinish(values: LoginFormValues) {
    setError(null)
    setSubmitting(true)
    try {
      const session = await api.login(values.identifier, values.password)
      onLogin(session)
    } catch (err) {
      setError(errorMessage(err, 'Login failed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login">
      <Card className="login__card">
        <Typography.Title level={2}>Log in</Typography.Title>

        {error && <Alert className="login__error" type="error" message={error} showIcon />}

        <Form<LoginFormValues> layout="vertical" requiredMark={false} onFinish={handleFinish}>
          <Form.Item label="Email" name="identifier" rules={[{ required: true, message: 'Email is required' }]}>
            <Input size="large" autoComplete="username" prefix={<UserOutlined />} disabled={submitting} />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input.Password
              size="large"
              autoComplete="current-password"
              prefix={<LockOutlined />}
              disabled={submitting}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={submitting}
              disabled={submitting}
            >
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Login
