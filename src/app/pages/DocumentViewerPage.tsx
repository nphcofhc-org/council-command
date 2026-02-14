import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ArrowLeft, ExternalLink, Download, FileText, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

type ViewerKind = "pdf" | "image" | "docx" | "xlsx" | "unknown";

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
    if (ext === "xlsx") return "xlsx";
    return "unknown";
  }, [ext]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docxHtml, setDocxHtml] = useState<string>("");
  const [sheets, setSheets] = useState<{ name: string; rows: (string | number | null)[][] }[]>([]);

  useEffect(() => {
    setError(null);
    setDocxHtml("");
    setSheets([]);

    if (!abs.ok) return;
    if (kind !== "docx" && kind !== "xlsx") return;

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

        if (kind === "xlsx") {
          const XLSX = await import("xlsx");
          const wb = XLSX.read(buf, { type: "array" });
          const next: { name: string; rows: (string | number | null)[][] }[] = [];
          for (const sheetName of wb.SheetNames.slice(0, 12)) {
            const ws = wb.Sheets[sheetName];
            if (!ws) continue;
            const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true }) as any[];
            const normalized = rows
              .slice(0, 500)
              .map((r) => (Array.isArray(r) ? r.slice(0, 50) : []))
              .map((r) => r.map((cell) => (cell === undefined ? null : cell)));
            next.push({ name: sheetName, rows: normalized });
          }
          if (cancelled) return;
          setSheets(next);
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
    <div className="bg-white">
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
            <Button variant="outline" className="gap-2" onClick={back}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-widest text-gray-500">Document Viewer</p>
              <h1 className="text-base sm:text-lg font-extrabold text-black truncate">{name}</h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {originalHref ? (
              <>
                <Button asChild variant="outline" className="gap-2">
                  <a href={originalHref} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-4" />
                    Open Original
                  </a>
                </Button>
                <Button asChild variant="outline" className="gap-2">
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
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>Preview Unavailable</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700">{abs.reason}</CardContent>
          </Card>
        ) : (
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {kind === "image" ? <ImageIcon className="size-5" /> : <FileText className="size-5" />}
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error ? <p className="text-sm text-red-700">{error}</p> : null}
              {loading ? <p className="text-sm text-gray-500">Loading preview…</p> : null}

              {kind === "pdf" ? (
                <iframe
                  title={name}
                  src={abs.url}
                  className="w-full h-[75vh] rounded-lg border border-gray-100"
                />
              ) : null}

              {kind === "image" ? (
                <div className="w-full overflow-auto rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <img src={abs.url} alt={name} className="max-w-full h-auto" />
                </div>
              ) : null}

              {kind === "docx" ? (
                docxHtml ? (
                  <div
                    className="docx-preview rounded-lg border border-gray-100 bg-white p-4"
                    // mammoth generates HTML; we only use this for council-owned docs.
                    dangerouslySetInnerHTML={{ __html: docxHtml }}
                  />
                ) : null
              ) : null}

              {kind === "xlsx" ? (
                sheets.length ? (
                  <Tabs defaultValue={sheets[0]?.name || "sheet"} className="space-y-3">
                    <TabsList className="bg-white border border-gray-200 w-full sm:w-auto flex-wrap justify-start">
                      {sheets.map((s) => (
                        <TabsTrigger key={s.name} value={s.name} className="text-xs sm:text-sm">
                          {s.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {sheets.map((s) => (
                      <TabsContent key={s.name} value={s.name}>
                        <div className="overflow-auto rounded-lg border border-gray-100">
                          <table className="min-w-full text-sm">
                            <tbody>
                              {s.rows.map((row, rIdx) => (
                                <tr key={rIdx} className={rIdx === 0 ? "bg-gray-50" : ""}>
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="border-b border-r border-gray-100 px-3 py-2 align-top">
                                      {cell === null ? "" : String(cell)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <p className="mt-2 text-xs text-gray-400">
                          Showing up to 500 rows x 50 columns for performance.
                        </p>
                      </TabsContent>
                    ))}
                  </Tabs>
                ) : null
              ) : null}

              {kind === "unknown" ? (
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
                  This file type can’t be previewed in the portal yet. Use “Open Original” or “Download”.
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}

        <div className="text-xs text-gray-400">
          Tip: If PDFs are downloading instead of opening, check your browser setting for “Download PDF files instead of opening”.
        </div>
      </div>
    </div>
  );
}
