import { useQuery, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";

/**
 * @param queryFn - Hàm gọi API trả về Promise
 * @param queryKey - Query key
 * @param options - Các tùy chọn khác cho useQuery
 */

export default function useMyQuery<TData = unknown>({
  queryFn,
  queryKey,
  options,
}: {
  queryFn: () => Promise<TData>;
  queryKey: string | unknown[];
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>;
}): UseQueryResult<TData> {
  return useQuery<TData>({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn,
    ...options,
  });
}
