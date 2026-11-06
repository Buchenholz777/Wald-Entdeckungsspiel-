/**
 * Quellenverzeichnis der Waldgeschenke (nur interne Dokumentation, nie im Kindertext).
 * G/Q = Quellen der Vorgabe. V = in dieser Fassung zusätzlich über Websuche geprüfte Belege.
 * `checked`: was tatsächlich geprüft wurde. Eine Quelle der Vorgabe gilt NICHT als gelesen, nur weil sie hier steht.
 */
export interface GiftSource {
  id: string;
  title: string;
  url?: string;
  checked: 'gelesen' | 'Websuche' | 'nicht gelesen';
  note: string;
}

export const giftSources: GiftSource[] = [
  { id: 'G1', title: 'Wildtierportal Bayern, Eichelhäher', url: 'https://www.wildtierportal.bayern.de/wildtiere_bayern/100839/index.php', checked: 'nicht gelesen', note: 'Die Seite war über die Suche nicht erreichbar. Die Aussage wurde über V1 belegt.' },
  { id: 'G2', title: 'LWF, Eichelhäher als Eichelsäer (PDF)', url: 'https://www.lwf.bayern.de/mam/cms04/service/dateien/w75_gesamt_bf_gesch.pdf', checked: 'nicht gelesen', note: 'Nicht im Volltext geprüft. Keine Zahlen übernommen.' },
  { id: 'G3', title: 'Deutsche Wildtier Stiftung, Eichhörnchen', url: 'https://www.deutschewildtierstiftung.de/wildtiere/eichhoernchen', checked: 'nicht gelesen', note: 'Nicht erreicht. Winterruhe, Kobel und Vorräte wurden über V2 belegt.' },
  { id: 'G4', title: 'LfU Brandenburg, Eichhörnchen', url: 'https://lfu.brandenburg.de/lfu/de/aufgaben/natur/artenschutz/artenkompetenzzentren/artenkompetenzzentrum-zippelsfoerde/eichhoernchen/', checked: 'nicht gelesen', note: 'Nicht erreicht.' },
  { id: 'Q1', title: 'WSL, Leben im Totholz', url: 'https://www.wsl.ch/de/wald/biodiversitaet-naturschutz-urwald/leben-im-totholz/', checked: 'nicht gelesen', note: 'Totholz als Lebensraum aus V4 und Allgemeinwissen; keine Prozentzahlen genannt.' },
  { id: 'Q2', title: 'LfL Bayern, Gewöhnliche Buche', url: 'https://www.lfl.bayern.de/iab/kulturlandschaft/181303/index.php', checked: 'nicht gelesen', note: 'Buchenmerkmale zusätzlich über LWF/NRW-Unterlagen und Ratgeberseiten (Websuche) gestützt.' },
  { id: 'Q3', title: 'LfL Bayern, Berg-Ahorn', url: 'https://www.lfl.bayern.de/iab/kulturlandschaft/179908/index.php', checked: 'nicht gelesen', note: 'Flügelfrucht und Windverbreitung aus Allgemeinwissen der Botanik; Fachlektorat steht aus.' },
  { id: 'Q5', title: 'LBV Naturschwärmer, Wer hat denn da geknabbert?', url: 'https://naturschwaermer.lbv.de/themen/natur-im-winter/wer-hat-denn-da-geknabbert/', checked: 'nicht gelesen', note: 'Seite lieferte 404. Fraßspuren über V3 geprüft.' },
  { id: 'Q6', title: 'BFW, Steckbriefe Biodiversität beobachten (PDF)', url: 'https://www.bfw.gv.at/wp-content/uploads/Steckbriefe_biodiversitaet_beobachten_2018.pdf', checked: 'nicht gelesen', note: 'Nicht im Volltext geprüft.' },
  { id: 'Q7', title: 'NLWKN, Moose', url: 'https://www.nlwkn.niedersachsen.de/naturschutz/artenschutz/arten_brauchen_daten/erfasste_artengruppen/moose-39224.html', checked: 'nicht gelesen', note: 'Allgemeine Aussagen vorsichtig formuliert (viele Arten, nicht alle ständig feucht).' },
  { id: 'Q8', title: 'BLAM, Flechten Deutschlands', url: 'https://flechten.rotelistezentrum.de/', checked: 'Websuche', note: 'Flechte = Pilz plus Alge/Cyanobakterium über Suchergebnisse (SMNK, LfU Bayern) bestätigt.' },
  { id: 'Q9', title: 'Botanischer Garten Berlin, Sporenwedel der Farne', url: 'https://www.bgbm.org/de/infotainment/die-sporenwedel-der-farne', checked: 'Websuche', note: 'Sori an der Unterseite über V5 bestätigt. Vorkeim/Befruchtung aus Schulbuchmaterial, vereinfacht.' },
  { id: 'Q10', title: 'Umweltbundesamt, Humusvorrat in Waldböden', url: 'https://www.umweltbundesamt.de/monitoring-zur-das/handlungsfelder/wald-und-forstwirtschaft/fw-r-3/indikator', checked: 'nicht gelesen', note: 'Humus wird nicht mit dem ganzen Boden gleichgesetzt; Aussagen allgemein gehalten.' },
  { id: 'Q11', title: 'Waldwissen/ETH/WSL, Wasserkreislauf im Wald', url: 'https://www.waldwissen.net/de/lebensraum-wald/schutzfunktion/wasserkreislauf-im-wald', checked: 'nicht gelesen', note: 'Keine Mengenangaben übernommen.' },
  { id: 'V1', title: 'Eichelhäher: Verstecken und Vergessen', checked: 'Websuche', note: 'Stiftung Naturschutz Schleswig-Holstein, Steckbrief Eichelhäher des Landkreises Waldshut, Forstpublikation: Vorräte im Boden, nicht alle werden wiedergefunden, trägt zur Verbreitung der Eiche bei. Keine Zahlen verwendet (Quellen nennen stark schwankende Werte).' },
  { id: 'V2', title: 'Eichhörnchen im Winter', checked: 'Websuche', note: 'Ratgeber und Schulmaterial (u. a. Klett, Senckenberg-Unterlage, Stuttgarter Zeitung): keine echte Winterschlaf, sondern Winterruhe im Kobel, Vorräte an vielen Stellen, Geruchssinn beim Wiederfinden, nicht alle Verstecke werden gefunden. Keine Zeitangaben verwendet.' },
  { id: 'V3', title: 'Fraßspuren an Zapfen und Nüssen', checked: 'Websuche', note: 'NABU/ANL-Nussjagd-Bestimmungshilfen (Haselmaus: fast rundes Loch, glatter Rand, Zahnspuren parallel; Mäuse: rauer Rand, Spuren quer; Eichhörnchen und Vögel: Schale in Hälften) und Klett/Raabe-Unterrichtsmaterial (Eichhörnchen zupfen Zapfenschuppen, Mäuse nagen sie glatt). Deutung bleibt „könnte passen“.' },
  { id: 'V4', title: 'Totholz und Pilze als Zersetzer', checked: 'Websuche', note: 'WSL-Bildband „Poesie des Vergehens“ und Pilzwissen des Bund Naturschutz: Saprobionten bauen Totholz, Laub und Nadeln ab und setzen Nährstoffe frei. Weitere Aussagen (Käfer, Höhlen, Moose) Allgemeinwissen, Fachlektorat steht aus.' },
  { id: 'V5', title: 'Farn-Sporen', checked: 'Websuche', note: 'Naturpark Nassau (Sporenpflanzen), Schulbuchmaterial Moose und Farne: Sori an der Blattunterseite, Sporen statt Samen.' },
  { id: 'V6', title: 'Herbstfärbung', checked: 'Websuche', note: 'Spektrum-Lexikon „Blattfall“, Waldwissen „Bunte Bäume im goldenen Oktober“, Universität Konstanz: Chlorophyllabbau, Carotinoide werden sichtbar, Anthocyane werden neu gebildet, Trennschicht am Blattstiel. Die Funktion der Anthocyane gilt als nicht vollständig geklärt.' },
  { id: 'V7', title: 'Knospen', checked: 'Websuche', note: 'Studer (Elemente der Naturwissenschaft) und Spektrum-Lexikon „Knospe“: Knospenschuppen entstehen bis Mitte Sommer, danach die Blattanlagen. Buchenspezifisch nicht gesondert belegt, daher allgemein formuliert; Rotbuchenknospe lang und spitz, Hainbuche kürzer (NABU).' },
  { id: 'V8', title: 'Pilz: Fruchtkörper und Myzel', checked: 'Websuche', note: 'Bund Naturschutz Infotafel Pilzwissen, WSL-Bildband, Wochenblatt-Reporter: Fruchtkörper ist der sichtbare Teil, das Myzel liegt im Boden oder Holz; Pilze sind weder Pflanzen noch Tiere.' },
];

export const giftSourcesById: Record<string, GiftSource> = Object.fromEntries(giftSources.map((s) => [s.id, s]));
