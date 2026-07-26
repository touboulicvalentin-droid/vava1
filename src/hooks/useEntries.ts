import { useCallback, useEffect, useState } from "react";
import type { Entry, NewEntry } from "@/types";
import { deleteEntry, insertEntry, loadEntries, updateEntry } from "@/lib/entriesRepo";

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const rows = await loadEntries();
        if (active) setEntries(rows);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "load failed");
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const add = useCallback(async (e: NewEntry): Promise<Entry | null> => {
    const row = await insertEntry(e);
    if (row) setEntries((prev) => [...prev, row]);
    return row;
  }, []);

  const update = useCallback(async (id: string, patch: Partial<NewEntry>): Promise<void> => {
    const row = await updateEntry(id, patch);
    if (row) setEntries((prev) => prev.map((x) => (x.id === id ? row : x)));
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    await deleteEntry(id);
    setEntries((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return { entries, loaded, error, add, update, remove };
}
