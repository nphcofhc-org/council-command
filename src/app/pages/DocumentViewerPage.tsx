import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ArrowLeft, ExternalLink, Download, FileText, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
// Note: tabs used to render spreadsheet previews. We intentionally removed XLSX preview due to upstream security advisories.

type ViewerKind = "pdf" | "image" | "docx" | "html" | "unknown";

function getExt(path: string): string {
  const clean = path.split("#")[0]?.split("?")[0] || path;
  const parts = clean.split(".");
  return (parts.length > 1 ? parts[parts.length - 1] : "").toLowerCase();
}

function getBasename(path: string): string {
  const clean = path.split("#")[0]?.split("?")[0] || path;
  const parts = clean.split("/");
  return parts[parts.length - 1] || clean;
}

function toAbsoluteSameOriginUrl(input: string): { ok: true; url: string } | { ok: false; reason: string } {
  const raw = String(input || "").trim();
  if (!raw) return { ok: false, reason: "Missing src parameter." };

  let u: URL;
  try {
    // Allow relative paths like "/docs/file.docx".
    u = new URL(raw, window.location.origin);
  } catch {
    return { ok: false, reason: "Invalid document URL." };
  }

  // Keep it same-origin so Cloudflare Access cookies work for fetch/preview.
  if (u.origin !== window.location.origin) {
    return { ok: false, reason: "External documents can’t be previewed here. Use Open Original." };
  }

  return { ok: true, url: u.toString() };
}

export function DocumentViewerPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const src = new URLSearchParams(location.search || "").get("src") || "";

  const abs = useMemo(() => toAbsoluteSameOriginUrl(src), [src]);
  const ext = useMemo(() => getExt(src), [src]);
  const name = useMemo(() => getBasename(src), [src]);

  const kind: ViewerKind = useMemo(() => {
    if (ext === "pdf") return "pdf";
    if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext)) return "image";
    if (ext === "docx") return "docx";
    if (ext === "html" || ext === "htm") return "html";
    return "unknown";
  }, [ext]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docxHtml, setDocxHtml] = useState<string>("");

  useEffect(() => {
    setError(null);
    setDocxHtml("");

    if (!abs.ok) return;
    if (kind !== "docx") return;

    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch(abs.url, { credentials: "include" });
        if (!res.ok) throw new Error(`Failed to load document (${res.status}).`);
        const buf = await res.arrayBuffer();
        if (cancelled) return;

        if (kind === "docx") {
          // mammoth has a browser build; load only when needed.
          const mammoth = await import("mammoth/mammoth.browser");
          const out = await mammoth.convertToHtml({ arrayBuffer: buf });
          if (cancelled) return;
          setDocxHtml(out?.value || "");
        }

      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to preview document.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [abs, kind]);

  const back = () => {
    // If this is the first page in the tab, fall back to resources.
    if (window.history.length <= 1) navigate("/resources");
    else navigate(-1);
  };

  const originalHref = src || "";

  return (
    <div className="relative">
      <style>{`
        .docx-preview h1, .docx-preview h2, .docx-preview h3 {
          font-weight: 800;
          letter-spacing: -0.02em;
          margin: 18px 0 10px;
          color: #000;
        }
        .docx-preview h1 { font-size: 22px; }
        .docx-preview h2 { font-size: 18px; }
        .docx-preview h3 { font-size: 15px; }
        .docx-preview p { margin: 10px 0; color: #111; line-height: 1.55; }
        .docx-preview ul, .docx-preview ol { margin: 10px 0 10px 22px; color: #111; }
        .docx-preview li { margin: 6px 0; }
        .docx-preview table { border-collapse: collapse; margin: 12px 0; width: 100%; }
        .docx-preview td, .docx-preview th { border: 1px solid #e5e7eb; padding: 8px; vertical-align: top; }
      `}</style>

      <div className="mx-auto max-w-6xl p-4 sm:p-8 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="outline"
              className="gap-2 border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10"
              onClick={back}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-widest text-slate-500">Document Viewer</p>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 truncate">{name}</h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {originalHref ? (
              <>
                <Button asChild variant="outline" className="gap-2 border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10">
                  <a href={originalHref} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-4" />
                    Open Original
                  </a>
                </Button>
                <Button asChild variant="outline" className="gap-2 border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10">
                  <a href={originalHref} download>
                    <Download className="size-4" />
                    Download
                  </a>
                </Button>
              </>
            ) : null}
          </div>
        </div>

        {!abs.ok ? (
          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Preview Unavailable</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">{abs.reason}</CardContent>
          </Card>
        ) : (
          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {kind === "image" ? <ImageIcon className="size-5" /> : <FileText className="size-5" />}
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error ? <p className="text-sm text-rose-300">{error}</p> : null}
              {loading ? <p className="text-sm text-slate-500">Loading preview…</p> : null}

              {kind === "pdf" ? (
                <iframe
                  title={name}
                  src={abs.url}
                  className="w-full h-[75vh] rounded-lg border border-black/10 bg-white/55"
                />
              ) : null}

              {kind === "html" ? (
                <iframe
                  title={name}
                  src={abs.url}
                  className="w-full h-[75vh] rounded-lg border border-black/10 bg-white/55"
                />
              ) : null}

              {kind === "image" ? (
                <div className="w-full overflow-auto rounded-lg border border-black/10 bg-white/5 p-3">
                  <img src={abs.url} alt={name} className="max-w-full h-auto" />
                </div>
              ) : null}

              {kind === "docx" ? (
                docxHtml ? (
                  <div
                    className="docx-preview rounded-lg border border-black/10 bg-white p-4"
                    // mammoth generates HTML; we only use this for council-owned docs.
                    dangerouslySetInnerHTML={{ __html: docxHtml }}
                  />
                ) : null
              ) : null}

              {kind === "unknown" ? (
                <div className="rounded-lg border border-black/10 bg-white/5 p-4 text-sm text-slate-600">
                  This file type can’t be previewed in the portal yet. Use “Open Original” or “Download”.
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}

        <div className="text-xs text-slate-400">
          Tip: If PDFs are downloading instead of opening, check your browser setting for “Download PDF files instead of opening”.
        </div>
      </div>
    </div>
  );
}
