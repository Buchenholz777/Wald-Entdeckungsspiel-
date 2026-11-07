import { templatesById } from '../catalog/templates';
import { ESCAPE_MINUTES, KEY_COUNT, SIZES } from '../domain/escape/types';
import { AGE_LABEL, AGE_SUBLINE, DEFAULT_TASK_COUNT } from '../domain/meta';

/**
 * Öffentliche Einstiegsseiten von Wald-Spiel: die eine kleine Quelle für Titel, Beschreibung, Überschrift, Navigation, Sitemap und die
 * statisch ausgelieferten Seiten (siehe `build.ts`). Zahlen zu Alter, Stationen, Schlüsseln und Zeiten kommen aus den aktiven Spieldaten
 * (`domain/meta`, `domain/escape/types`, Katalog), damit Erklärung und Spiel nicht auseinanderlaufen.
 */

export const SITE_URL = 'https://www.wald-spiel.de';
export const SITE_NAME = 'Wald-Spiel';
export const OG_IMAGE = { path: '/og/wald-spiel-1200x630.jpg', width: 1200, height: 630, alt: 'Gezeichneter, sonniger Waldweg zwischen Laubbäumen, auf der Lichtung sucht eine kleine Familie im Gras.' };
/** Beispielbild der Waldschatzsuche-Seite (aus dem echten Suchbild des Spiels gerendert, siehe scripts/make-seo-images.mjs) */
export const EXAMPLE_IMAGE = { path: '/seo/beispiel-nadelzweig-720.webp', width: 720, height: 600 };

/** Einstiege ins Spiel: echte Links auf die Hash-Adressen der App. Sie wählen nur den Modus und starten nichts. */
export const PLAY = {
  menu: '/#/',
  treasure: '/#/modus/waldschaetze',
  escape: '/#/modus/escape',
} as const;

export type PageId = 'start' | 'schatzsuche' | 'escape' | 'anleitung';

export interface SeoPage {
  id: PageId;
  path: string;
  /** Name in Navigation und Brotkrumen */
  nav: string;
  title: string;
  description: string;
  h1: string;
  /** Letzte wesentliche inhaltliche Änderung (für die Sitemap) */
  lastmod: string;
  /** Hauptbegriff (nur zur Dokumentation und für Prüfungen) */
  keyword: string;
}

export const PAGES: SeoPage[] = [
  {
    id: 'start',
    path: '/',
    nav: 'Start',
    title: 'Waldspiele für Kinder von 2 bis 10 Jahren – Wald-Spiel',
    description: 'Waldspiele für Kinder von 2 bis 10 Jahren. Entdeckt gemeinsam Blätter, Zapfen und kleine Spuren. Wählt eure Waldmission und startet direkt im Browser.',
    h1: 'Waldspiele für Kinder – gemeinsam draußen entdecken',
    lastmod: '2026-11-07',
    keyword: 'Waldspiele für Kinder',
  },
  {
    id: 'schatzsuche',
    path: '/waldschatzsuche/',
    nav: 'Waldschatzsuche',
    title: 'Waldschatzsuche für Kinder – direkt starten – Wald-Spiel',
    description: 'Macht euren Waldspaziergang zur Schatzsuche. Wählt passende Suchaufgaben für eure Kinder, schaut gemeinsam genau hin und bestätigt eure Entdeckungen.',
    h1: 'Waldschatzsuche für Kinder',
    lastmod: '2026-11-07',
    keyword: 'Waldschatzsuche für Kinder',
  },
  {
    id: 'escape',
    path: '/wald-escape/',
    nav: 'Wald Escape',
    title: 'Escape-Spiel im Wald für Kinder – Wald Escape',
    description: 'Sucht gemeinsam Waldschätze, erspielt Schlüssel und öffnet den Waldtresor. Entdeckt Wald Escape für Kinder ab vier Jahren mit erwachsener Begleitung.',
    h1: 'Wald Escape – gemeinsam den Waldtresor öffnen',
    lastmod: '2026-11-07',
    keyword: 'Escape-Spiel im Wald für Kinder',
  },
  {
    id: 'anleitung',
    path: '/anleitung/',
    nav: 'Anleitung',
    title: 'Wald-Spiel Anleitung – Alter, Ablauf und Offline-Nutzung',
    description: 'So nutzt ihr Wald-Spiel beim Waldspaziergang. Erfahrt, welches Spiel zum Alter passt, wie ihr eine Runde startet und die Offline-Nutzung vorbereitet.',
    h1: 'So spielt ihr Wald-Spiel',
    lastmod: '2026-11-07',
    keyword: 'Wald-Spiel Anleitung',
  },
];

