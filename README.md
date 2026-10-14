# API’s en events controleren met Spectral

Met dit pakket controleer je een API-beschrijving of een eventbericht op een aantal Normo-regels. Spectral is het programma dat de controles uitvoert. Dit pakket bevat de regels, de JavaScript-functies die daarbij horen en voorbeelden om mee te oefenen.

Dit is versie **1.0.0-rc.1**. Deze versie is bedoeld om te testen en te beoordelen. Het is geen officiële uitgave of goedkeuring van Het Normo.

## Wat betekenen de belangrijkste woorden?

| Woord | Betekenis |
| --- | --- |
| API | Een manier waarop programma’s gegevens met elkaar uitwisselen. |
| API-contract | Een bestand met afspraken over een API. Bijvoorbeeld welke gegevens je kunt opvragen en welk antwoord je krijgt. |
| OpenAPI | Een vaste manier om een REST API-contract te beschrijven. |
| Event | Een bericht over iets dat is gebeurd, bijvoorbeeld een gewijzigde overeenkomst. |
| JSON en YAML | Bestandsformaten waarin je gegevens en afspraken kunt opschrijven. |
| Linter | Een programma dat een bestand automatisch op regels controleert. Spectral is zo’n programma. |
| Ruleset of profiel | Een groep regels die je samen gebruikt voor een controle. |
| Payload | De inhoudelijke gegevens in een bericht. Bij een event staan die meestal in `data`. |
| Schema | Een beschrijving van de toegestane gegevens, zoals veldnamen, typen en lengtes. |
| URI of URL | Een URI wijst iets aan. Een URL is een soort URI die ook een adres geeft, zoals een webadres. |

## 1. Installeren en testen

Gebruik Node.js 22 of een ondersteunde versie vanaf 24. Deze map is getest met **Node.js 24.19.0** en **Spectral 6.17.0**.

Pak de hele map uit. De YAML-bestanden gebruiken JavaScript-bestanden uit `rulesets/functions` en `rulesets/lib`. Je hebt die bestanden dus ook nodig.

Open een terminal. Dat is het venster waarin je opdrachten typt.

