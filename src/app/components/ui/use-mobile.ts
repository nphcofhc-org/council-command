import * as React from "react";

const MOBILE_BREAKPOINT = 768;
const PREVIEW_STORAGE_KEY = "nphc-preview-device";

type PreviewDevice = "auto" | "mobile" | "desktop";

function readPreviewDevice(): PreviewDevice {
  // Don't recurse previews inside an iframe preview.
  try {
    if (window.self !== window.top) return "auto";
  } catch {
    // ignore
  }
  try {
    const raw = String(localStorage.getItem(PREVIEW_STORAGE_KEY) || "").trim();
    if (raw === "mobile" || raw === "desktop" || raw === "auto") return raw;
  } catch {
    // ignore
  }
  return "auto";
}

function writePreviewDevice(value: PreviewDevice) {
  try {
    localStorage.setItem(PREVIEW_STORAGE_KEY, value);
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event("nphc-preview-device"));
}

export function usePreviewDevice() {
  const [device, setDeviceState] = React.useState<PreviewDevice>(() => readPreviewDevice());

  React.useEffect(() => {
    const onChange = () => setDeviceState(readPreviewDevice());
    window.addEventListener("storage", onChange);
    window.addEventListener("nphc-preview-device", onChange as EventListener);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("nphc-preview-device", onChange as EventListener);
    };
  }, []);

  const setDevice = React.useCallback((value: PreviewDevice) => {
    setDeviceState(value);
    writePreviewDevice(value);
  }, []);

  return { device, setDevice };
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
