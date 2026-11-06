import { useEffect, useRef, useState } from 'react';

/** Zustand des Offline-Caches. „ready“ gilt nur, wenn der Service Worker bestätigt, dass ALLE Dateien im Cache liegen. */
export type OfflineState =
  | { kind: 'unsupported' }
  | { kind: 'dev' }
  | { kind: 'checking' }
  | { kind: 'preparing'; cached?: number; total?: number }
  | { kind: 'ready'; version: string }
  | { kind: 'error' };

export interface PwaInfo {
  offline: OfflineState;
  updateWaiting: boolean;
  canInstall: boolean;
  install: () => void;
  /** Neue Version aktivieren und die Seite einmal neu laden. Die Mission bleibt gespeichert. */
  applyUpdate: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

function askStatus(worker: ServiceWorker): Promise<{ ready: boolean; version: string; cached: number; total: number } | null> {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    const timer = window.setTimeout(() => resolve(null), 4000);
    channel.port1.onmessage = (e) => {
      window.clearTimeout(timer);
      resolve(e.data);
    };
    worker.postMessage({ type: 'STATUS' }, [channel.port2]);
  });
}

export function usePwa(): PwaInfo {
  const supported = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
  const dev = import.meta.env.DEV;
  const [offline, setOffline] = useState<OfflineState>(supported ? (dev ? { kind: 'dev' } : { kind: 'checking' }) : { kind: 'unsupported' });
  const [updateWaiting, setUpdateWaiting] = useState(false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const regRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  useEffect(() => {
    if (!supported || dev) return;
    let cancelled = false;
    let pollTimer: number | undefined;

    const check = async (worker: ServiceWorker | null | undefined, attempts = 0) => {
      if (cancelled || !worker) return;
      const status = await askStatus(worker);
      if (cancelled) return;
      if (status?.ready) {
        setOffline({ kind: 'ready', version: status.version });
      } else if (attempts < 30) {
        setOffline({ kind: 'preparing', cached: status?.cached, total: status?.total });
        pollTimer = window.setTimeout(() => void check(worker, attempts + 1), 2000);
      } else {
        setOffline({ kind: 'error' });
      }
    };

    navigator.serviceWorker
      .register('./sw.js')
      .then((reg) => {
        if (cancelled) return;
        regRef.current = reg;
        const track =(w: ServiceWorker | null) => {
          if (!w) return;
          w.addEventListener('statechange', () => {
            if (w.state === 'installed' && navigator.serviceWorker.controller) setUpdateWaiting(true);
            if (w.state === 'activated') void check(w);
          });
        };
        if (reg.waiting && navigator.serviceWorker.controller) setUpdateWaiting(true);
        track(reg.installing);
        reg.addEventListener('updatefound', () => track(reg.installing));
        if (reg.active) void check(reg.active);
        else setOffline({ kind: 'preparing' });
      })
      .catch(() => {
        if (!cancelled) setOffline({ kind: 'error' });
      });

    return () => {
      cancelled = true;
      if (pollTimer) window.clearTimeout(pollTimer);
    };
  }, [supported, dev]);

  return {
    offline,
    updateWaiting,
    canInstall: installEvent !== null,
    install: () => {
      if (!installEvent) return;
      void installEvent.prompt().finally(() => setInstallEvent(null));
    },
    applyUpdate: () => {
      const waiting = regRef.current?.waiting;
      if (!waiting) {
        window.location.reload();
        return;
      }
      // Erst wenn die neue Version übernommen hat, einmal neu laden. Die Mission liegt im lokalen Speicher und bleibt erhalten.
      navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true });
      waiting.postMessage({ type: 'SKIP_WAITING' });
    },
  };
}

export function offlineLabel(s: OfflineState): { short: string; long: string; tone: 'ok' | 'wait' | 'info' } {
  switch (s.kind) {
    case 'ready':
      return {
        short: 'Für unterwegs bereit',
        long: 'Alles ist auf diesem Gerät gespeichert. Ihr könnt Runden auch ohne Netz starten, Aufgaben tauschen und fortsetzen.',
        tone: 'ok',
      };
    case 'preparing':
      return {
        short: 'Wird für unterwegs geladen …',
        long: 'Bitte bleibt noch kurz online, bis alles gespeichert ist. Erst dann funktioniert die App ohne Netz.',
        tone: 'wait',
      };
    case 'checking':
      return { short: 'Prüfe, ob alles gespeichert ist …', long: 'Einen Moment bitte.', tone: 'wait' };
    case 'error':
      return {
        short: 'Noch nicht für unterwegs gespeichert',
        long: 'Das Speichern für unterwegs hat nicht geklappt. Öffnet die Seite einmal mit Netz erneut und wartet kurz.',
        tone: 'info',
      };
    case 'dev':
      return { short: 'Entwicklungsmodus: kein Offline-Cache', long: 'Im Entwicklungsmodus wird nichts für unterwegs gespeichert. Der Produktionsbuild tut das.', tone: 'info' };
    case 'unsupported':
      return {
        short: 'Offline-Betrieb hier nicht verfügbar',
        long: 'Dieser Browser kann die App nicht für unterwegs speichern. Das Spiel funktioniert weiterhin mit Netz.',
        tone: 'info',
      };
  }
}