export const pageById = (id: PageId): SeoPage => PAGES.find((p) => p.id === id)!;
export const absUrl = (path: string): string => `${SITE_URL}${path}`;

/** Zusammenfassung der Modi für Startseite und Navigation. */
export const START_LINKS: { label: string; path: string }[] = [
  { label: 'So funktioniert die Waldschatzsuche', path: pageById('schatzsuche').path },
  { label: 'So funktioniert Wald Escape', path: pageById('escape').path },
  { label: 'Anleitung und häufige Fragen', path: pageById('anleitung').path },
];

/** Gemeinsame Einladung der Startseite (React und statisches HTML). */
export const HOME_LEAD =
  'Zapfen, Waldfrüchte und kleine Spuren: Geht gemeinsam auf Entdeckermission und erfahrt, welche Geheimnisse im Wald stecken. Wählt das Alter eures Kindes – und los geht’s!';

/** Kurzer Elternbereich der Startseite (React und statisches HTML teilen diese Texte). */
export const PARENT_INFO = {
  heading: 'Für Eltern: So funktioniert Wald-Spiel',
  paragraphs: [
    'Wald-Spiel begleitet euren Waldspaziergang. Ihr bedient das Handy, die Kinder schauen, zeigen und vergleichen echte Dinge im Wald. Nichts muss eingesammelt werden.',
    `Das Prinzip heißt anschauen, zeigen, Fund bestätigen: Jede Aufgabe nennt einen konkreten Gegenstand, zum Beispiel einen Zapfen oder ein Blatt mit Adernetz. Ein Bild zeigt, wie er aussehen kann. Habt ihr ihn gemeinsam entdeckt, bestätigt ein Erwachsener mit „Gefunden!“.`,
    `Wald-Spiel ist für Kinder von 2 bis 10 Jahren gedacht: ${AGE_LABEL['2-3']} ${AGE_SUBLINE['2-3'].toLowerCase()}, ${AGE_LABEL['4-6']} ${AGE_SUBLINE['4-6'].toLowerCase()}, ${AGE_LABEL['7-10']} ${AGE_SUBLINE['7-10'].toLowerCase()}. Wald Escape ist ab 4 Jahren mit erwachsener Begleitung vorgesehen. Walddetektive ist bald verfügbar.`,
  ],
};

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ul = (items: string[]): string => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
const link = (label: string, path: string): string => `<a href="${path}">${label}</a>`;
const cta = (label: string, path: string, kind: 'primary' | 'secondary' = 'primary'): string => `<a class="btn btn-${kind}" href="${path}">${label}</a>`;

const clockOptions = ESCAPE_MINUTES.join(', ').replace(/, (\d+)$/, ' oder $1');

/** Statischer Inhalt der Startseite im initialen HTML. React ersetzt ihn beim Start durch die Spielauswahl mit denselben Texten. */
export function startStaticHtml(): string {
  const p = pageById('start');
  return `<div class="screen setup seo-static">
<header class="hero hero-forest">
<p class="seo-kicker">${SITE_NAME} · Draußen spielen. Gemeinsam staunen.</p>
<h1 class="h1">${esc(p.h1)}</h1>
<p class="lead">${esc(HOME_LEAD)}</p>
</header>
<section class="help-card" aria-label="Spiele">
<h2>Was möchtet ihr spielen?</h2>
<ul class="seo-modes">
<li>${link('Waldschätze suchen', PLAY.treasure)}: Entspannt suchen und den Wald kennenlernen. ${link('So funktioniert die Waldschatzsuche', pageById('schatzsuche').path)}</li>
<li>Walddetektive – <strong>Bald verfügbar</strong>: Genauer hinschauen und kleine Waldgeheimnisse lösen.</li>
<li>${link('Wald Escape', PLAY.escape)}: Drei Schlüssel finden und gemeinsam den Waldtresor knacken. ${link('So funktioniert Wald Escape', pageById('escape').path)}</li>
</ul>
</section>
<section class="help-card" aria-label="Für Eltern">
<h2>${esc(PARENT_INFO.heading)}</h2>
${PARENT_INFO.paragraphs.map((t) => `<p>${esc(t)}</p>`).join('\n')}
<ul class="seo-links">${START_LINKS.map((l) => `<li>${link(l.label, l.path)}</li>`).join('')}</ul>
</section>
</div>
<noscript><p>Wald-Spiel braucht JavaScript, um zu funktionieren. Bitte aktiviert es in eurem Browser.</p></noscript>`;
}

