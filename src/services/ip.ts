/**
 * Get the client's public IP address from the browser.
 * - Uses multiple providers with a small timeout.
 * - Never throws: returns null on failure so the caller can continue.
 */
export async function getPublicIP(options: { timeoutMs?: number } = {}): Promise<string | null> {
  const { timeoutMs = 2500 } = options;

  if (typeof fetch === "undefined") return null;

  const controllers: AbortController[] = [];
  const withTimeout = (url: string) => {
    const ctl = new AbortController();
    controllers.push(ctl);
    const t = setTimeout(() => ctl.abort("timeout"), timeoutMs);
    return fetch(url, { signal: ctl.signal })
      .finally(() => clearTimeout(t));
  };

  try {
    // Try JSON providers first
    const providers = [
      "https://api.ipify.org?format=json",
      "https://api64.ipify.org?format=json",
      "https://ipapi.co/json/",
    ];

    for (const p of providers) {
      try {
        const r = await withTimeout(p);
        if (!r.ok) continue;
        const data = await r.json().catch(() => null as any);
        const ip = data?.ip || data?.query || null;
        if (typeof ip === "string" && ip.length > 3) return ip;
      } catch (_) {
        // try next provider
      }
    }

    // Fallback: plain text providers
    const textProviders = [
      "https://ipv4.icanhazip.com/",
      "https://ifconfig.me/ip",
      "https://checkip.amazonaws.com/",
      "https://ident.me/",
    ];
    for (const p of textProviders) {
      try {
        const r = await withTimeout(p);
        if (!r.ok) continue;
        const ip = (await r.text()).trim();
        if (ip && /\d+\.\d+\.\d+\.\d+|:[a-fA-F0-9]/.test(ip)) return ip;
      } catch (_) {
        // keep trying
      }
    }

    return null;
  } finally {
    // Clean up timeouts if any pending
    for (const c of controllers) {
      try { c.abort(); } catch {}
    }
  }
}
