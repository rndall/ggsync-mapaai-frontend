import { infiniteQueryOptions } from '@tanstack/react-query'

import { $api, fetchClient } from '@/lib/api'
import type { operations } from '@/types/api'

export type MatchListFilters = NonNullable<
  operations['match.index']['parameters']['query']
>

export const mapQueries = {
  list: () => $api.queryOptions('get', '/maps'),
}

export const matchQueries = {
  list: (filters?: MatchListFilters) =>
    $api.queryOptions('get', '/matches', { params: { query: filters } }),  detail: (id: number) =>
    $api.queryOptions('get', '/matches/{match}', {
      params: { path: { match: id } },
    }),
  lists: () => matchQueries.list().queryKey.slice(0, 2),
  infiniteList: (filters?: Omit<MatchListFilters, 'pagination'>) => {
    // Shared by the queryKey and the queryFn so the backend actually returns
    // cursor pagination. Without `pagination: 'cursor'` it defaults to page
    // pagination (no `next_cursor`), `hasNextPage` stays false, and the
    // infinite-scroll sentinel never fetches more.
    const baseQuery = { ...filters, pagination: 'cursor' as const }
    return infiniteQueryOptions({
      queryKey: [...matchQueries.lists(), baseQuery],
      queryFn: async ({ pageParam }) => {
        const { data, error } = await fetchClient.GET('/matches', {
          params: {
            query: {
              ...baseQuery,
              // Omit the cursor on the first page: the backend requires a
              // non-empty cursor when `pagination=cursor`, so sending
              // `cursor=` would fail validation with a 422.
              ...(pageParam ? { cursor: pageParam } : {}),
            },
          },
        })
        if (error) throw error
        return data
      },
      initialPageParam: '',
      getNextPageParam: (lastPage) => {
        const { pagination } = lastPage.data
        if ('next_cursor' in pagination)
          return pagination.next_cursor ?? undefined
        return undefined
      },
    })
  },
}