/* ------------------------------------------------------------------ Waldschatzsuche ------------------------------------------------------------------ */

function treasureBody(): string {
  const t = templatesById['needle-twig'];
  const prompt = t.promptByAge?.['4-6']?.one ?? t.prompt.one;
  const features = t.image.recognitionFeatures.slice(0, 3);
  const counts = (['2-3', '4-6', '7-10'] as const)
    .map((a) => `<li><strong>${AGE_LABEL[a]}</strong> – ${AGE_SUBLINE[a]}. Standard: ${DEFAULT_TASK_COUNT[a]} Stationen.</li>`)
    .join('');
  return `<p class="lead">Mit der Waldschatzsuche wird euer Waldspaziergang zur entspannten Suche ohne Zeitdruck. Ihr bekommt eine Waldmission aus ein bis fünf Suchaufgaben, den Stationen. Jede Station nennt einen konkreten Fund. Ihr schaut gemeinsam, zeigt, was ihr entdeckt, und bestätigt es am Handy.</p>
<p class="seo-cta">${cta('Waldschätze suchen', PLAY.treasure)} ${cta('Anleitung lesen', pageById('anleitung').path, 'secondary')}</p>
<p class="muted">Läuft im Browser, ohne Konto. Hier wählt ihr nur die Waldschatzsuche aus; eine laufende Waldmission bleibt erhalten und lässt sich mit „Weiterspielen“ öffnen.</p>

<section aria-labelledby="bsp"><h2 id="bsp">Ein Beispielauftrag</h2>
<figure class="seo-figure">
<img src="${EXAMPLE_IMAGE.path}" width="${EXAMPLE_IMAGE.width}" height="${EXAMPLE_IMAGE.height}" alt="${esc(t.image.alt)}" decoding="async" />
<figcaption>So sieht eine Station aus: „${esc(prompt)}“ (Beispiel für ${AGE_LABEL['4-6']}). Euer Fund darf etwas anders aussehen als das Bild.</figcaption>
</figure>
<p>Erkennbar an:</p>
${ul(features.map((f) => esc(f)))}
<p>Zu jeder Station gehören ein Beispielbild zum Vergrößern, ein Such-Hinweis und eine kleine Info mit dem Waldgeheimnis dahinter. Ihr könnt sie jederzeit öffnen, auch vor dem Fund.</p></section>

<section aria-labelledby="alter"><h2 id="alter">Alter und Stationen</h2>
<p>Wählt vor dem Start das Alter des jüngsten Kindes. Danach richten sich die Aufgaben:</p>
<ul>${counts}</ul>
<p>Die Zahl der Stationen lässt sich unter „Mission anpassen“ auf 1 bis 5 ändern. Dort könnt ihr auch freiwillig angeben, was ihr im Wald seht, zum Beispiel Nadelbäume, Buchen, Eichen oder Farn. Nur dann kommen dazu passende Stationen vor. Die Jahreszeit schlägt die App nach dem Datum vor, ihr könnt sie ändern.</p></section>

<section aria-labelledby="fund"><h2 id="fund">Fund bestätigen</h2>
<p>Habt ihr den Gegenstand gemeinsam entdeckt, bestätigt ein Erwachsener mit „Gefunden!“. Bei Aufgaben, bei denen mehrere Dinge gesucht werden, zählt „Eins gefunden“ jeden Fund einzeln. Oben seht ihr, wie viele Stationen schon geschafft sind. Mit „Rückgängig“ nehmt ihr den letzten Fund wieder zurück.</p></section>

<section aria-labelledby="fehlt"><h2 id="fehlt">Wenn etwas fehlt</h2>
<p>Findet ihr einen Gegenstand nicht, tippt auf „Hier nicht zu finden“. Dann wird nur diese eine Station gegen eine andere ausgetauscht. Der Titel der Mission, die anderen Stationen und ihre Funde bleiben, wie sie sind. Bis zur nächsten Aktion könnt ihr mit „Tausch rückgängig“ die frühere Aufgabe zurückholen. Gibt es keine passende Alternative, könnt ihr die Station für diese Mission auslassen.</p></section>

<section aria-labelledby="pause"><h2 id="pause">Pausieren und weitermachen</h2>
<p>Das Handy darf zwischendurch in die Tasche. Mit „Hauptmenü“ pausiert ihr jederzeit ohne Rückfrage. Die Waldmission bleibt auf eurem Gerät gespeichert, im Hauptmenü öffnet „Weiterspielen“ genau diese Runde. „Neue Runde“ steht getrennt daneben und fragt vorher nach.</p></section>

<section aria-labelledby="geschenk"><h2 id="geschenk">Das Waldgeschenk</h2>
<p>Sind alle Stationen einer Mission gefunden, regnet kurz Konfetti, und ihr bekommt eine kleine Naturgeschichte geschenkt. Ausgelassene oder offene Stationen zählen nicht als gefunden. Eure Geschenke lest ihr im Hauptmenü unter „Unsere Waldgeheimnisse“ jederzeit wieder.</p></section>

<section aria-labelledby="regeln"><h2 id="regeln">Beim Entdecken beachten</h2>
${ul([
  'Anschauen, zeigen und gemeinsam zählen genügt. Nichts muss eingesammelt werden.',
  'Nichts essen oder probieren, auch keine Beeren, Pilze, Eicheln oder Bucheckern. Tiere nicht anfassen, fangen oder füttern.',
  'Moos, Flechten, Rinde und Pilze bleiben, wie sie sind. Bleibt auf den Wegen.',
])}
<p>Alle Regeln und Antworten auf häufige Fragen: ${link('Anleitung zu Wald-Spiel', pageById('anleitung').path)}.</p></section>

<section aria-labelledby="mehr"><h2 id="mehr">Weitere Spiele</h2>
<p>Für eine gemeinsame Mission mit Schlüsseln und Sanduhr gibt es ${link('Wald Escape für Kinder ab vier Jahren', pageById('escape').path)}.</p></section>`;
}

