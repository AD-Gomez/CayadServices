import { useEffect, useRef, useState } from 'react'

export function useDebouncedQuery<T>(fn: () => Promise<T>, deps: any[], delay = 250) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<unknown>(null)
  const timer = useRef<number | null>(null)
  const alive = useRef(true)

  useEffect(() => () => { alive.current = false }, [])

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(async () => {
      setLoading(true)
      setErr(null)
      try {
        const res = await fn()
        if (alive.current) setData(res)
      } catch (e) {
        if (alive.current) setErr(e)
      } finally {
        if (alive.current) setLoading(false)
      }
    }, delay)
    return () => { if (timer.current) window.clearTimeout(timer.current) }
  }, deps)

  return { data, loading, error: err }
}
