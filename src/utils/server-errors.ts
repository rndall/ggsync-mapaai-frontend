type ServerErrorPayload = {
  message?: unknown
  errors?: unknown
}

// Laravel validation failures arrive as `{ errors: { field: [...] } }`.
export function getFieldErrors(error: unknown): Record<string, string[]> {
  if (typeof error !== 'object' || error === null) return {}
  const { errors } = error as ServerErrorPayload
  if (typeof errors !== 'object' || errors === null) return {}
  return errors as Record<string, string[]>
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
    const { message } = error as ServerErrorPayload
    if (typeof message === 'string' && message.length > 0) return message
  }
  return fallback
}

export function toFieldErrors(
  serverErrors: Record<string, string[]>,
  key: string,
): Array<{ message: string }> {
  return (serverErrors[key] ?? []).map((message) => ({ message }))
}