/* ------------------------------------------------------------------ Wald Escape ------------------------------------------------------------------ */

function escapeBody(): string {
  const s = SIZES.small;
  const l = SIZES.large;
  return `<p class="lead">Bei Wald Escape sucht ihr gemeinsam Waldschätze, erspielt ${KEY_COUNT} Schlüssel und öffnet damit einen digitalen Waldtresor. Gemeint ist keine Flucht aus dem Wald, sondern eine gemeinsame Aufgabe mit Sanduhr, Schlüsseln und einem kleinen Symbolrätsel. Wald Escape ist für Kinder ab 4 Jahren mit erwachsener Begleitung gedacht, am besten ab 7 Jahren. Ihr spielt zusammen: Eine Entdeckung zählt für das ganze Team.</p>
<p class="seo-cta">${cta('Wald Escape starten', PLAY.escape)} ${cta('Anleitung lesen', pageById('anleitung').path, 'secondary')}</p>
<p class="muted">Läuft im Browser, ohne Konto. Hier wählt ihr nur Wald Escape aus; eine laufende Mission bleibt erhalten und lässt sich mit „Weiterspielen“ öffnen. Für 2–3 Jahre bietet die App stattdessen die ${link('Waldschatzsuche', pageById('schatzsuche').path)} an.</p>

<section aria-labelledby="schluessel"><h2 id="schluessel">Wie aus Aufgaben Schlüssel werden</h2>
<p>Das Ziel sind immer ${KEY_COUNT} Schlüssel. Für jeden Schlüssel müsst ihr ${s.tasksPerKey} (kleine Mission) oder ${l.tasksPerKey} (große Mission) <em>verschiedene</em> Suchaufgaben vollständig erledigen. Jede erledigte Aufgabe ist ein Fragment, die volle Gruppe ergibt den Schlüssel.</p>
<table class="seo-table"><thead><tr><th scope="col"></th><th scope="col">${s.label}</th><th scope="col">${l.label}</th></tr></thead><tbody>
<tr><th scope="row">Entdeckungen pro Schlüssel</th><td>${s.tasksPerKey}</td><td>${l.tasksPerKey}</td></tr>
<tr><th scope="row">Aufgaben insgesamt</th><td>${s.required}</td><td>${l.required}</td></tr>
<tr><th scope="row">Karten zur Wahl</th><td>${s.offered}</td><td>${l.offered}</td></tr>
<tr><th scope="row">Standard-Sanduhr</th><td>${s.defaultMinutes} Minuten</td><td>${l.defaultMinutes} Minuten</td></tr>
</tbody></table>
<p>Aus den Karten wählt ihr frei die Aufgaben aus, die ihr gerade findet. Die App zeigt zum Beispiel „4 von ${s.required} Aufgaben · 2 von ${KEY_COUNT} Schlüsseln“ und sagt, wie viele Entdeckungen für den nächsten Schlüssel noch fehlen. Standardmäßig ist die kleine Mission für 4–6 Jahre und die große für 7–10 Jahre eingestellt, Erwachsene können frei wählen.</p></section>

<section aria-labelledby="sanduhr"><h2 id="sanduhr">Die Sanduhr</h2>
<p>Ihr wählt eine Suchzeit von ${clockOptions} Minuten. Die Zeiten sind Ausgangswerte und noch nicht mit Familien erprobt; sie können für euch zu kurz oder zu lang sein. Die Sanduhr beginnt erst, wenn ihr auf „Sanduhr starten“ tippt, und stoppt bei der letzten nötigen Aufgabe. Ist dann noch Suchzeit übrig, ist die Zeitaufgabe geschafft.</p></section>

<section aria-labelledby="pausen"><h2 id="pausen">Pausen</h2>
<p>Die Zeit läuft nur bei der Suche. Infos lesen, Bilder vergrößern, Karten tauschen, das Hauptmenü und die Taste „Pause“ halten die Sanduhr an. Wenn das Telefon gesperrt wird, läuft sie weiter. Tippt bei einer echten Suchpause deshalb auf „Pause“.</p></section>

<section aria-labelledby="ablauf"><h2 id="ablauf">Wenn die Zeit abgelaufen ist</h2>
<p>Dann steht „Die Sanduhr ist durch – der Tresor wartet auf euch!“ mit euren echten Zahlen da. Eure Funde und Schlüssel bleiben. Ihr könnt „Ohne Zeitdruck weitersuchen“ und den Tresor trotzdem öffnen oder „Für heute beenden“. Das Waldgeschenk ist dasselbe, nur ohne die Aussage „rechtzeitig“.</p></section>

<section aria-labelledby="raetsel"><h2 id="raetsel">Symbolrätsel und Waldtresor</h2>
<p>Habt ihr alle ${KEY_COUNT} Schlüssel, löst ihr ohne Countdown ein kleines Symbolrätsel. Bei 4–6 Jahren steht die richtige Reihenfolge als Streifen daneben und wird nachgebaut. Bei 7–10 Jahren führen zwei kurze Hinweise zur Reihenfolge. Eine falsche Folge kostet nichts: Ein kurzer Hinweis zeigt, was schon stimmt und worauf ihr als Nächstes schauen könnt. Mit „Tipp“ oder „Gemeinsam öffnen“ kommt ihr immer weiter. Danach öffnet sich der Tresor, und ihr bekommt ein Waldgeschenk.</p></section>

<section aria-labelledby="wissen"><h2 id="wissen">Gut zu wissen</h2>
<p>Welche Aufgaben zur Auswahl stehen, hängt von Alter, Jahreszeit und euren freiwilligen Waldangaben ab. Reichen sie für eine Größe nicht aus, sagt die App das vor dem Start, statt eine kleinere Mission vorzutäuschen. Im Sommer ohne Waldangaben gibt es zum Beispiel nur die kleine Mission. Für alle Aufgaben gelten die Regeln der ${link('Anleitung', pageById('anleitung').path)}: nichts einsammeln, essen oder abreißen.</p></section>

<section aria-labelledby="mehr"><h2 id="mehr">Weitere Spiele</h2>
<p>Ohne Zeitdruck und für die Jüngsten passt die ${link('Waldschatzsuche für Kinder', pageById('schatzsuche').path)}.</p></section>`;
}

