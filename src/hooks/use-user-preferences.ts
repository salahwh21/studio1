'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { api } from '@/lib/api';

export type UserPreferences = {
  ordersTableColumns?: string[];
  exportFields?: string[];
  savedFilters?: unknown[];
  aiConfig?: unknown;
  integrations?: unknown[];
  theme?: unknown;
};

type Status = 'idle' | 'loading' | 'ready' | 'error';

// Singleton cache: loaded once per session for all hook instances
let cache: UserPreferences | null = null;
let loadPromise: Promise<UserPreferences> | null = null;
const subscribers = new Set<() => void>();

function notify() {
  subscribers.forEach(fn => fn());
}

async function loadOnce(): Promise<UserPreferences> {
  if (cache !== null) return cache;
  if (loadPromise) return loadPromise;
  loadPromise = api.getPreferences()
    .then((data: UserPreferences) => {
      cache = data ?? {};
      notify();
      return cache;
    })
    .catch(() => {
      cache = {};
      loadPromise = null;
      notify();
      return cache as UserPreferences;
    });
  return loadPromise;
}

// Debounced save — groups rapid updates into one API call
let saveTimer: ReturnType<typeof setTimeout> | null = null;
const pendingPatch: UserPreferences = {};

function scheduleSave(patch: Partial<UserPreferences>) {
  Object.assign(pendingPatch, patch);
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    const toSave = { ...pendingPatch };
    Object.keys(pendingPatch).forEach(k => delete (pendingPatch as any)[k]);
    saveTimer = null;
    try {
      await api.savePreferences(toSave as Record<string, unknown>);
    } catch {
      // silent — next change will retry
    }
  }, 600);
}

export function useUserPreferences() {
  const [status, setStatus] = useState<Status>('idle');
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const refresh = () => {
      if (mounted.current) setStatus(s => s === 'idle' ? 'loading' : s);
    };
    subscribers.add(refresh);

    if (cache !== null) {
      setStatus('ready');
    } else {
      setStatus('loading');
      loadOnce().then(() => {
        if (mounted.current) setStatus('ready');
      });
    }

    return () => {
      mounted.current = false;
      subscribers.delete(refresh);
    };
  }, []);

  const get = useCallback(<K extends keyof UserPreferences>(key: K): UserPreferences[K] | undefined => {
    return cache?.[key];
  }, []);

  const set = useCallback(<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    if (!cache) cache = {};
    cache[key] = value;
    notify();
    scheduleSave({ [key]: value });
  }, []);

  return { get, set, status, isReady: status === 'ready' };
}
