# Welke bronnen gebruikt dit pakket?

Dit pakket is gebaseerd op de onderstaande standaarden en technische uitleg. Volgens de oorspronkelijke documentatie zijn deze bronnen geraadpleegd op **14 oktober 2026**.

Het pakket is onafhankelijk gemaakt. Het is geen officiële uitgave van Normo. De volledige standaarden zitten niet in deze map. Lees bij twijfel de oorspronkelijke bron: daarin staan de regels die gelden.

## Bronnen en versies

| Bron | Versie of profiel | Locatie |
| --- | --- | --- |
| Het Normo API Design Rules | 6.0, publicatie 6 mei 2026 | https://hetnormo.github.io/API-standards/api-design-rules/ |
| Het Normo Event Data Specification | 2.0, publicatie 6 mei 2026 | https://hetnormo.github.io/API-standards/event-data-specs/ |
| Het Normo URI Conventions | 2.0, publicatie 15 februari 2025 | https://hetnormo.github.io/API-standards/uri-conventions/ |
| Normo HTTP operatiebijlage | Bijlage bij API Design Rules | https://hetnormo.github.io/API-standards/attachments/Use-of-HTTP-operations-for-RESTful-APIs.html |
| CloudEvents | Kern 1.0.2 | https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md |
| CloudEvents JSON mapping | 1.0.2 | https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/formats/json-format.md |
| OpenAPI Specification | 3.0.3 en 3.1.0 | https://spec.openapis.org/oas/v3.1.0.html |
| Problem Details | RFC 9457 | https://www.rfc-editor.org/rfc/rfc9457.html |
| HTTP Semantics | RFC 9110 | https://www.rfc-editor.org/rfc/rfc9110.html |
| MIME | RFC 2046 | https://www.rfc-editor.org/rfc/rfc2046.html |
| Semantic Versioning | 2.0.0 | https://semver.org/spec/v2.0.0.html |
| Spectral release | 6.17.0 | https://github.com/stoplightio/spectral/releases/tag/v6.17.0 |
| Spectral eigen functies | Documentatie bij 6.17.0 | https://github.com/stoplightio/spectral/blob/v6.17.0/docs/guides/5-custom-functions.md |

## Waar komt een regel vandaan?

In de [regelcatalogus](../rulesets/rule-catalog.json) staat per eigen regel welke bron is gebruikt. De catalogus maakt onderscheid tussen:

- **Een eis:** iets wat een standaard verplicht.
- **Een aanbeveling:** een advies uit een standaard.
- **Een interpretatie:** een keuze om een tekst uit de standaard in een controle om te zetten.
- **Een heuristiek:** een controle die een mogelijk probleem herkent aan patronen. Iemand moet beoordelen of de melding terecht is.
- **Een extra profielkeuze:** een aanvullende afspraak van dit pakket, bijvoorbeeld voor beveiliging.

De standaarden bepalen niet voor iedere eis welk Spectral-niveau erbij hoort. De keuze voor `error`, `warn` of `info` is daarom onderdeel van dit pakket. De uitleg bij die keuzes staat in [BESLUITEN.md](BESLUITEN.md).

## Eerder ontwerp en andere regels

Het aangeleverde *Ontwerpdocument Spectral Ruleset*, versie 1.0 van 25 februari 2026, was het startpunt. Bij verschillen gebruikt dit pakket de gepubliceerde bronnen uit de tabel, samen met de vastgelegde keuzes.

Het REST-profiel neemt de algemene `spectral:oas`-regels over. Het neemt niet automatisch alle Nederlandse API Design Rules (ADR) over. Regels over taal, adressen en sectorafspraken kunnen namelijk verschillen. Laat die verschillen eerst beoordelen.