/* ------------------------------------------------------------------ Anleitung ------------------------------------------------------------------ */

function guideBody(): string {
  return `<p class="lead">Wald-Spiel ist ein Begleiter für den Waldspaziergang: Ihr bedient das Handy, die Kinder schauen, zeigen und vergleichen echte Dinge im Wald. Hier stehen die Antworten auf die häufigsten Fragen.</p>
<p class="seo-cta">${cta('Zur Spielauswahl', PLAY.menu)}</p>

<section aria-labelledby="alter"><h2 id="alter">Für welches Alter passt welcher Modus?</h2>
${ul([
  `<strong>Waldschätze suchen</strong> – für ${AGE_LABEL['2-3']} (${AGE_SUBLINE['2-3'].toLowerCase()}), ${AGE_LABEL['4-6']} (${AGE_SUBLINE['4-6'].toLowerCase()}) und ${AGE_LABEL['7-10']} (${AGE_SUBLINE['7-10'].toLowerCase()}). Die entspannte Suche ohne Zeitdruck: ${link('Waldschatzsuche für Kinder', pageById('schatzsuche').path)}.`,
  `<strong>Wald Escape</strong> – ab 4 Jahren mit erwachsener Begleitung, am besten ab 7 Jahren. Eine gemeinsame Mission mit Sanduhr: ${link('Escape-Spiel im Wald', pageById('escape').path)}.`,
  `<strong>Walddetektive</strong> – bald verfügbar, noch nicht spielbar.`,
])}</section>

<section aria-labelledby="vorbereiten"><h2 id="vorbereiten">Was bereiten Erwachsene vor, und wer bedient das Handy?</h2>
<p>Erwachsene wählen den sicheren Platz, bedienen das Handy und bestätigen, was entdeckt wurde. Die Kinder suchen, zeigen und vergleichen. Dafür braucht ihr nur ein Smartphone oder Tablet mit Browser. Wählt zuhause das Alter des jüngsten Kindes und ladet die Seite einmal vollständig, damit sie auch im Wald ohne Netz bereitsteht.</p></section>

<section aria-labelledby="start"><h2 id="start">Wie startet und pausiert man eine Runde?</h2>
<p>Wählt im Hauptmenü das Spiel und das Alter und tippt auf „Waldmission starten“ bzw. „Sanduhr starten“. Mit „Hauptmenü“ pausiert ihr jederzeit; bei Wald Escape hält zusätzlich die Taste „Pause“ die Sanduhr an. Im Hauptmenü öffnet „Weiterspielen“ genau die laufende Runde. „Neue Runde“ ersetzt sie erst nach einer Rückfrage.</p></section>

<section aria-labelledby="fehlt"><h2 id="fehlt">Was passiert, wenn ein gesuchter Gegenstand fehlt?</h2>
<p>Tippt auf „Hier nicht zu finden“. Dann wird nur diese Aufgabe getauscht, der Rest der Runde bleibt. Mit „Tausch rückgängig“ holt ihr die frühere Aufgabe bis zur nächsten Aktion zurück. Ein Fund, den ihr versehentlich bestätigt habt, lässt sich mit „Rückgängig“ zurücknehmen.</p></section>

<section aria-labelledby="offline"><h2 id="offline">Wann funktioniert das Spiel ohne Netz?</h2>
<p>Nach dem ersten vollständigen Laden speichert euer Browser die Seite samt aller Bilder und Texte auf dem Gerät. Im Hauptmenü steht dann „Für unterwegs bereit“. Erst ab dieser Meldung ist das Spiel auch ohne Netz verfügbar. Steht dort „Noch nicht für unterwegs gespeichert“ oder „Wird für unterwegs geladen …“, bleibt noch eine Weile mit Netz verbunden. Wie lange der Browser die Daten behält, hängt von Gerät und Browser ab.</p></section>

<section aria-labelledby="speicher"><h2 id="speicher">Wo wird der Fortschritt gespeichert?</h2>
<p>Nur auf eurem Gerät, im Browser. Es gibt kein Konto. Eure Runden, Einstellungen und Waldgeschenke wandern deshalb nicht auf ein anderes Gerät oder in einen anderen Browser mit. Löscht ihr die Browserdaten oder spielt ihr in einem privaten Fenster, kann der Stand verschwinden. In der Hilfe der App setzt „Spiele und Einstellungen zurücksetzen“ laufende Spiele und Einstellungen zurück; Waldgeschenke bleiben dabei erhalten.</p></section>

<section aria-labelledby="geraete"><h2 id="geraete">Was ist bei Geräten, Installation und Browserwechsel zu beachten?</h2>
<p>Wald-Spiel läuft im Browser, eine Installation ist freiwillig. Auf dem iPhone tippt ihr in Safari auf „Teilen“ und wählt „Zum Home-Bildschirm“. In anderen Browsern findet ihr das Installieren meist im Menü. Wechselt ihr den Browser oder das Gerät, beginnt ihr mit einem frischen Stand. Tipp: Prüft vor dem Spaziergang die Meldung „Für unterwegs bereit“.</p></section>

<section aria-labelledby="regeln"><h2 id="regeln">Welche Regeln gelten beim Beobachten von Pflanzen und Tieren?</h2>
${ul([
  'Anschauen, zeigen und gemeinsam zählen genügt. Nichts muss eingesammelt werden.',
  'Erwachsene wählen den sicheren Platz und bestätigen, was entdeckt wurde.',
  'Nichts essen oder probieren, auch keine Beeren, Pilze, Eicheln oder Bucheckern. Tiere nicht anfassen, fangen oder füttern.',
  'Moos, Flechten, Rinde und Pilze bleiben, wie sie sind. Nichts abkratzen, abreißen oder ausreißen.',
  'Keine Baumstämme umdrehen, kein Totholz aufbrechen, keine Nester oder Tierbauten suchen. Dort wohnen Tiere.',
  'Bleibt auf den Wegen. Keine Aufgabe führt in Dickicht, an Gewässer oder an gefährliche Ränder.',
  'Gerade bei den Kleinsten: Kleine Dinge wie Samen, Nüsse oder Steinchen gehören nicht in den Mund.',
])}
<p>Ob ihr etwas findet, hängt von Wald, Wetter und Jahreszeit ab; eine Garantie gibt es nicht. Die Aufgaben sind für Wälder in Mitteleuropa gedacht. Bei Spuren und Fraßspuren bleibt offen, welches Tier es war.</p></section>

<section aria-labelledby="daten"><h2 id="daten">Welche Daten werden verwendet?</h2>
<p>Spielstände, Funde und Einstellungen verlassen euer Gerät nicht. Für die Reichweitenmessung wird beim Aufruf der Website Google Analytics geladen; dabei werden Daten über den Seitenbesuch an Google übertragen. Mehr dazu steht in der Hilfe der App unter „Datenhinweis“.</p></section>`;
}

export const BODIES: Record<PageId, () => string> = {
  start: () => '',
  schatzsuche: treasureBody,
  escape: escapeBody,
  anleitung: guideBody,
};

export const NOT_FOUND = {
  title: 'Seite nicht gefunden – Wald-Spiel',
  description: 'Diese Seite gibt es nicht. Zur Startseite von Wald-Spiel, zur Waldschatzsuche, zu Wald Escape oder zur Anleitung.',
  h1: 'Diese Seite gibt es nicht',
};
