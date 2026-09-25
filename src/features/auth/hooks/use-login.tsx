import { $api, setAuthToken } from '@/lib/api'

export function useLogin() {
  return $api.useMutation('post', '/login', {
    onSuccess(response) {
      const token = response.data.token
      if (token) {
        setAuthToken(token)
      }
    },
  })
}
