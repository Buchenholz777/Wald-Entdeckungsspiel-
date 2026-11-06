import type { Gift } from '../catalog/gifts';
import type { AgeGroup } from '../domain/types';
import { Illustration } from '../illustrations/Illustration';

/** Teilt einen Text in kleine Absätze (je höchstens drei Sätze), damit Erwachsene in Gedankenportionen vorlesen können. */
export function paragraphs(text: string): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  const per = sentences.length > 8 ? 3 : 2;
  const out: string[] = [];
  for (let i = 0; i < sentences.length; i += per) out.push(sentences.slice(i, i + per).join(' '));
  return out;
}

/** Die Geschenkkarte: Titel, kleines Motiv und der Text der passenden Altersstufe. Auch zum späteren Wiederlesen. */
export function GiftCard({ gift, age, headingLevel = 3 }: { gift: Gift; age: AgeGroup; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <article className="gift-card" aria-label={`Waldgeheimnis: ${gift.title}`}>
      <div className="gift-motif">
        <Illustration illustrationKey={gift.motif} preset="settle" />
      </div>
      <div className="gift-text">
        <p className="gift-kicker">Ein Waldgeheimnis für euch</p>
        <H className="gift-title">{gift.title}</H>
        {paragraphs(gift.text[age]).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </article>
  );
}
