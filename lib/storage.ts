"use client";

import { useSyncExternalStore } from "react";
import { todayISO } from "./dates";
import type { Entry } from "./types";

const KEY = "hourproof:v1:entries";

let memory: Entry[] = [];
let available: boolean | null = null;
let snapshot: Entry[] | null = null;
const listeners = new Set<() => void>();

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

function read(): Entry[] {
  if (!storageAvailable()) return memory;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Entry[]) : [];
  } catch {
    return memory;
  }
}

export function loadEntries(): Entry[] {
  if (snapshot === null) snapshot = read();
  return snapshot;
}

export function saveEntries(entries: Entry[]): void {
  memory = entries;
  snapshot = entries;
  if (storageAvailable()) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(entries));
    } catch {
      // Storage full or blocked: keep the session copy in memory.
    }
  }
  listeners.forEach((l) => l());
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

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Another tab changed the entries: re-read on next snapshot.
  const onStorage = (ev: StorageEvent) => {
    if (ev.key === KEY) {
      snapshot = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Saved entries, or null while rendering on the server. */
export function useEntries(): Entry[] | null {
  return useSyncExternalStore(subscribe, loadEntries, () => null);
}

const noop = () => () => {};

/** False when this browser blocks saving (private mode, blocked site data). */
export function useStorageAvailable(): boolean {
  return useSyncExternalStore(noop, storageAvailable, () => true);
}

/** The device's own date as YYYY-MM-DD, or null while rendering on the server. */
export function useToday(): string | null {
  return useSyncExternalStore(noop, todayISO, () => null);
}
