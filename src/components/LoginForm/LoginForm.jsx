import './LoginForm.css'

function LoginForm({
  identifier,
  password,
  loginError,
  isLoggingIn,
  onIdentifierChange,
  onPasswordChange,
  onSubmit,
}) {
  return (
    <main className="login-form-page">
      <form className="login-form-card" onSubmit={onSubmit}>
        <h1>Logon</h1>
        <p className="login-form-subtitle">Sign in to access ADS.</p>

        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          value={identifier}
          onChange={(event) => onIdentifierChange(event.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          required
        />

        {loginError ? (
          <p className="status error" role="alert">
            {loginError}
          </p>
        ) : null}

        <button type="submit" disabled={isLoggingIn}>
          {isLoggingIn ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}

export default LoginForm
