const AUTH_PATHS = new Set(['/login', '/register'])

/**
 * Validates the `redirect` search param carried on auth routes.
 * Only internal paths are allowed; anything else falls back to `/`.
 */
export function getReturnPath(redirect: string | undefined): string {
  if (!redirect || !redirect.startsWith('/') || redirect.startsWith('//')) {
    return '/'
  }

  if (redirect.includes('\\')) {
    return '/'
  }

  const [pathname = '/'] = redirect.split(/[?#]/)
  const normalized =
    pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname

  if (AUTH_PATHS.has(normalized)) {
    return '/'
  }

  return redirect
}
