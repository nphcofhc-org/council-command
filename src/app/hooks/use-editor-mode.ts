import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "nphc-editor-mode";

function readStored(): boolean {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "true";
  } catch {
    return false;
  }
}

export function useEditorMode() {
  const [editorMode, setEditorModeState] = useState(false);

  useEffect(() => {
    setEditorModeState(readStored());
  }, []);

  const setEditorMode = useCallback((value: boolean) => {
    setEditorModeState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value ? "true" : "false");
    } catch {
      // ignore
    }
  }, []);

  const toggleEditorMode = useCallback(() => {
    setEditorMode(!editorMode);
  }, [editorMode, setEditorMode]);

  return { editorMode, setEditorMode, toggleEditorMode };
}

