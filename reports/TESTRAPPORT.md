# Testrapport van het Normo Spectral-pakket

Pakketversie: **1.0.0-rc.1**. Laatste volledige verificatie: **14 oktober 2026**, met **Node.js 24.19.0** en **Spectral 6.17.0**.

De installatie en de functionele controles zijn geslaagd. Er staan nog vier beveiligingsmeldingen uit `npm audit` open.

## Resultaten van de laatste controle

| Controle | Resultaat |
| --- | --- |
| `npm install --ignore-scripts` | Geslaagd. Er zijn 242 pakketten geïnstalleerd. |
| Functietests | Alle 234 geslaagd. Deze testen losse onderdelen, met geldige en ongeldige invoer en bepaalde grensgevallen. |
| Gegenereerde rulesets | Alle drie komen overeen met de regelcatalogus. |
| Integratietests met Spectral | Alle negen scenario’s geslaagd. |
| REST-voorbeeld `examples/api-valid.yaml` | Geslaagd, zonder bevindingen. |
| Eventvoorbeeld `examples/event-valid.json` | Geslaagd, zonder bevindingen. |
| Centraal profiel met `examples/api-valid.json` | Geslaagd, zonder bevindingen. |
| Grootte van `examples/event-valid.json` | 451 bestandsbytes en 363 bytes als compacte JSON. Onder de adviesgrens van 64.000 en maximumgrens van 256.000 bytes. Er is geen extra verzendruimte meegeteld. |
| `npm audit` | Vier meldingen met niveau `high`. Deze controle is nog niet geslaagd. |

Het volledige verificatielog van deze versie staat in [verify.log](verify.log). De details van de negen integratietests staan in [integration.json](integration.json). De bronpaden in die kopie zijn ingekort tot projectpaden of tijdelijke bestandsnamen. Bij een nieuwe uitvoering schrijft het integratiescript naar `reports/local-integration.json`.

## Wat testen de negen integratiescenario’s?

De tests controleren een geldig event, een event zonder payload, een API in JSON en een API in YAML. Ze testen ook verwijzingen naar OpenAPI-onderdelen en het centrale URI-profiel.

De overige drie scenario’s gebruiken bewust ongeldige invoer: een ongeldig event, een ongeldige API en een verwijzing naar een ontbrekend onderdeel. Deze tests slagen als Spectral de verwachte fout herkent en een foutcode teruggeeft.

De opdrachten staan in [scripts/integration.mjs](../scripts/integration.mjs).

## Welke fout is hersteld?

Spectral voegde bij controles zonder bevindingen een tekstmelding achter de JSON-uitvoer toe. Daardoor kon het integratiescript zes resultaten niet lezen, terwijl de controles zelf goed gingen.

De Spectral-aanroep gebruikt nu `--quiet`. Daarmee blijft de uitvoer geldige JSON. Daarna zijn alle negen integratietests geslaagd.

## Welke beveiligingsmelding staat nog open?

`npm audit` meldde een probleem in `braces`. Dat pakket wordt gebruikt via `micromatch`, `fast-glob` en `@stoplight/spectral-cli`. npm rapporteert voor deze keten vier meldingen met ernstniveau `high`. De audit gaf aan dat er geen oplossing beschikbaar was.

De exacte geïnstalleerde versies staan in [package-lock.json](../package-lock.json). Bekijk deze meldingen opnieuw voordat je het pakket goedkeurt voor gebruik. Voer daarvoor `npm audit` uit.

## De eerste oplevering

Bij de eerste oplevering slaagden alle 234 functietests onder Node.js 22.16.0. Ook de controle van de bestandsopbouw slaagde. De API-voorbeelden in JSON en YAML bevatten dezelfde gegevens. Het verslag van die functietests staat in [unit-tests.tap](unit-tests.tap). De eerdere controles staan in [structure-checks.json](structure-checks.json) en [event-size.json](event-size.json).

De installatie vanaf npm mislukte toen met `EAI_AGAIN`, een fout bij het opzoeken van het npm-adres. Er was nog geen lockfile en de integratietests waren nog niet uitgevoerd. [summary.json](summary.json) en [npm-install.log](npm-install.log) bewaren die oorspronkelijke situatie. Gebruik voor de teststatus van deze versie het bovenstaande overzicht en `integration.json`.

## Wat moet er nog gebeuren?

Test je eigen contracten en de werkende software voordat je dit pakket voor jouw omgeving goedkeurt. De geslaagde tests bewijzen niet dat alle denkbare gevallen zijn getest of dat iedere API aan alle Normo-eisen voldoet.

[DEKKING.md](../docs/DEKKING.md) laat zien welke eisen automatisch worden gecontroleerd. [BESLUITEN.md](../docs/BESLUITEN.md) legt de gemaakte keuzes uit. Gebruik [REVIEW.md](../docs/REVIEW.md) voor de aanvullende controles.

Bij een volgende schone installatie gebruik je `npm ci --ignore-scripts`. Voer daarna `npm run verify` uit en controleer ook je eigen bestanden.
