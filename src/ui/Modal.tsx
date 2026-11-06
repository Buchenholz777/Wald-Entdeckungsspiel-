import { useEffect, useRef, type ReactNode } from 'react';
import { IconClose, IconHome } from './icons';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Sichtbare Überschrift weglassen, wenn der Inhalt sie selbst zeigt */
  hideTitle?: boolean;
  children: ReactNode;
  className?: string;
  /** Beschriftung der Schließen-Schaltfläche */
  closeLabel?: string;
  /** Zeigt „Zum Hauptmenü“ im Dialog: schließt den Dialog, speichert und öffnet das Menü */
  onHome?: () => void;
}

/** Nur ein Verlaufseintrag für alle Dialoge: Zurück schließt zuerst den Dialog, ohne dass sich Einträge stapeln. */
function openEntry() {
  try {
    if (!window.history.state?.dlg) window.history.pushState({ dlg: true }, '');
  } catch {
    /* Verlauf nicht verfügbar: Dialog funktioniert trotzdem */
  }
}

/**
 * Dialog auf Basis des nativen <dialog>-Elements: Fokusfalle, Esc zum Schließen
 * und Fokus-Rückgabe an die auslösende Schaltfläche bringt der Browser mit.
 * Browser-Zurück schließt den Dialog (ein einziger Verlaufseintrag), das Schließen per Schaltfläche
 * nimmt diesen Eintrag wieder zurück.
 */
export function Modal({ open, onClose, title, hideTitle, children, className, closeLabel = 'Schließen', onHome }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      try {
        d.showModal();
      } catch {
        d.setAttribute('open', '');
      }
      openEntry();
    }
    if (!open && d.open) d.close();
  }, [open]);

  // Wird der Dialog von außen geschlossen (z. B. „Fertig“), den Verlaufseintrag wieder zurücknehmen.
  const wasOpen = useRef(false);
  const trigger = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      return;
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      // Fokus zurück an die auslösende Schaltfläche (falls sie noch da ist)
      const el = trigger.current;
      if (el && el.isConnected) window.setTimeout(() => el.focus({ preventScroll: true }), 0);
      if (window.history.state?.dlg) window.history.back();
    }
  }, [open]);

  // Browser-Zurück: Dialog schließen
  useEffect(() => {
    if (!open) return;
    const onPop = () => {
      if (!window.history.state?.dlg) closeRef.current();
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [open]);

  /** Vom Nutzer ausgelöst: Verlaufseintrag zurücknehmen (löst popstate aus) oder direkt schließen. */
  const requestClose = () => {
    if (window.history.state?.dlg) window.history.back();
    else onClose();
  };

  return (
    <dialog
      ref={ref}
      className={`modal${className ? ` ${className}` : ''}`}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      onClick={(e) => {
        // Klick auf den Hintergrund schließt, löst aber nie eine Aktion in der Karte dahinter aus
        if (e.target === ref.current) {
          e.stopPropagation();
          requestClose();
        }
      }}
    >
      {open && (
        <div className="modal-body">
          <div className="modal-head">
            {!hideTitle && <h2 className="modal-title">{title}</h2>}
            <button type="button" className="icon-btn modal-close" onClick={requestClose} aria-label={closeLabel}>
              <IconClose />
            </button>
          </div>
          {children}
          {onHome && (
            <button type="button" className="btn btn-quiet modal-home" onClick={onHome}>
              <IconHome /> Zum Hauptmenü
            </button>
          )}
        </div>
      )}
    </dialog>
  );
}
