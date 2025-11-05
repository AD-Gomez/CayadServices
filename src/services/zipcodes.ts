export interface ZipApiItem {
    city: string;
    state?: string;
    zip_code?: string;
    [k: string]: any;
}

export interface ZipResult {
    label: string;
    city: string;
    state?: string;
    zip?: string;
    raw: ZipApiItem;
}

const BASE = import.meta.env.PUBLIC_ZIPCODES_API_BASE;

export async function searchZipcodes(
    q: string,
    signal?: AbortSignal
): Promise<ZipResult[]> {
    if (!q || q.length < 2) return [];

    // If a BASE is provided use it, otherwise fall back to a relative
    // endpoint so the client can call the local /api/zipcodes/ route.
    let res: Response;
    if (BASE) {
        const url = new URL("/api/zipcodes/", BASE);
        url.searchParams.set("search", q);
        try { console.debug('[searchZipcodes] proxy fetch', url.toString()); } catch (_) {}
        res = await fetch(url.toString(), { signal });
    } else {
        const url = `/api/zipcodes/?search=${encodeURIComponent(q)}`;
        try { console.debug('[searchZipcodes] local fetch', url); } catch (_) {}
        res = await fetch(url, { signal });
    }

    if (!res.ok) return [];

    const data = await res.json();
    const arr: ZipApiItem[] = Array.isArray(data) ? data : data?.results ?? [];

    return arr
        .map((it) => {
            const city = String(it.city ?? "").trim();
            const state = String(it.state ?? "").trim();
            const zip = String(it.zip_code ?? "").trim();
            const label = [city, state].filter(Boolean).join(", ") + (zip ? ` ${zip}` : "");
            return { label, city, state, zip, raw: it };
        })
        .filter((r) => r.city);
}
