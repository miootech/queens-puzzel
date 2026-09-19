// German-themed word packs for the Strands-style puzzle.
// All words uppercase. ß → SS. Umlauts (Ä Ö Ü) kept.
// Long words (>8 chars) are filtered out safely by the generator.

import { ThemePack } from './types';

export const THEME_PACKS: ThemePack[] = [
  // ─── Natur & Umwelt ───
  { theme: 'Am Strand',         spangram: 'STRAND',    words: ['SAND', 'WELLE', 'MUSCHEL', 'SONNE', 'KORB', 'NEBEL'] },
  { theme: 'Im Wald',           spangram: 'WALD',      words: ['BAUM', 'BLATT', 'PILZ', 'EICHE', 'REH', 'MOOS'] },
  { theme: 'Berge',             spangram: 'BERGE',     words: ['GIPFEL', 'SCHNEE', 'STEIN', 'HÖHE', 'TAU', 'EIS'] },
  { theme: 'Garten',            spangram: 'GARTEN',    words: ['ROSE', 'TULPE', 'RASEN', 'ERDE', 'BAUM', 'SAME'] },
  { theme: 'Wetter',            spangram: 'WETTER',    words: ['REGEN', 'WIND', 'NEBEL', 'SONNE', 'HAGEL', 'STURM'] },
  { theme: 'Weltraum',          spangram: 'KOSMOS',    words: ['MOND', 'STERN', 'KOMET', 'PLANET', 'RAKETE', 'ORBIT'] },
  { theme: 'Blumen',            spangram: 'BLUMEN',    words: ['ROSE', 'TULPE', 'NARZISSE', 'LILIE', 'GLOCKE', 'SAAT'] },
  { theme: 'Insekten',          spangram: 'KÄFER',     words: ['BIENE', 'AMEISE', 'FLIEGE', 'WESPE', 'SCHNECKE', 'RAUPE'] },

  // ─── Essen & Trinken ───
  { theme: 'Obst',              spangram: 'OBST',      words: ['APFEL', 'BIRNE', 'TRAUBE', 'KIRSCHE', 'MELONE', 'SAFT'] },
  { theme: 'Gemüse',            spangram: 'GEMÜSE',    words: ['KAROTTE', 'TOMATE', 'GURKE', 'PAPRIKA', 'ZWIEBEL', 'KOHL'] },
  { theme: 'In der Küche',      spangram: 'KOCHEN',    words: ['TOPF', 'HERD', 'BRETT', 'MESSER', 'LÖFFEL', 'TASSE'] },
  { theme: 'Getränke',          spangram: 'TRINKEN',   words: ['WASSER', 'SAFT', 'MILCH', 'KAFFEE', 'TEE', 'LIMO'] },
  { theme: 'Süßigkeiten',       spangram: 'SUESS',     words: ['SCHOKO', 'BONBON', 'KEKS', 'EIS', 'LUTSCHER', 'GUMMI'] },
  { theme: 'Brotzeit',          spangram: 'BROT',      words: ['BUTTER', 'KÄSE', 'WURST', 'BREZEL', 'SEMMEL', 'HONIG'] },
  { theme: 'Backwaren',         spangram: 'BROT',      words: ['SEMMEL', 'BREZEL', 'STOLLEN', 'BAGUETTE', 'KORN', 'WECK'] },
  { theme: 'Fleischarten',      spangram: 'FLEISCH',   words: ['RIND', 'SCHWEIN', 'HUHN', 'PUTE', 'LAMM', 'WILD'] },
  { theme: 'Fischarten',        spangram: 'FISCH',     words: ['LACHS', 'FORELLE', 'HERING', 'MAKRELE', 'THUN', 'DORSCH'] },
  { theme: 'Süsswaren',         spangram: 'ZUCKER',    words: ['SCHOKO', 'BONBON', 'KEKS', 'GUMMI', 'PRALINE', 'LUTSCHER'] },
  { theme: 'Alkoholfrei',       spangram: 'TRINKEN',   words: ['WASSER', 'SAFT', 'TEE', 'KAFFEE', 'COLA', 'LIMO'] },
  { theme: 'Alkoholisch',       spangram: 'ALKOHOL',   words: ['BIER', 'WEIN', 'SEKT', 'SCHNAPS', 'LIKÖR', 'COCKTAIL'] },
  { theme: 'Fast Food',         spangram: 'BURGER',    words: ['PIZZA', 'POMMES', 'DÖNER', 'HOTDOG', 'WRAP', 'TACO'] },
  { theme: 'Küchenutensilien',  spangram: 'KÜCHE',     words: ['TOPF', 'PFANNE', 'MESSER', 'GABEL', 'LÖFFEL', 'SCHÜSSEL'] },
  { theme: 'Mahlzeiten',        spangram: 'ESSEN',     words: ['FRÜH', 'MITTAG', 'ABEND', 'SNACK', 'MENÜ', 'BRUNCH'] },
  { theme: 'Backen',            spangram: 'KUCHEN',    words: ['MEHL', 'ZUCKER', 'BACKEN', 'OFEN', 'BLECH', 'TEIG'] },
  { theme: 'Gewürze',           spangram: 'WÜRZE',     words: ['SALZ', 'PFEFFER', 'CHILI', 'CURRY', 'PAPRIKA', 'ZIMT'] },
  { theme: 'Milchprodukte',     spangram: 'MILCH',     words: ['KÄSE', 'BUTTER', 'QUARK', 'JOGHURT', 'SAHNE', 'RAHM'] },
  { theme: 'Beerenfrüchte',     spangram: 'BEERE',     words: ['HIMBEERE', 'BROMBEER', 'JOHANNIS', 'PREISEL', 'STACHEL', 'ERDBEER'] },
  { theme: 'Zitrusfrüchte',     spangram: 'ZITRONE',   words: ['ORANGE', 'LIMETTE', 'MANDARIN', 'POMELO', 'KUMQUAT', 'POMPEL'] },
  { theme: 'Nüsse & Kerne',     spangram: 'NUSS',      words: ['MANDEL', 'WALNUSS', 'ERDNUSS', 'CASHEW', 'PISTAZIE', 'KERN'] },
  { theme: 'Kräuter',           spangram: 'KRAUT',     words: ['BASIL', 'THYMIAN', 'ROSMARIN', 'OREGANO', 'DILL', 'PETER'] },
  { theme: 'Pilzarten',         spangram: 'PILZ',      words: ['CHAMP', 'STEIN', 'MORCHEL', 'TRÜFFEL', 'KRAUSE', 'PARASOL'] },
  { theme: 'Gewürzarten',       spangram: 'GEWÜRZ',    words: ['ZIMT', 'VANILLE', 'INGWER', 'KURKUMA', 'ANIS', 'KARDAMOM'] },
  { theme: 'Getreide',          spangram: 'KORN',      words: ['WEIZEN', 'ROGGEN', 'HAFER', 'GERSTE', 'REIS', 'HIRSE'] },
  { theme: 'Getreidesorten',    spangram: 'KORN',      words: ['WEIZEN', 'ROGGEN', 'HAFER', 'GERSTE', 'REIS', 'HIRSE'] },
  { theme: 'Gemüsesorten',      spangram: 'GEMÜSE',    words: ['GURKE', 'TOMATE', 'KAROTTE', 'SALAT', 'ERBSE', 'BOHNE'] },
  { theme: 'Obstarten',         spangram: 'OBST',      words: ['APFEL', 'BIRNE', 'KIRSCHE', 'PFLAUME', 'BANANE', 'TRAUBE'] },
  { theme: 'Grillen',           spangram: 'GRILL',     words: ['KOHLE', 'FLEISCH', 'WURST', 'ZANGE', 'STEAK', 'SALAT'] },
  { theme: 'Backen & Konditor', spangram: 'TORTE',     words: ['KUCHEN', 'CREME', 'GLASUR', 'BLECH', 'MEHL', 'ZUCKER'] },

  // ─── Tiere ───
  { theme: 'Im Zoo',            spangram: 'TIERE',     words: ['TIGER', 'LÖWE', 'AFFE', 'ZEBRA', 'PANDA', 'BÄR'] },
  { theme: 'Bauernhof',         spangram: 'FARM',      words: ['KUH', 'SCHWEIN', 'HUHN', 'PFERD', 'ZIEGE', 'ENTE'] },
  { theme: 'Haustiere',         spangram: 'TIER',      words: ['HUND', 'KATZE', 'MAUS', 'HASE', 'VOGEL', 'FISCH'] },
  { theme: 'Vögel',             spangram: 'VÖGEL',     words: ['AMSEL', 'TAUBE', 'EULE', 'RABE', 'SPATZ', 'STORCH'] },
  { theme: 'Im Meer',           spangram: 'MEER',      words: ['WAL', 'HAI', 'KRAKE', 'KRABBE', 'MUSCHEL', 'SEESTERN'] },
  { theme: 'Meerestiere',       spangram: 'FISCHE',    words: ['HAI', 'WAL', 'DELFIN', 'KRAKE', 'ROCHEN', 'MORÄNE'] },
  { theme: 'Säugetiere',        spangram: 'TIER',      words: ['HUND', 'KATZE', 'MAUS', 'PFERD', 'KUH', 'SCHAF'] },
  { theme: 'Raubtiere',         spangram: 'LÖWE',      words: ['TIGER', 'WOLF', 'LUCHS', 'PUMA', 'JAGUAR', 'BÄR'] },
  { theme: 'Affen',             spangram: 'AFFE',      words: ['GIBBON', 'MAKAQUE', 'GORILLA', 'ORANG', 'PAVIAN', 'LEMUR'] },
  { theme: 'Nagetiere',         spangram: 'MAUS',      words: ['RATTE', 'HAMSTER', 'BIBER', 'MURMEL', 'NUTRIA', 'HÖRNI'] },
  { theme: 'Huftiere',          spangram: 'PFERD',     words: ['ZIEGE', 'SCHAF', 'HIRSCH', 'REH', 'ELCH', 'BÜFFEL'] },
  { theme: 'Meeresbewohner',    spangram: 'FISCH',     words: ['WAL', 'HAI', 'KRAKE', 'DELFIN', 'ROBBE', 'QUALLE'] },
  { theme: 'Reptilien',         spangram: 'SCHLANGE',  words: ['EIDECHSE', 'KROKODIL', 'TURTLE', 'GECKO', 'AGAME', 'SKINK'] },
  { theme: 'Amphibien',         spangram: 'FROSCH',    words: ['KRÖTE', 'MOLCH', 'UNKE', 'AXOLOTL', 'LURCH', 'WASSER'] },
  { theme: 'Insektenwelt',      spangram: 'INSEKT',    words: ['BIENE', 'WESPE', 'AMEISE', 'MÜCKE', 'HUMMEL', 'LIBELLE'] },
  { theme: 'Spinnentiere',      spangram: 'SPINNE',    words: ['MILBE', 'ZECKE', 'SKORPION', 'WEBER', 'KREUZ', 'SPINNER'] },
  { theme: 'Haustierarten',     spangram: 'HUND',      words: ['KATZE', 'HASE', 'VOGEL', 'FISCH', 'MAUS', 'PFERD'] },
  { theme: 'Hunderassen',       spangram: 'HUND',      words: ['BOXER', 'PUDEL', 'MOPS', 'COLLIE', 'BEAGLE', 'LABRADOR'] },
  { theme: 'Katzenrassen',      spangram: 'KATZE',     words: ['PERSER', 'BENGAL', 'SIAM', 'SPHYNX', 'RAGDOLL', 'MAINE'] },
  { theme: 'Pferdearten',       spangram: 'PFERD',     words: ['ARABER', 'PONY', 'MUSTANG', 'FRIESE', 'ISLÄNDER', 'PINTO'] },

  // ─── Pflanzen & Pilze ───
  { theme: 'Bäume',             spangram: 'BAUM',      words: ['EICHE', 'BUCHE', 'TANNE', 'KIEFER', 'BIRKE', 'LINDE'] },
  { theme: 'Pilze',             spangram: 'PILZ',      words: ['STEIN', 'RÖHRLING', 'SCHOPF', 'TRÜFFEL', 'REIZKER', 'CHAMP'] },
  { theme: 'Gartenpflanzen',    spangram: 'BLUME',     words: ['ROSE', 'TULPE', 'LILIE', 'ORCHIDEE', 'DAHLIE', 'ASTER'] },

  // ─── Alltag & Schule ───
  { theme: 'Schulsachen',       spangram: 'SCHULE',    words: ['TISCH', 'TAFEL', 'BUCH', 'STIFT', 'KREIDE', 'HEFT'] },
  { theme: 'Büro',              spangram: 'BÜRO',      words: ['TISCH', 'STUHL', 'LAMPE', 'PAPIER', 'STIFT', 'AKTE'] },
  { theme: 'Farben',            spangram: 'FARBE',     words: ['ROT', 'BLAU', 'GRÜN', 'GELB', 'LILA', 'ORANGE'] },
  { theme: 'Zahlen',            spangram: 'ZAHLEN',    words: ['EINS', 'ZWEI', 'DREI', 'VIER', 'FÜNF', 'SECHS'] },
  { theme: 'Kleidung',          spangram: 'MODE',      words: ['HEMD', 'HOSE', 'KLEID', 'JACKE', 'SCHUH', 'MÜTZE'] },
  { theme: 'Bürobedarf',        spangram: 'BÜRO',      words: ['TISCH', 'STUHL', 'PAPIER', 'STIFT', 'HEFTER', 'LOCHER'] },
  { theme: 'Büroalltag',        spangram: 'PAPIER',    words: ['AKTE', 'STIFT', 'HEFTER', 'TISCH', 'STUHL', 'MAPPE'] },
  { theme: 'Berufe im Büro',    spangram: 'JOB',       words: ['CHEF', 'MANAGER', 'SEKRETÄR', 'ANALYST', 'PLANER', 'ASSIST'] },

  // ─── Sport & Freizeit ───
  { theme: 'Sport',             spangram: 'SPORT',     words: ['BALL', 'TOR', 'LAUF', 'SIEG', 'TEAM', 'FAHNE'] },
  { theme: 'Fußball',           spangram: 'FUSSBALL',  words: ['TOR', 'BALL', 'SPIELER', 'TRAINER', 'PUNKT', 'FELD'] },
  { theme: 'Spiele',            spangram: 'SPIEL',     words: ['WÜRFEL', 'KARTE', 'FIGUR', 'FELD', 'RATEN', 'PUZZLE'] },
  { theme: 'Ballsportarten',    spangram: 'BALL',      words: ['FUSSBALL', 'TENNIS', 'BASKET', 'VOLLEY', 'HANDBALL', 'GOLF'] },
  { theme: 'Wintersport',       spangram: 'WINTER',    words: ['SKI', 'SNOW', 'BOB', 'RODEL', 'EISSCHUH', 'CURLING'] },
  { theme: 'Sommersport',       spangram: 'SOMMER',    words: ['SCHWIMM', 'SURFEN', 'TAUCHEN', 'SEGELN', 'TENNIS', 'JOGGEN'] },
  { theme: 'Leichtathletik',    spangram: 'SPORT',     words: ['LAUF', 'SPRUNG', 'WURF', 'HÜRDE', 'STAB', 'SPEER'] },
  { theme: 'Kampfsport',        spangram: 'KAMPF',     words: ['JUDO', 'KARATE', 'BOXEN', 'KICKBOX', 'AIKIDO', 'SUMO'] },
  { theme: 'Brettspiele',       spangram: 'SPIEL',     words: ['SCHACH', 'DAME', 'MÜHLE', 'MONOPOLY', 'CATAN', 'RISK'] },
  { theme: 'Kartenspiele',      spangram: 'KARTE',     words: ['POKER', 'SKAT', 'UNO', 'MAJONG', 'TAROCK', 'PINOCHL'] },
  { theme: 'Gesellschaftsspiele', spangram: 'WÜRFEL',  words: ['KARTE', 'FIGUR', 'FELD', 'REGEL', 'PUNKT', 'SPIELER'] },
  { theme: 'Videospiele',       spangram: 'GAMING',    words: ['KONSOLE', 'LEVEL', 'BOSS', 'QUEST', 'PIXEL', 'SPIEL'] },
  { theme: 'Lesen',             spangram: 'BUCH',      words: ['SEITE', 'KAPITEL', 'AUTOR', 'LESER', 'ROMAN', 'COVER'] },
  { theme: 'Angeln',            spangram: 'ANGEL',     words: ['RUTE', 'KÖDER', 'SCHNUR', 'NETZ', 'HAKEN', 'FISCH'] },
  { theme: 'Camping',           spangram: 'CAMPEN',    words: ['ZELT', 'SACK', 'LAGER', 'KOCHER', 'MATTE', 'LAMPE'] },

  // ─── Musik & Kultur ───
  { theme: 'Musik',             spangram: 'MUSIK',     words: ['NOTEN', 'TAKT', 'SAITE', 'TON', 'KLAVIER', 'GEIGE'] },
  { theme: 'Musikinstrumente',  spangram: 'GITARRE',   words: ['KLAVIER', 'GEIGE', 'FLÖTE', 'HARFE', 'BASS', 'TROMMEL'] },
  { theme: 'Musikrichtungen',   spangram: 'SONG',      words: ['ROCK', 'POP', 'JAZZ', 'TECHNO', 'RAP', 'REGGAE'] },
  { theme: 'Kino & Filme',      spangram: 'KINO',      words: ['FILM', 'REGIE', 'STAR', 'DRAMA', 'HORROR', 'THRILLER'] },
  { theme: 'Literatur',         spangram: 'BUCH',      words: ['ROMAN', 'DRAMA', 'LYRIK', 'PROSA', 'AUTOR', 'KAPITEL'] },
  { theme: 'Malerei',           spangram: 'FARBE',     words: ['PINSEL', 'LEINWAND', 'PALETTE', 'FARBE', 'ÖL', 'ACRYL'] },
  { theme: 'Theater',           spangram: 'BÜHNE',     words: ['DRAMA', 'ROLLE', 'KULISSE', 'MASKE', 'PROBE', 'TEXT'] },
  { theme: 'Architektur',       spangram: 'BAUEN',     words: ['HAUS', 'TURM', 'BRÜCKE', 'SCHLOSS', 'KIRCHE', 'SÄULE'] },
  { theme: 'Grammatik',         spangram: 'WORTE',     words: ['NOMEN', 'VERB', 'ADJEKTIV', 'KASUS', 'TEMPUS', 'PLURAL'] },
  { theme: 'Farbenlehre',       spangram: 'FARBEN',    words: ['ROT', 'BLAU', 'GELB', 'GRÜN', 'ORANGE', 'VIOLETT'] },
  { theme: 'Epochen',           spangram: 'EPOCHE',    words: ['ANTIKE', 'GOTIK', 'BAROCK', 'ROKOKO', 'MODERNE', 'KLASSIK'] },
  { theme: 'Mythologie',        spangram: 'MYTHOS',    words: ['ZEUS', 'THOR', 'ODIN', 'HERKULES', 'TITAN', 'GOTT'] },
  { theme: 'Philosophie',       spangram: 'LOGIK',     words: ['ETHIK', 'SINN', 'LOGIK', 'GEIST', 'WAHRHEIT', 'SEIN'] },
  { theme: 'Psychologie',       spangram: 'PSYCHE',    words: ['SEELE', 'EGO', 'TRAUM', 'ANGST', 'STRESS', 'LERNEN'] },

  // ─── Jahreszeiten & Feste ───
  { theme: 'Winter',            spangram: 'WINTER',    words: ['SCHNEE', 'EIS', 'KÄLTE', 'MÜTZE', 'SCHAL', 'FROST'] },
  { theme: 'Sommer',            spangram: 'SOMMER',    words: ['SONNE', 'HEISS', 'BADEN', 'EIS', 'STRAND', 'REGEN'] },
  { theme: 'Frühling',          spangram: 'FRÜHLING',  words: ['BLUME', 'GRÜN', 'KNOSPE', 'BIENE', 'WARM', 'SAAT'] },
  { theme: 'Herbst',            spangram: 'HERBST',    words: ['LAUB', 'WIND', 'NEBEL', 'PILZ', 'KASTANIE', 'REGEN'] },
  { theme: 'Weihnachten',       spangram: 'ADVENT',    words: ['BAUM', 'KERZE', 'GLOCKE', 'ENGEL', 'SCHNEE', 'STERNE'] },
  { theme: 'Ostern',            spangram: 'OSTERN',    words: ['EIER', 'HASE', 'NEST', 'SCHOKO', 'BLUME', 'KORB'] },

  // ─── Technik & Wissenschaft ───
  { theme: 'Autoteile',         spangram: 'AUTO',      words: ['REIFEN', 'MOTOR', 'BREMSE', 'HUPE', 'GURTE', 'RAD'] },
  { theme: 'Computer',          spangram: 'DIGITAL',   words: ['MAUS', 'CHIP', 'LAPTOP', 'MONITOR', 'ROUTER', 'TASTE'] },
  { theme: 'Elektronik',        spangram: 'CHIP',      words: ['KABEL', 'AKKU', 'DIODE', 'STROM', 'VOLT', 'WATT'] },
  { theme: 'Informatik',        spangram: 'DIGITAL',   words: ['CODE', 'BUG', 'LOOP', 'SERVER', 'LINUX', 'PYTHON'] },
  { theme: 'Webentwicklung',    spangram: 'WEB',       words: ['HTML', 'CSS', 'JSCRIPT', 'SERVER', 'DOMAIN', 'BROWSER'] },
  { theme: 'Physik',            spangram: 'PHYSIK',    words: ['KRAFT', 'MASSE', 'ENERGIE', 'ATOM', 'LICHT', 'SCHALL'] },
  { theme: 'Chemie',            spangram: 'CHEMIE',    words: ['ATOM', 'MOLEKÜL', 'SÄURE', 'BASE', 'SALZ', 'ELEMENT'] },
  { theme: 'Astronomie',        spangram: 'KOSMOS',    words: ['PLANET', 'STERN', 'MOND', 'GALAXIE', 'KOMET', 'ORBIT'] },
  { theme: 'Raumfahrt',         spangram: 'RAKETE',    words: ['SATURN', 'MARS', 'VENUS', 'APOLLO', 'SHUTTLE', 'KAPSEL'] },
  { theme: 'Mathematik',        spangram: 'MATHE',     words: ['ZAHL', 'FORMEL', 'BRUCH', 'WURZEL', 'QUADRAT', 'GEOMETRI'] },
  { theme: 'Biologie',          spangram: 'GENETIK',   words: ['ZELLE', 'DNA', 'RNA', 'GEN', 'ART', 'EVO'] },
  { theme: 'Elektrotechnik',    spangram: 'STROM',     words: ['VOLT', 'WATT', 'OHM', 'AMPERE', 'KABEL', 'AKKU'] },
  { theme: 'Maschinenbau',      spangram: 'MOTOR',     words: ['WELLE', 'LAGER', 'GETRIEBE', 'KOLBEN', 'VENTIL', 'SCHRAUBE'] },

  // ─── Körper & Gesundheit ───
  { theme: 'Körper',            spangram: 'KÖRPER',    words: ['HAND', 'FUSS', 'AUGE', 'NASE', 'OHR', 'MUND'] },
  { theme: 'Körperteile',       spangram: 'KÖRPER',    words: ['KOPF', 'ARM', 'BEIN', 'HAND', 'FUSS', 'RUMPF'] },
  { theme: 'Innere Organe',     spangram: 'ORGAN',     words: ['HERZ', 'LUNGE', 'LEBER', 'NIERE', 'MAGEN', 'GEHIRN'] },
  { theme: 'Sinne',             spangram: 'SINNE',     words: ['SEHEN', 'HÖREN', 'RIECHEN', 'SCHMECK', 'FÜHLEN', 'TASTEN'] },
  { theme: 'Krankheiten',       spangram: 'KRANK',     words: ['FIEBER', 'HUSTEN', 'SCHNUPFEN', 'GRIPPE', 'ASTHMA', 'PEST'] },
  { theme: 'Fitness',           spangram: 'SPORT',     words: ['TRAINING', 'MUSKEL', 'SCHWEISS', 'KRAFT', 'AUSDAUER', 'DIÄT'] },
  { theme: 'Hygiene',           spangram: 'SEIFE',     words: ['DUSCHE', 'BAD', 'WASSER', 'CREME', 'ZAHN', 'SHAMPOO'] },
  { theme: 'Schlaf',            spangram: 'SCHLAF',    words: ['TRAUM', 'BETT', 'KISSEN', 'DECKE', 'RUHE', 'NACHT'] },
  { theme: 'Lebensphasen',      spangram: 'LEBEN',     words: ['BABY', 'KIND', 'JUGEND', 'ALTER', 'TOD', 'GEBURT'] },
  { theme: 'Medizin',           spangram: 'DOKTOR',    words: ['ARZT', 'SPRITZE', 'PILLE', 'BINDE', 'GIPS', 'KRANK'] },
  { theme: 'Medizinhilfe',      spangram: 'HILFE',     words: ['GIPS', 'BINDE', 'PFLASTER', 'SPRITZE', 'STUHL', 'KRÜCKE'] },

  // ─── Gebäude & Wohnen ───
  { theme: 'Stadt',             spangram: 'STADT',     words: ['HAUS', 'TURM', 'STRASSE', 'BRÜCKE', 'PARK', 'BAHN'] },
  { theme: 'Gebäude',           spangram: 'HAUS',      words: ['DACH', 'TÜR', 'FENSTER', 'WAND', 'STUFE', 'KELLER'] },
  { theme: 'Bauelemente',       spangram: 'HAUS',      words: ['ZIEGEL', 'BALKEN', 'FENSTER', 'TÜR', 'MAUER', 'DACH'] },
  { theme: 'Schlafzimmer',      spangram: 'BETT',      words: ['KISSEN', 'DECKE', 'SCHRANK', 'LAMPE', 'MATRATZE', 'TEPPICH'] },
  { theme: 'Wohnzimmer',        spangram: 'SOFA',      words: ['TISCH', 'SESSEL', 'LAMPE', 'TEPPICH', 'KISSEN', 'REGAL'] },
  { theme: 'Keller & Dach',     spangram: 'HAUS',      words: ['KISTE', 'REGAL', 'STAUB', 'HOLZ', 'ZIEGEL', 'BALKEN'] },
  { theme: 'Wohnen & Möbel',    spangram: 'MÖBEL',     words: ['SCHRANK', 'TISCH', 'STUHL', 'BETT', 'SOFA', 'KOMMODE'] },
  { theme: 'Bad & Hygiene',     spangram: 'BAD',       words: ['SEIFE', 'CREME', 'DUSCHE', 'WANNE', 'TUCH', 'PFLEGE'] },

  // ─── Werkzeug & Handwerk ───
  { theme: 'Werkzeug',          spangram: 'WERKZEUG',  words: ['HAMMER', 'ZANGE', 'SÄGE', 'BOHRER', 'FEILE', 'SCHRAUBE'] },
  { theme: 'Werkstatt',         spangram: 'WERKZEUG',  words: ['HAMMER', 'SÄGE', 'ZANGE', 'NAGEL', 'BOLZEN', 'FEILE'] },
  { theme: 'Werkzeuge',         spangram: 'SÄGE',      words: ['ZANGE', 'FEILE', 'HAMMER', 'MEISSEL', 'BOHRER', 'SCHRAUBE'] },
  { theme: 'Heimwerken',        spangram: 'BOHRER',    words: ['SCHRAUBE', 'NAGEL', 'DÜBEL', 'LEIM', 'SPACHTEL', 'ZANGE'] },
  { theme: 'Handarbeiten',      spangram: 'NADEL',     words: ['WOLLE', 'GARN', 'FADEN', 'STRICKEN', 'HÄKELN', 'STICKEN'] },
  { theme: 'Gartenarbeit',      spangram: 'GARTEN',    words: ['BEET', 'ERDE', 'SPATEN', 'HECKE', 'RASEN', 'SCHAUFEL'] },
  { theme: 'Berufe Handwerk',   spangram: 'HANDWERK',  words: ['MAURER', 'TISCHLER', 'MALER', 'KLEMPNER', 'ELEKTRO', 'SCHMIED'] },
  { theme: 'Baustelle',         spangram: 'MAURER',    words: ['STEIN', 'KALK', 'KRAN', 'HELM', 'WAND', 'PUTZ'] },
  { theme: 'Baumaschinen',      spangram: 'KRAN',      words: ['BAGGER', 'WALZE', 'BOHRER', 'LADER', 'PUMPE', 'TRUCK'] },

  // ─── Transport & Reisen ───
  { theme: 'Fahrrad',           spangram: 'RAD',       words: ['PEDAL', 'KETTE', 'SATTEL', 'RAHMEN', 'LENKER', 'REIFEN'] },
  { theme: 'Schifffahrt',       spangram: 'SCHIFF',    words: ['ANKER', 'BUG', 'HECK', 'MAST', 'SEGEL', 'KAPITÄN'] },
  { theme: 'Luftfahrt',         spangram: 'FLUG',      words: ['PILOT', 'KABINE', 'FLÜGEL', 'RADAR', 'TOWER', 'JET'] },
  { theme: 'Bahn & Schiene',    spangram: 'BAHN',      words: ['ZUG', 'GLEIS', 'LOK', 'WAGON', 'CHEF', 'FAHRT'] },
  { theme: 'Strassenverkehr',   spangram: 'AMPEL',     words: ['STRASSE', 'AUTO', 'BUS', 'RADLER', 'GÄNGER', 'SCHILD'] },
  { theme: 'Öffentlicher Verk.', spangram: 'BUS',      words: ['TRAM', 'UBAHN', 'HALTE', 'TICKET', 'LINIE', 'NETZ'] },
  { theme: 'Flughafen',         spangram: 'FLUG',      words: ['PILOT', 'TICKET', 'GATE', 'START', 'LANDEN', 'KOFFER'] },
  { theme: 'Bahnfahren',        spangram: 'ZUG',       words: ['GLEIS', 'TICKET', 'WAGON', 'LOK', 'BAHNHOF', 'FAHRT'] },
  { theme: 'Hotel',             spangram: 'HOTEL',     words: ['ZIMMER', 'BETT', 'SCHLÜSSEL', 'BAR', 'POOL', 'GAST'] },
  { theme: 'Restaurant',        spangram: 'MENUE',     words: ['TISCH', 'STUHL', 'KELLNER', 'GABEL', 'MESSER', 'TELLER'] },
  { theme: 'Tourismus',         spangram: 'REISE',     words: ['URLAUB', 'HOTEL', 'FLUG', 'STRAND', 'TOURIST', 'VISUM'] },
  { theme: 'Transport & Logi.', spangram: 'FRACHT',    words: ['LKW', 'SCHIFF', 'FLUGZEUG', 'ZUG', 'AUTO', 'PAKET'] },

  // ─── Rettung & Sicherheit ───
  { theme: 'Feuerwehr',         spangram: 'RETTUNG',   words: ['FEUER', 'WASSER', 'SCHLAUCH', 'LEITER', 'SIRENE', 'HELM'] },
  { theme: 'Polizei',           spangram: 'POLIZEI',   words: ['STREIFE', 'LAMPE', 'SIRENE', 'KELLE', 'MARKE', 'AUTO'] },
  { theme: 'Rettungsfahrzeuge', spangram: 'SIRENE',    words: ['BLAU', 'LICHT', 'NOTRUF', 'KRANKEN', 'WACHE', 'HELFER'] },

  // ─── Berufe & Wirtschaft ───
  { theme: 'Berufe',            spangram: 'BERUF',     words: ['ARZT', 'LEHRER', 'KOCH', 'BÄCKER', 'PILOT', 'PFLEGE'] },
  { theme: 'Medizinische Ber.', spangram: 'MEDIZIN',   words: ['ARZT', 'PFLEGER', 'CHIRURG', 'APOTHEK', 'HELFER', 'DENTIST'] },
  { theme: 'Bildung & Schule',  spangram: 'LERNEN',    words: ['SCHULE', 'KLASSE', 'LEHRER', 'SCHÜLER', 'HEFT', 'BUCH'] },
  { theme: 'Universität',       spangram: 'UNI',       words: ['STUDIUM', 'MENSA', 'VORLESUNG', 'SKRIPT', 'PROF', 'KLAUSUR'] },
  { theme: 'Geld & Banken',     spangram: 'BANK',      words: ['GELD', 'KONTO', 'KARTE', 'MÜNZE', 'SCHEIN', 'ZINS'] },
  { theme: 'Post & Briefverk.', spangram: 'POST',      words: ['BRIEF', 'PAKET', 'MARKE', 'ADRESSE', 'KASTEN', 'BOTE'] },
  { theme: 'Politik',           spangram: 'POLITIK',   words: ['WAHL', 'PARTEI', 'GESETZ', 'REGIER', 'SENAT', 'KANZLER'] },
  { theme: 'Recht & Justiz',    spangram: 'RECHT',     words: ['URTEIL', 'GESETZ', 'GERICHT', 'ANWALT', 'RICHTER', 'STRAFE'] },
  { theme: 'Wirtschaft',        spangram: 'MARKT',     words: ['FIRMA', 'AKTIE', 'GELD', 'BANK', 'HANDEL', 'KRISE'] },
  { theme: 'Immobilien',        spangram: 'HAUS',      words: ['MIETE', 'KAUF', 'WOHNUNG', 'MAKLER', 'ZINS', 'HYPOTHEK'] },
  { theme: 'Medien',            spangram: 'MEDIEN',    words: ['PRESSE', 'RADIO', 'TV', 'ZEITUNG', 'ONLINE', 'BLOG'] },
  { theme: 'Marketing',         spangram: 'MARKE',     words: ['WERBUNG', 'LOGO', 'KUNDE', 'PREIS', 'RABATT', 'MEDIA'] },

  // ─── Natur & Geographie ───
  { theme: 'Flüsse',            spangram: 'FLUSS',     words: ['RHEIN', 'DONAU', 'ELBE', 'MAIN', 'NECKAR', 'MOSEL'] },
  { theme: 'Meere & Ozeane',    spangram: 'OZEAN',     words: ['PAZIFIK', 'ATLANTIK', 'INDIK', 'ARKTIS', 'ANTARK', 'NORDSEE'] },
  { theme: 'Kontinente',        spangram: 'ERDE',      words: ['ASIEN', 'EUROPA', 'AFRIKA', 'AMERIKA', 'OZEANIEN', 'POL'] },
  { theme: 'Länder Europas',    spangram: 'EUROPA',    words: ['DEUTSCH', 'FRANKREI', 'ITALIEN', 'SPANIEN', 'POLEN', 'SCHWEIZ'] },
  { theme: 'Deutsche Städte',   spangram: 'STÄDTE',    words: ['BERLIN', 'HAMBURG', 'MÜNCHEN', 'KÖLN', 'FRANKFUR', 'LEIPZIG'] },
  { theme: 'Himmelsrichtungen', spangram: 'NORDEN',    words: ['SÜDEN', 'OSTEN', 'WESTEN', 'OBEN', 'UNTEN', 'SEITE'] },
  { theme: 'Wolkenarten',       spangram: 'WOLKE',     words: ['CUMULUS', 'STRATUS', 'CIRRUS', 'NIMBUS', 'NEBEL', 'DUNST'] },
  { theme: 'Wüsten',            spangram: 'WÜSTE',     words: ['SAHARA', 'GOBI', 'MOJAVE', 'KALAHARI', 'ATACAMA', 'NAMIB'] },
  { theme: 'Gesteinsarten',     spangram: 'GESTEIN',   words: ['GRANIT', 'BASALT', 'MARMOR', 'QUARZ', 'KALK', 'SCHIEFER'] },
  { theme: 'Metalle',           spangram: 'METALL',    words: ['EISEN', 'GOLD', 'SILBER', 'KUPFER', 'BLEI', 'ZINK'] },

  // ─── Gefühle & Abstraktes ───
  { theme: 'Gefühle',           spangram: 'FREUDE',    words: ['LACHEN', 'WEINEN', 'WUT', 'LIEBE', 'ANGST', 'STOLZ'] },
  { theme: 'Emotionen',         spangram: 'GEFÜHL',    words: ['GLÜCK', 'TRAUER', 'ANGST', 'ZORN', 'LUST', 'RUHE'] },

  // ─── Zeit ───
  { theme: 'Zeit',              spangram: 'ZEIT',      words: ['STUNDE', 'MINUTE', 'SEKUNDE', 'TAG', 'WOCHE', 'JAHR'] },
  { theme: 'Zeiteinheiten',     spangram: 'ZEIT',      words: ['JAHR', 'MONAT', 'WOCHE', 'TAG', 'STUNDE', 'MINUTE'] },
  { theme: 'Jahreszeiten',      spangram: 'SOMMER',    words: ['WINTER', 'HERBST', 'FRÜHLING', 'WÄRME', 'KÄLTE', 'SCHNEE'] },
  { theme: 'Tageszeiten',       spangram: 'TAG',       words: ['MORGEN', 'MITTAG', 'ABEND', 'NACHT', 'FRÜH', 'SPÄT'] },
  { theme: 'Wochentage',        spangram: 'WOCHE',     words: ['MONTAG', 'DIENSTAG', 'MITTWOCH', 'DONNER', 'FREITAG', 'SAMSTAG'] },
  { theme: 'Monate',            spangram: 'MONAT',     words: ['MÄRZ', 'APRIL', 'MAI', 'JUNI', 'JULI', 'AUGUST'] },

  // ─── Himmelskörper & Welt ───
  { theme: 'Himmelskörper',     spangram: 'STERN',     words: ['SONNE', 'MOND', 'ERDE', 'PLANET', 'KOMET', 'METEOR'] },
  { theme: 'Richtungen',        spangram: 'WEG',       words: ['LINKS', 'RECHTS', 'GERADE', 'OBEN', 'UNTEN', 'HINTEN'] },
  { theme: 'Dimensionen',       spangram: 'RAUM',      words: ['PUNKT', 'LINIE', 'FLÄCHE', 'KÖRPER', 'HÖHE', 'BREITE'] },
  { theme: 'Geschichte',        spangram: 'ZEIT',      words: ['EPOCHE', 'ALTER', 'ANTIKE', 'MITTEL', 'NEUZEIT', 'REICH'] },
  { theme: 'Zukunft',           spangram: 'FUTUR',     words: ['MORGEN', 'VISION', 'ROBOTER', 'KI', 'PLAN', 'TRÄUME'] },
  { theme: 'Umwelt & Natur',    spangram: 'UMWELT',    words: ['WALD', 'WASSER', 'KLIMA', 'SCHUTZ', 'ABFALL', 'ENERGIE'] },

  // ─── Reinigung & Haushalt ───
  { theme: 'Haushaltsgeräte',   spangram: 'GERÄT',     words: ['HERD', 'OFEN', 'MIXER', 'TOASTER', 'LAMPE', 'BÜGLER'] },
  { theme: 'Reinigung',         spangram: 'PUTZEN',    words: ['SEIFE', 'LAPPEN', 'EIMER', 'BESEN', 'WASSER', 'SCHWAMM'] },

  // ─── Fotografie ───
  { theme: 'Fotografie',        spangram: 'KAMERA',    words: ['FOTO', 'ZOOM', 'BLITZ', 'BILD', 'LINSE', 'FOKUS'] },
];

// Filter words by max length for a given difficulty
export function pickWordsForDifficulty(
  pack: ThemePack,
  count: number,
  maxLen: number
): { words: string[]; spangram: string } {
  const filtered = pack.words.filter(w => w.length >= 3 && w.length <= maxLen);
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, Math.min(count, shuffled.length));
  return { words: picked, spangram: pack.spangram };
}

export function pickRandomTheme(exclude?: string): ThemePack {
  const available = THEME_PACKS.filter(p => p.theme !== exclude);
  const pool = available.length > 0 ? available : THEME_PACKS;
  return pool[Math.floor(Math.random() * pool.length)];
}
