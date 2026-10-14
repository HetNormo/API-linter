# Wat is er veranderd?

## Aanpassingen na de eerste oplevering, 14 oktober 2026

- Spectral 6.17.0 is geïnstalleerd. De exacte versies van de benodigde pakketten staan nu in `package-lock.json`.
- Het integratiescript gebruikt nu `--quiet`. Daardoor blijft de JSON-uitvoer leesbaar voor het script, ook als er geen meldingen zijn.
- Alle 234 functietests en alle 9 integratietests slagen onder Node.js 24.19.0. Ook de drie gegenereerde rulesets zijn gecontroleerd.
- `npm audit` meldt vier beveiligingsproblemen met niveau `high` in de afhankelijkheidsketen rond `braces`. De audit meldde geen beschikbare oplossing.
- De documentatie is herschreven in duidelijk Nederlands op vmbo-4-niveau. Er is uitleg toegevoegd over direct gebruik van Spectral, alle meldingen en de beperkte voortgangsuitvoer.

Zie het [testrapport](reports/TESTRAPPORT.md) voor de resultaten en de controles die nog nodig zijn.

## Eerste oplevering: 1.0.0-rc.1, 14 oktober 2026

Dit is de eerste versie van het pakket. Het bevat 44 REST-regels, 21 eventregels en 4 extra regels voor centrale API-adressen. Je kiest zelf of je het centrale profiel gebruikt.

Het pakket bevat ook JavaScript-functies, geldige en ongeldige voorbeelden, 234 functietests en negen integratietests. In de documentatie staat welke eisen worden gecontroleerd en welke keuzes daarbij zijn gemaakt.

Bij de eerste oplevering lukte de installatie vanaf npm niet door een netwerkprobleem. De volledige Spectral-test was toen nog niet uitgevoerd (`not-executed`). Er was toen ook nog geen `package-lock.json`. Die stappen zijn later alsnog uitgevoerd, zoals hierboven beschreven.

Het pakket is geen officiële goedkeuring van Normo. Voor gebruik in een echte omgeving blijven eigen tests en een inhoudelijke beoordeling nodig.
