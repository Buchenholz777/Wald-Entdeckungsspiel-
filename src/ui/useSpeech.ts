import { useCallback, useEffect, useState } from 'react';

/**
 * Optionales Vorlesen über die Sprachausgabe des Geräts. Nur nach Tippen, nie automatisch.
 * Es wird nichts vorausgesetzt: ohne deutsche Stimme erscheint die Schaltfläche gar nicht.
 */
export function useSpeech() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  const [available, setAvailable] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (!supported) return;
    const check = () => setAvailable(window.speechSynthesis.getVoices().some((v) => v.lang.toLowerCase().startsWith('de')));
    check();
    window.speechSynthesis.addEventListener?.('voiceschanged', check);
    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', check);
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text: string) => {
      if (!supported) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'de-DE';
      const voice = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith('de'));
      if (voice) u.voice = voice;
      u.rate = 0.9;
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(u);
    },
    [supported],
  );

  return { available, speaking, speak, stop };
}
