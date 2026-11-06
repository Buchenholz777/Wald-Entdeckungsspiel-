import { THEME_INFO } from './meta';
import { THEMES, type AgeGroup, type RoundTask, type Theme } from './types';

/**
 * Titel und Vorlesesatz einer Waldmission. Sie werden erst aus den tatsächlich gezogenen Aufgaben abgeleitet,
 * damit nie etwas versprochen wird, das eine gezeigte Aufgabe nicht hält:
 * - Passen ALLE Stationen (mindestens zwei) zu einem Leitmotiv, trägt die Mission dessen Titel und Einleitung.
 * - Passt nur ein Teil (mindestens die Hälfte, mindestens zwei), bleibt der Titel allgemein, und die Einleitung sagt
 *   ehrlich „vor allem …, dazu noch ein paar andere Waldgeheimnisse“. So steht „Wie aus Kleinem ein Baum wird“
 *   nie über einem Baumpilz.
 * - Sonst gilt der allgemeine Titel.
 */

export const GENERAL_MISSION = {
  title: 'Waldgeheimnisse entdecken',
  line: 'Heute suchen wir kleine Geheimnisse im Wald.',
};

/** Das Leitmotiv, das eine Aufgabenliste (mehrheitlich) trägt, oder undefined. `preferred` entscheidet bei Gleichstand. */
export function dominantTheme(tasks: { templateId: string }[], themesOf: (templateId: string) => Theme[] | undefined, preferred?: Theme): Theme | undefined {
  const count = new Map<Theme, number>();
  for (const t of tasks) for (const th of themesOf(t.templateId) ?? []) count.set(th, (count.get(th) ?? 0) + 1);
  const need = Math.max(2, Math.ceil(tasks.length / 2));
  let best: Theme | undefined;
  let bestN = 0;
  for (const th of THEMES) {
    const n = count.get(th) ?? 0;
    if (n < need) continue;
    if (n > bestN || (n === bestN && th === preferred)) {
      best = th;
      bestN = n;
    }
  }
  return best;
}

/** Wahr, wenn jede Station zum Leitmotiv passt. */
export function allFit(tasks: { templateId: string }[], theme: Theme, themesOf: (templateId: string) => Theme[] | undefined): boolean {
  return tasks.length >= 2 && tasks.every((t) => themesOf(t.templateId)?.includes(theme));
}

/** Kurzer, wahrer Zusammenhang für die Fundsammlung. Er sagt nur etwas über die tatsächlich entdeckten Funde und nie, ein Tier sei gesehen worden. */
const CONNECTION: Record<Theme, string> = {
  growth: 'Samen, Früchte und junge Triebe gehören zusammen: Aus kleinen Anfängen können neue Bäume wachsen.',
  gnawed: 'Ihr habt Spuren entdeckt, die zeigen, dass Tiere im Wald Futter suchen. Welche Tiere es waren, wisst ihr nicht sicher.',
  water: 'Vieles, was ihr entdeckt habt, mag es feucht oder hält Wasser fest. Das macht den Wald zu einem guten Wasserspeicher.',
  decay: 'Im Wald wird aus Altem wieder Neues: Laub, Holz und Pilze machen daraus Boden, in dem Neues wachsen kann.',
  pattern: 'Muster erzählen davon, wie etwas gewachsen ist. Genau hinzuschauen hat sich gelohnt.',
  year: 'Der Wald verändert sich mit den Jahreszeiten, und ihr habt einige Zeichen davon gefunden.',
};

/** Der Zusammenhang wird nur genannt, wenn er für alle entdeckten Funde stimmt (mindestens zwei). */
export function connectionLine(done: { templateId: string }[], themesOf: (templateId: string) => Theme[] | undefined): string | undefined {
  if (done.length < 2) return undefined;
  for (const th of THEMES) if (allFit(done, th, themesOf)) return CONNECTION[th];
  return undefined;
}

export function buildMission(
  age: AgeGroup,
  tasks: RoundTask[],
  themesOf: (templateId: string) => Theme[] | undefined,
  preferred?: Theme,
): { title: string; intro: string; theme?: Theme } {
  const first = tasks[0];
  const go = first ? ` Los geht’s: ${first.prompt}` : '';
  const theme = dominantTheme(tasks, themesOf, preferred);
  const pure = theme !== undefined && allFit(tasks, theme, themesOf);
  let title = GENERAL_MISSION.title;
  let line = GENERAL_MISSION.line;
  if (theme && pure) {
    title = THEME_INFO[theme].title;
    line = THEME_INFO[theme].line;
  } else if (theme) {
    line = `Heute suchen wir vor allem ${THEME_INFO[theme].focus}, dazu noch ein paar andere Waldgeheimnisse.`;
  }
  const intro = age === '2-3' ? `Wir suchen gemeinsam.${go}` : `${line}${go}`;
  return { title, intro, theme };
}
