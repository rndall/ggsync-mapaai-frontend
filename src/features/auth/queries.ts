import { $api } from '@/lib/api'

export const authQueries = {
  currentUser: () => $api.queryOptions('get', '/me'),
}
