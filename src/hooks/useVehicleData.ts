import { useMemo } from 'react'
import { useDebouncedQuery } from './useDebouncedQuery'

const BASE = '/api/vehicles'

export function useVehicleMakes(search: string) {
  const url = useMemo(() => {
    const s = search?.trim()
    return s ? `${BASE}/makes?search=${encodeURIComponent(s)}` : `${BASE}/makes`
  }, [search])

  return useDebouncedQuery(async () => {
    const r = await fetch(url)
    if (!r.ok) throw new Error('Failed to fetch makes')
    return (await r.json()) as { value: string, label: string }[]
  }, [url], 250)
}

export function useVehicleModels(make?: string, search?: string) {
  const url = useMemo(() => {
    if (!make) return null
    const params = new URLSearchParams({ make })
    if (search?.trim()) params.set('search', search.trim())
    return `${BASE}/models?${params.toString()}`
  }, [make, search])

  return useDebouncedQuery(async () => {
    if (!url) return []
    const r = await fetch(url)
    if (!r.ok) throw new Error('Failed to fetch models')
    return (await r.json()) as { value: string, label: string }[]
  }, [url], 250)
}
