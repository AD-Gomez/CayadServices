import { useEffect, useMemo, useState } from 'react';

export type Option = { value: string; label: string };

type Fetcher = (params: Record<string, string>) => Promise<Option[]>;

const globalCache = new Map<string, Option[]>();

export function useAsyncOptions(
  fetcher: Fetcher,
  params: Record<string, string>,
  { delay = 250, minLength = 0 }: { delay?: number; minLength?: number } = {}
) {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const key = useMemo(() => {
    const p = new URLSearchParams(params).toString();
    return `${p}`;
  }, [params]);

  useEffect(() => {
    const search = params.search?.trim() ?? '';
    if (search.length < minLength) {
      setOptions([]);
      setLoading(false);
      setError(null);
      return;
    }

    if (globalCache.has(key)) {
      setOptions(globalCache.get(key)!);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetcher(params);
        if (!controller.signal.aborted) {
          globalCache.set(key, res);
          setOptions(res);
        }
      } catch (e) {
        if (!controller.signal.aborted) setError(e);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, delay);

    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [key]);

  return { options, loading, error };
}
