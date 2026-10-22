import {
  IpoDetailResponse,
  IpoListResponse,
  RecentListingsResponse,
  ReportResponse,
  SubscriptionResponse,
  type Board,
  type IpoSort,
  type IpoStatus,
} from '@ipolens/shared';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { ApiError, apiGet } from './api';

const LIVE_REFETCH_MS = 60_000;

export interface IpoListParams {
  status?: IpoStatus[];
  board?: Board;
  q?: string;
  sort?: IpoSort;
  pageSize?: number;
}

const listQuery = ({ status, ...rest }: IpoListParams, page: number) => ({
  ...rest,
  status: status?.join(','),
  page,
});

/** One page of IPO cards; refetches every minute while any are open for bidding. */
export function useIpoList(params: IpoListParams) {
  return useQuery({
    queryKey: ['ipos', params],
    queryFn: () => apiGet('/v1/ipos', IpoListResponse, listQuery(params, 1)),
    refetchInterval: (q) => (q.state.data?.items.some((i) => i.status === 'OPEN') ? LIVE_REFETCH_MS : false),
  });
}

/** Paged IPO cards for infinite scrolling. */
export function useIpoPages(params: IpoListParams) {
  return useInfiniteQuery({
    queryKey: ['ipos', 'pages', params],
    queryFn: ({ pageParam }) => apiGet('/v1/ipos', IpoListResponse, listQuery(params, pageParam)),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page * last.pageSize < last.total ? last.page + 1 : undefined),
  });
}

export function useIpo(slug: string) {
  return useQuery({
    queryKey: ['ipo', slug],
    queryFn: () => apiGet(`/v1/ipos/${encodeURIComponent(slug)}`, IpoDetailResponse),
  });
}

/** Live subscription; polls only while `live` (the IPO is open). */
export function useSubscription(slug: string, live: boolean) {
  return useQuery({
    queryKey: ['subscription', slug],
    queryFn: () => apiGet(`/v1/ipos/${encodeURIComponent(slug)}/subscription`, SubscriptionResponse),
    refetchInterval: live ? LIVE_REFETCH_MS : false,
  });
}

/** The published AI report, or null while it is not ready (the API answers 404). */
export function useReport(slug: string) {
  return useQuery({
    queryKey: ['report', slug],
    queryFn: async () => {
      try {
        return await apiGet(`/v1/ipos/${encodeURIComponent(slug)}/report`, ReportResponse);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
  });
}

export function useRecentListings(limit = 10) {
  return useQuery({
    queryKey: ['listings', limit],
    queryFn: () => apiGet('/v1/listings/recent', RecentListingsResponse, { limit }),
  });
}
