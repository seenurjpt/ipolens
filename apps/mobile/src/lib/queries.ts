import {
  IpoDetailResponse,
  IpoListResponse,
  RecentListingsResponse,
  RegistrarResponse,
  ReportResponse,
  SubscriptionResponse,
  type Board,
  type IpoSort,
  type IpoStatus,
  type RegistrarCode,
} from '@ipolens/shared';
import { keepPreviousData, useInfiniteQuery, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
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
    placeholderData: keepPreviousData,
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
    placeholderData: keepPreviousData,
  });
}

const ipoQuery = (slug: string) => ({
  queryKey: ['ipo', slug],
  queryFn: () => apiGet(`/v1/ipos/${encodeURIComponent(slug)}`, IpoDetailResponse),
});

export function useIpo(slug: string) {
  return useQuery(ipoQuery(slug));
}

/**
 * Starts loading an IPO's detail when a finger touches its card, so the data is usually there
 * by the time the next screen has faded in.
 */
export function usePrefetchIpo() {
  const client = useQueryClient();
  return useCallback((slug: string) => void client.prefetchQuery({ ...ipoQuery(slug), staleTime: 60_000 }), [client]);
}

/** Details of several IPOs at once (e.g. every IPO the user applied for), keyed by slug. */
export function useIposBySlug(slugs: string[]) {
  return useQueries({
    queries: slugs.map(ipoQuery),
    combine: (results) => ({
      bySlug: new Map(results.flatMap((r) => (r.data ? [[r.data.ipo.slug, r.data.ipo] as const] : []))),
      isPending: results.some((r) => r.isPending),
      isError: results.some((r) => r.isError),
      refetch: () => Promise.all(results.map((r) => r.refetch())),
    }),
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

/** Allotment page and allowed hosts for the registrar WebView. Changes rarely. */
export function useRegistrar(code: RegistrarCode | undefined) {
  return useQuery({
    queryKey: ['registrar', code],
    queryFn: () => apiGet(`/v1/registrars/${code}`, RegistrarResponse),
    enabled: !!code,
    staleTime: 3_600_000,
  });
}
