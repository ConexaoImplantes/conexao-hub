import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Expose-Headers": "content-disposition, content-type, content-length",
};

function extractDriveId(url: string): string | null {
  const m1 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m1) return m1[1];
  const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m2) return m2[1];
  return null;
}

async function fetchDrive(id: string): Promise<Response> {
  const base = `https://drive.google.com/uc?export=download&id=${id}`;
  // First request
  let res = await fetch(base, { redirect: "follow" });
  const ct = res.headers.get("content-type") || "";
  // If HTML, we hit the virus-scan/confirm interstitial
  if (ct.includes("text/html")) {
    const html = await res.text();
    // Newer confirm token pattern: name="confirm" value="XYZ" or ?confirm=XYZ
    const tokenMatch =
      html.match(/name=\"confirm\"\s+value=\"([^\"]+)\"/) ||
      html.match(/confirm=([0-9A-Za-z_-]+)/);
    const uuidMatch = html.match(/name=\"uuid\"\s+value=\"([^\"]+)\"/);
    const token = tokenMatch?.[1] ?? "t";
    let confirmUrl = `${base}&confirm=${token}`;
    if (uuidMatch) confirmUrl += `&uuid=${uuidMatch[1]}`;
    res = await fetch(confirmUrl, { redirect: "follow" });
  }
  return res;
}

function guessFilename(url: string, headers: Headers, fallback: string): string {
  const cd = headers.get("content-disposition");
  if (cd) {
    const m = cd.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
    if (m) {
      try {
        return decodeURIComponent(m[1]);
      } catch {
        return m[1];
      }
    }
  }
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").filter(Boolean).pop();
    if (last && last.includes(".")) return last;
  } catch { /* ignore */ }
  return fallback;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const u = new URL(req.url);
    const target = u.searchParams.get("url");
    const filenameParam = u.searchParams.get("filename") || "material";
    if (!target) {
      return new Response(JSON.stringify({ error: "url is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Basic allowlist: only http/https
    let parsed: URL;
    try {
      parsed = new URL(target);
    } catch {
      return new Response(JSON.stringify({ error: "invalid url" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!/^https?:$/.test(parsed.protocol)) {
      return new Response(JSON.stringify({ error: "unsupported protocol" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle Google Drive specifically (interstitial + virus-scan bypass)
    const driveId = parsed.hostname.includes("google") ? extractDriveId(target) : null;
    const upstream = driveId ? await fetchDrive(driveId) : await fetch(target, { redirect: "follow" });

    if (!upstream.ok || !upstream.body) {
      const txt = await upstream.text().catch(() => "");
      return new Response(
        JSON.stringify({ error: "upstream failed", status: upstream.status, details: txt.slice(0, 500) }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    const contentLength = upstream.headers.get("content-length");
    const filename = guessFilename(target, upstream.headers, filenameParam);
    const safeName = filename.replace(/[\r\n"\\]/g, "_");

    const headers: Record<string, string> = {
      ...corsHeaders,
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(safeName)}`,
      "Cache-Control": "no-store",
    };
    if (contentLength) headers["Content-Length"] = contentLength;

    return new Response(upstream.body, { status: 200, headers });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e?.message ?? "unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
