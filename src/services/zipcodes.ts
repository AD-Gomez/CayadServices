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

const BASE =
    import.meta.env.PUBLIC_ZIPCODES_API_BASE

export async function searchZipcodes(
    q: string,
    signal?: AbortSignal
): Promise<ZipResult[]> {
    if (!q || q.length < 2) return [];

    const url = new URL("/api/zipcodes/", BASE);
    url.searchParams.set("search", q);

    const res = await fetch(url.toString(), { signal });
    if (!res.ok) return [];

    const data = await res.json();
    const arr: ZipApiItem[] = Array.isArray(data) ? data : data?.results ?? [];

    return arr
        .map((it) => {
            const city = String(it.city ?? "").trim();
            const state = String(it.state ?? "").trim();
            const zip = String(it.zip_code ?? "").trim();
            const label =
                [city, state].filter(Boolean).join(", ") + (zip ? ` ${zip}` : "");
            return { label, city, state, zip, raw: it };
        })
        .filter((r) => r.city)
}