Je kunt het pakket ook met Git ophalen uit [HetNormo/API-linter](https://github.com/HetNormo/API-linter). Deze opdracht maakt een lokale map met de naam `normo-spectral`:

```bash
git clone https://github.com/HetNormo/API-linter.git normo-spectral
```

Ga naar de map en voer uit:

```bash
cd normo-spectral
npm install --ignore-scripts
npm run verify
```

Sta je al in de map `normo-spectral`? Sla dan de eerste opdracht over.

`npm install` haalt de benodigde software op. Met `--ignore-scripts` laat je npm geen installatiescripts uitvoeren. `npm run verify` controleert daarna of het pakket goed werkt. De opdracht geeft een foutcode als Spectral ontbreekt of een test mislukt.

De laatste controle op 14 oktober 2026 is geslaagd:

- Alle **234 functietests** slagen. Die testen losse onderdelen van de code.
- De **3 gegenereerde rulesets** komen overeen met de lijst van regels.
- Alle **9 integratietests** slagen. Die testen de samenwerking met Spectral, inclusief YAML, JSON en verwijzingen naar andere onderdelen.

Bekijk het [testrapport](reports/TESTRAPPORT.md) voor uitleg. De resultaten bij deze versie staan in [verify.log](reports/verify.log) en [integration.json](reports/integration.json). Bij een nieuwe uitvoering schrijft het integratiescript de resultaten naar `reports/local-integration.json`. `npm test` voert alleen de functietests uit. Daarvoor hoef je eerst geen npm-pakketten te installeren.

### Dezelfde softwareversies gebruiken

In `package-lock.json` staan de exacte versies van de geïnstalleerde pakketten. Bewaar dit bestand samen met de code in versiebeheer. Gebruik bij volgende schone installaties, bijvoorbeeld op een testserver:

```bash
npm ci --ignore-scripts
```

Controleer bekende beveiligingsproblemen met:

```bash
npm audit
```

Bij de controle op 14 oktober 2026 meldde npm **4 problemen met ernstniveau `high`**. Ze zitten in de keten van softwarepakketten rond `braces`, die Spectral gebruikt. De audit meldde toen geen beschikbare oplossing. De functionele tests slagen, maar deze beveiligingsmelding staat nog open.

## 2. Een REST API-contract controleren

Begin met het meegeleverde voorbeeld:

```bash
npm run lint:api -- examples/api-valid.yaml
```

Controleer daarna je eigen bestand. Vervang `pad/naar/openapi.yaml` door het pad naar dat bestand:

```bash
npm run lint:api -- pad/naar/openapi.yaml
```

Dit profiel bevat 44 eigen regels en de algemene OpenAPI-regels van Spectral (`spectral:oas`). Het controleert onder meer de beschrijving van de API, versienummers, antwoordcodes, foutmeldingen, schema’s, tekstlengtes en afspraken over toegang.

Het controleert ook cursorpaginering. Daarbij vraag je resultaten in delen op. Een cursor is een waarde waarmee je het volgende deel kunt opvragen.

Je kunt **OpenAPI 3.0.x en 3.1.x** gebruiken, als JSON of YAML. De eigen regels van dit pakket zijn nog niet beoordeeld voor OpenAPI 3.2. Spectral 6.17 ondersteunt die versie wel.

Spectral volgt verwijzingen naar schema’s en andere OpenAPI-onderdelen. Een melding wijst naar de plek in het bestand waar het probleem zit. De regels controleren ook schema’s binnen andere schema’s, callbacks en webhooks: beschreven vervolgverzoeken en meldingen van een API. Een schema met alleen `true` of `false` is in OpenAPI 3.1 toegestaan en telt niet als een ontbrekend schema.

## 3. Een eventbericht controleren

Gebruik voor events deze opdrachten:

```bash
npm run lint:events -- examples/event-valid.json
npm run lint:events -- pad/naar/event.json
npm run check:size -- pad/naar/event.json
```

Het eventprofiel bevat 21 regels. Geef per bestand **één CloudEvent als JSON-object** mee. CloudEvents is een vaste manier om eventberichten op te bouwen. De regels controleren onder meer de afzender, veldnamen, versie, tijd, het gegevenstype en de grootte.

Een bericht mag een payload hebben of geen payload hebben. Als `data` aanwezig is, verwacht dit profiel een JSON-object met ten minste één veld. `dataref`, een verwijzing naar de gegevens, is optioneel. Dat blijft zo als `data` ontbreekt.

Dit profiel verwerkt geen AsyncAPI-beschrijving, los JSON Schema, lijst met meerdere events, binaire verzending of payload in `data_base64`. Staat er een schema-adres in `dataschema`? Dan controleert de linter de vorm van het adres. Hij haalt het schema niet op en toetst de payload er niet aan.

### De grootte van een bericht

De twee controles meten iets anders:

| Controle | Wat wordt gemeten? |
| --- | --- |
| `lint:events` | De grootte van de JSON zonder overbodige spaties en regeleinden. |
| `check:size` | De oorspronkelijke bestandsbytes, inclusief spaties en regeleinden. |

Standaard is 1 kB gelijk aan 1000 bytes. De adviesgrens is **64.000 bytes**. De maximumgrens is **256.000 bytes**.

Bij verzending kunnen extra bytes nodig zijn, bijvoorbeeld voor headers. Weet je hoeveel dat er zijn? Tel ze dan mee met `--overhead`:

```bash
npm run check:size -- examples/event-valid.json --overhead 1024
```

Dit meet nog niet de volledige netwerkverbinding. Heb je afgesproken om 1024 bytes per kB te gebruiken? Pas dan beide groottesregels aan en gebruik `--kilobyte 1024` bij `check:size`. Zie [de instellingen](docs/CONFIGURATIE.md) en besluit E02 in [de uitleg over keuzes](docs/BESLUITEN.md).

## 4. Een centrale sectorale API controleren

Gebruik het aanvullende profiel voor een centrale sectorale API:

```bash
npm run lint:central -- examples/api-valid.json
```

Dit profiel gebruikt alle REST-regels en voegt vier controles toe. Die gaan over de domeinnaam, de opbouw van het adres, kleine letters en variabelen in het serveradres.

Het volledige adres bestaat uit `servers.url` plus het pad van de API-handeling. Een versienummer in `servers.url` telt dus mee. Gebruik dit aanvullende profiel alleen waar de centrale URI-afspraken gelden. Het staat standaard uit voor lokale API’s.

## 5. Spectral direct gebruiken

De npm-opdrachten hierboven zijn snelkoppelingen. Je kunt dezelfde controles direct met Spectral uitvoeren:

```bash
# REST API
npx spectral lint examples/api-valid.yaml --ruleset .spectral.yaml

# Eventbericht
npx spectral lint examples/event-valid.json --ruleset .spectral-events.yaml

# Centrale sectorale API
npx spectral lint examples/api-valid.json --ruleset rulesets/normo-central.yaml
```

Na installatie gebruikt `npx` hier de Spectral-versie uit deze map. Je blijft de YAML-regels en de bijbehorende JavaScript-bestanden nodig hebben.

De extra controle op de oorspronkelijke bestandsgrootte kun je ook direct uitvoeren:

```bash
node scripts/check-event-size.mjs pad/naar/event.json
```

## 6. Meldingen en voortgang bekijken

Spectral toont standaard alle gevonden meldingen van de actieve regels:

| Niveau | Betekenis |
| --- | --- |
| `error` | Een fout. De standaardopdracht geeft een foutcode terug. |
| `warn` / `warning` | Een waarschuwing. Bekijk of je iets moet aanpassen. |
| `info` / `information` | Informatie of een punt dat iemand moet beoordelen. |
| `hint` | Een tip, als een actieve regel dit niveau gebruikt. |

De 69 eigen regels zijn ingesteld op 49 errors, 17 warnings en 3 informatieve meldingen. De algemene regels van Spectral tellen hierin niet mee.

Met `--verbose` zie je extra uitvoer over de geladen regels en de bestanden die worden gecontroleerd:

```bash
npm run lint:api -- examples/api-valid.yaml --verbose
```

Of direct met Spectral:

```bash
npx spectral lint examples/api-valid.yaml --ruleset .spectral.yaml --verbose
```

Spectral toont geen voortgangspercentage en geen aparte ‘OK’ voor iedere geslaagde regel. De meldingen verschijnen als de controle klaar is.

`--fail-severity` bepaalt vanaf welk niveau de opdracht een foutcode geeft. Het verbergt geen andere meldingen. Gebruik bijvoorbeeld `warn` als ook waarschuwingen de automatische controle moeten laten mislukken:

```bash
npm run lint:api -- pad/naar/openapi.yaml --fail-severity warn
```

Wil je alle meldingen blijven zien? Gebruik dan geen `--display-only-failures`.

### Uitvoer bekijken en bewaren

In bash of zsh kun je de uitvoer tegelijk op het scherm tonen en in een bestand opslaan:

```bash
set -o pipefail
npx spectral lint examples/api-valid.yaml \
  --ruleset .spectral.yaml \
  --verbose 2>&1 | tee reports/spectral-api.log
```

`tee` bewaart een kopie van de uitvoer. `2>&1` neemt ook foutmeldingen mee. `pipefail` zorgt dat een foutcode van Spectral behouden blijft.

## 7. Regels aanpassen en uitzonderingen vastleggen

Een regel kan komen uit een Normo-eis, een advies, HTTP, CloudEvents of een extra keuze van dit pakket. In [de regelcatalogus](rulesets/rule-catalog.json) staat per regel waar die vandaan komt en hoe ernstig een melding is.

Soms is een uitzondering nodig. Leg dan de regelcode, de plek in het document, de reden, de eigenaar, de beoordelaar en de einddatum vast. Gebruik hiervoor [AFWIJKING-TEMPLATE.json](docs/AFWIJKING-TEMPLATE.json). Dit bestand legt de afspraak vast; het schakelt zelf geen controle uit.

Je kunt extra velden met `x-normo-*` gebruiken om bepaalde keuzes toe te lichten. Deze velden horen bij dit pakket. Ze zijn geen officiële Normo-afspraken. Zie [regels en instellingen aanpassen](docs/CONFIGURATIE.md).

## 8. Bestanden en onderhoud

| Bestand | Waarvoor gebruik je het? |
| --- | --- |
| `rulesets/normo-oas.yaml` | Regels voor REST API-contracten. |
| `rulesets/normo-events.yaml` | Regels voor eventberichten. |
| `rulesets/normo-central.yaml` | Extra regels voor centrale API-adressen. |
| [DEKKING.md](docs/DEKKING.md) | Zien welke eisen automatisch worden gecontroleerd en wat je zelf moet beoordelen. |
| [BESLUITEN.md](docs/BESLUITEN.md) | Begrijpen welke keuzes in dit pakket zijn gemaakt. |
| [REVIEW.md](docs/REVIEW.md) | Controles uitvoeren die een mens of een test van de werkende software moet doen. |
| [BRONNEN.md](docs/BRONNEN.md) | De gebruikte standaarden en hun versies opzoeken. |
| [CHANGELOG.md](CHANGELOG.md) | Lezen wat er is veranderd. |

De basis bestaat uit Normo API Design Rules 6.0, Event Data Specification 2.0 en de toepasselijke centrale URI Conventions 2.0.

De drie YAML-rulesets worden gemaakt uit de regelcatalogus. Heb je die catalogus aangepast? Voer dan uit:

```bash
npm run build:rulesets
npm run check:generated
```

Zet eigen aanpassingen in een apart instellingenbestand dat het bestaande profiel gebruikt. Zo raak je ze niet kwijt als de YAML opnieuw wordt gemaakt. Een voorbeeld staat in [CONFIGURATIE.md](docs/CONFIGURATIE.md).

[ci/azure-pipelines.yml](ci/azure-pipelines.yml) is een voorbeeld voor automatische controles op een testserver. Daarvoor moet `package-lock.json` in versiebeheer staan. Vul in dat voorbeeld de paden naar je eigen contracten in.

## Wat zegt een geslaagde controle?

Een resultaat zonder errors betekent dat de gekozen regels geen fouten in het aangeboden bestand hebben gevonden. Je moet daarnaast de werkende software testen en inhoudelijke keuzes laten beoordelen.

Controleer bijvoorbeeld of gebruikers alleen toegestane gegevens kunnen zien, of events goed herkenbaar zijn en of de payload klopt met de afgesproken gegevens. Ook privacy en de volledige naleving van Normo vragen een aparte beoordeling. Gebruik hiervoor de [controlelijst](docs/REVIEW.md).
