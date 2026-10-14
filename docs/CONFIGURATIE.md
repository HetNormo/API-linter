# Regels en instellingen aanpassen

De meeste controles werken zonder extra instellingen. Soms wil je een regel strenger maken of uitleggen waarom je een bepaalde naam gebruikt. Dat doe je met een eigen instellingenbestand of een extra veld in het API-contract.

Een extra veld noemen we hier een *annotatie*. De velden met `x-normo-*` horen bij dit pakket. Ze zijn geen officieel onderdeel van Normo. Ze helpen de linter om je bedoeling te herkennen. Iemand moet nog steeds beoordelen of die bedoeling klopt.

## Extra velden in een API-contract

| Waar zet je het veld? | Veldnaam | Waarde en betekenis |
| --- | --- | --- |
| Bij een API-handeling (`Operation Object`) | `x-normo-operation-kind` | Voor GET: `resource` of `search`. Voor POST: `create`, `search` of `action`. Voor de andere ondersteunde methoden: de methodenaam. Hiermee kiest de linter de passende groep antwoordcodes. |
| Bij een API-handeling (`Operation Object`) | `x-normo-pagination` | `cursor` of `legacy`. Met `legacy` geef je aan dat je een oudere manier van paginering gebruikt. Dat vraagt beoordeling en bewijst nog niet dat een uitzondering is toegestaan. |
| Bij een parameter (`Parameter Object`) | `x-normo-purpose` | `sort`, `search`, `expand`, `fields`, `cursor`, `limit`, `filter` of `foreignKey`. Dit geeft het doel van de parameter aan. |
| Bij een schema met `properties` | `x-normo-reference-model` | Een volledige URI naar het model waarop je de veldnamen baseert. Hiermee licht je afwijkende namen in dat object toe. |
| Bij een schema met `enum` | `x-normo-enum-standard` | Een volledige URI naar een internationale standaard voor de toegestane waarden. Hiermee licht je een afwijkende schrijfwijze toe. |
| Bij een schema met `enum` | `x-normo-enum-kind` | `static` of `dynamic`. Gebruik je `dynamic` samen met `enum`, dan geeft de linter een error. |
| Bij een antwoord (`Response Object`) | `x-normo-status-record` | `true` betekent dat een beoordelaar dit antwoord op een wijziging als statusrecord heeft beoordeeld: een overzicht van de status van die wijziging. |
| Bij de API-informatie (`Info Object`) | `x-normo-qos` | Een volledige URI naar afspraken over de servicekwaliteit, zoals snelheid en beschikbaarheid. De verwijzing bewijst niet dat de API die prestaties haalt. |

Een volledige URI, ook wel absolute URI, bevat zelf alle nodige adresinformatie. `https://example.org/model` is een voorbeeld.

Een `enum` is een lijst met toegestane waarden. Een parameter is een waarde die je met een verzoek meestuurt, bijvoorbeeld een zoekterm. De linter kan niet altijd uit de naam afleiden wat zo’n waarde betekent. Daarom blijven sommige controles gedeeltelijk, bijvoorbeeld bij verwijzingen naar gegevens uit een ander systeem (`foreignKey`).

## Een strenger REST-profiel maken

Maak in de hoofdmap van het project een bestand met de naam `.spectral-local.yaml`:

```yaml
extends:
  - ./rulesets/normo-oas.yaml
rules:
  normo-api-string-max-length: error
  normo-api-oauth-scheme: error
```

`extends` betekent dat je de bestaande REST-regels overneemt. Onder `rules` pas je twee regels aan. Die geven voortaan een error in plaats van een waarschuwing.

Voer je eigen profiel zo uit. Vervang `openapi.yaml` door je eigen bestand:

```bash
npx --no-install spectral lint openapi.yaml --ruleset .spectral-local.yaml --fail-severity error
```

## Eén afwijkende veldnaam toestaan

Soms schrijft een afgesproken gegevensmodel een veldnaam voor die afwijkt van de normale naamregels. Je kunt daarvoor een gerichte uitzondering instellen.

Maak een apart YAML-bestand in de hoofdmap. Dit bestand neemt de eventregels over en past alleen de regel voor veldnamen aan:

```yaml
extends:
  - ./rulesets/normo-events.yaml
functionsDir: ./rulesets/functions
functions:
  - normoEvent
rules:
  normo-event-payload-names:
    description: Naamconventie met een beoordeelde modeluitzondering.
    severity: error
    given: "$"
    resolved: false
    then:
      function: normoEvent
      functionOptions:
        check: payloadNames
        nameExemptions:
          - pointer: /data/IdentifiedObject
            source: https://example.org/models/approved-model
```

`pointer` wijst de plek aan waarvoor de uitzondering geldt. Hier is dat alleen `/data/IdentifiedObject`. Zo’n pad heet een JSON Pointer.

`source` verwijst naar het gegevensmodel dat de afwijkende naam voorschrijft. Het adres hierboven is een voorbeeld. Vervang het door de echte, beoordeelde bron. Dit voorbeeld bewijst niet dat een model de naam `IdentifiedObject` voorschrijft.

Laat `resolved: false` staan. In een event kan `$ref` gewone berichtinhoud zijn. Spectral mag dat veld hier niet behandelen als een OpenAPI-verwijzing die het moet volgen.

## De groottelimieten instellen

De eventfuncties `sizeLimit` en `sizeAdvice` kennen twee instellingen:

| Instelling | Toegestane waarde |
| --- | --- |
| `bytesPerKB` | `1000` of `1024`: het aantal bytes dat je voor één kB rekent. |
| `transportOverheadBytes` | Een geheel getal van nul of hoger: de extra bytes die je voor verzending wilt meetellen. |

Gebruik voor beide regels dezelfde waarden. Zet eigen aanpassingen in een apart bestand dat de eventregels overneemt. De generator maakt de gewone YAML-bestanden namelijk opnieuw met de standaardwaarden.

Het losse script `check:size` heeft dezelfde keuzes via `--kilobyte` en `--overhead`:

```bash
npm run check:size -- examples/event-valid.json --kilobyte 1000 --overhead 1024
```

## Een uitzondering vastleggen

Gebruik [AFWIJKING-TEMPLATE.json](AFWIJKING-TEMPLATE.json) om de reden, eigenaar, beoordelaar en einddatum van een uitzondering vast te leggen. Vul ook de regelcode, de plek in het document en de gebruikte versies in.

Het ingevulde bestand schakelt geen regel uit. Daarvoor is daarnaast een gerichte aanpassing in je eigen instellingen nodig. Laat die aanpassing beoordelen. Controleer bij een wijziging van de standaard of de uitzondering nog geldt.

Een melding verbergen lost de oorzaak in het contract niet op. Leg daarom vast waarom de afwijking nodig en toegestaan is. Gebruik die afspraak ook bij de automatische controles op een testserver. Zulke controles worden vaak CI genoemd.
