import { $api } from '@/lib/api'

export function useRegister() {
  return $api.useMutation('post', '/register')
}
