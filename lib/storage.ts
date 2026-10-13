import type { Entry } from "./types";

const KEY = "hourproof:v1:entries";

let memory: Entry[] = [];
let available: boolean | null = null;

/** True when entries can be kept on this device. */
export function storageAvailable(): boolean {
  if (available !== null) return available;
  try {
    const probe = "hourproof:probe";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    available = true;
  } catch {
    available = false;
  }
  return available;
}

export function loadEntries(): Entry[] {
  if (!storageAvailable()) return memory;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Entry[]) : [];
  } catch {
    return memory;
  }
}

export function saveEntries(entries: Entry[]): void {
  memory = entries;
  if (!storageAvailable()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    // Storage full or blocked: keep the session copy in memory.
  }
}

export function addEntry(entry: Entry): void {
  saveEntries([...loadEntries(), entry]);
}

export function updateEntry(entry: Entry): void {
  saveEntries(loadEntries().map((e) => (e.id === entry.id ? entry : e)));
}

export function removeEntry(id: string): void {
  saveEntries(loadEntries().filter((e) => e.id !== id));
}

export function clearSample(): void {
  saveEntries(loadEntries().filter((e) => !e.sample));
}

export function clearAll(): void {
  saveEntries([]);
}
