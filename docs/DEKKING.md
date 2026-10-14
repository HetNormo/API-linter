# Welke eisen worden gecontroleerd?

Deze tabellen laten zien welke delen van de standaarden het pakket controleert. Een regel in de tabel betekent niet dat de hele eis automatisch is afgedekt. Lees ook de laatste kolom: daar staat wat je zelf nog moet controleren.

## Zo lees je de tabellen

| Begrip | Betekenis |
| --- | --- |
| Referentie | De code van een eis in de standaard, zoals ID01. Dezelfde code kan in verschillende standaarden iets anders betekenen. |
| Handmatig | Een mens of een aparte test moet dit controleren. |
| Gedeeltelijk | De linter controleert een deel. Een mens of een aparte test controleert de rest. |
| Statisch | De linter controleert het aangeleverde bestand. Hij controleert niet het gedrag van de werkende software of toekomstige berichten. |
| Regel | De precieze naam van een controle. Je kunt deze naam terugvinden in de uitvoer van Spectral. |

Een API-contract beschrijft de afspraken van een API. Een event is een bericht over iets dat is gebeurd. Een payload bevat de inhoudelijke gegevens. Meer woorden worden uitgelegd in de [hoofdhandleiding](../README.md).

## Regels voor API’s: API Design Rules

| Referentie | Dekking | Regels | Wat moet je zelf nog controleren? |
| --- | --- | --- | --- |
| STD01 | handmatig | Geen automatische controle | Laat de ASNO-strategie en aanvullingen op de API Design Rules (ADR) apart beoordelen. Neem geen taalregels over die met elkaar botsen. |
| STD02 | handmatig | Geen automatische controle | Laat beoordelen of het gekozen gegevensmodel past en of de API dat model goed volgt. |
| ID01 | handmatig | Geen automatische controle | Laat controleren of de tekst Brits Engels gebruikt en aan de taalafspraken van de organisatie voldoet. |
| ID02 | gedeeltelijk | `normo-api-version`<br>`normo-api-uri-major` | De linter leest het contract. Test ook of de betekenis en het gedrag van de API kloppen. |
| ID03 | gedeeltelijk | `normo-api-parameter-purpose`<br>`normo-api-query-underscore-advice` | De linter leest het contract. Test ook of de betekenis en het gedrag van de API kloppen. |
| ID04 | gedeeltelijk | `normo-api-parameter-purpose`<br>`normo-api-query-underscore-advice` | De linter leest het contract. Test ook of de betekenis en het gedrag van de API kloppen. |
| ID05 | gedeeltelijk | `normo-api-problem-media`<br>`normo-api-problem-fields`<br>`normo-api-problem-examples`<br>`normo-api-error-detail-review`<br>`tool-api-default-review` | De linter leest het contract. Test ook of de betekenis en het gedrag van de API kloppen. |
| ID06 | handmatig | Geen automatische controle | Laat een architect beoordelen welke aanpak past: OData, WFS of REST. |
| ID07 | gedeeltelijk | `normo-api-info`<br>`normo-api-release-date` | De linter leest het contract. Test ook of de betekenis en het gedrag van de API kloppen. |
| ID08 | gedeeltelijk | `tool-api-operation-kind`<br>`normo-api-get-no-body`<br>`http-api-no-content`<br>`normo-api-precondition-responses`<br>`normo-api-mutation-review` | De linter leest het contract. Test ook of de betekenis en het gedrag van de API kloppen. |
| ID09 | handmatig | Geen automatische controle | Bepaal het doel van een complexe zoekopdracht. De linter herkent POST /search alleen om de passende antwoordcodes te kiezen. |
| ID10 | gedeeltelijk | `normo-api-status-codes` | De linter leest het contract. Test ook of de betekenis en het gedrag van de API kloppen. |
| ID11 | gedeeltelijk | `normo-api-body-schema` | De linter leest het contract. Test ook of de betekenis en het gedrag van de API kloppen. |
| ID12 | gedeeltelijk | `normo-api-qos-review` | Meet de servicekwaliteit (QoS), zoals snelheid en beschikbaarheid. Controleer of die past bij de afspraken van de Business Service. |
| ID13 | gedeeltelijk | `normo-api-date-examples`<br>`normo-api-date-utc-advice` | De linter leest het contract. Test ook of de betekenis en het gedrag van de API kloppen. |
| ID14 | gedeeltelijk | `normo-api-string-min-length`<br>`normo-api-string-max-length`<br>`normo-api-string-bounds` | De linter leest het contract. Test ook of de betekenis en het gedrag van de API kloppen. |
| ID15 | gedeeltelijk | `profile-api-effective-security`<br>`normo-api-oauth-scheme`<br>`oas-api-security-references`<br>`profile-api-oauth-https`<br>`normo-api-oauth-flow-advice`<br>`profile-api-no-query-credentials` | De linter leest het contract. Test ook of de betekenis en het gedrag van de API kloppen. |
| ID16 | gedeeltelijk | `normo-api-property-names` | De linter leest het contract. Test ook of de betekenis en het gedrag van de API kloppen. |
| ID17 | handmatig | Geen automatische controle | Controleer of links naar verwante gegevens (HAL) nodig zijn en kloppen. De vaste HAL-veldnamen blijven toegestaan. |
| ID18 | gedeeltelijk | `normo-api-parameter-purpose` | De linter leest het contract. Test ook of de betekenis en het gedrag van de API kloppen. |
| ID19 | gedeeltelijk | `normo-api-parameter-purpose` | De linter leest het contract. Test ook of de betekenis en het gedrag van de API kloppen. |
| ID20 | gedeeltelijk | `normo-api-created-reference`<br>`normo-api-sender-header` | De Business Service bepaalt welke headers nodig zijn en hoe vaak ze mogen voorkomen. Er is geen verplichte set voor alle API’s. |
| ID21 | gedeeltelijk | `normo-api-enum-case`<br>`normo-api-no-dynamic-enum`<br>`normo-api-enum-review` | De linter leest het contract. Test ook of de betekenis en het gedrag van de API kloppen. |
| ID22 | handmatig | Geen automatische controle | Laat beoordelen welke gegevens nodig zijn, hoe gevoelig ze zijn en hoe je ze vastlegt en versleutelt. Dit pakket geeft geen juridisch oordeel. |
| ID23 | gedeeltelijk | `tool-oas-supported-version` | De linter leest het contract. Test ook of de betekenis en het gedrag van de API kloppen. |
| ID24 | gedeeltelijk | `normo-api-schema-composition` | De linter leest het contract. Test ook of de betekenis en het gedrag van de API kloppen. |
| ID25 | handmatig | Geen automatische controle | Test in de werkende software onder welke voorwaarden een gebruiker ieder gegevensveld mag zien of gebruiken. |
| ID26 | gedeeltelijk | `normo-api-cursor-contract`<br>`normo-api-cursor-default-advice`<br>`normo-api-pagination-review` | De linter leest het contract. Test ook of de betekenis en het gedrag van de API kloppen. |
| ID27 | gedeeltelijk | `normo-api-foreign-key-query` | De linter leest het contract. Test ook of de betekenis en het gedrag van de API kloppen. |

## Regels voor events: Event Data Specification

| Referentie | Dekking | Regels | Wat moet je zelf nog controleren? |
| --- | --- | --- | --- |
| ID01 | statisch | `normo-event-specversion` | Deze controle geldt voor dit JSON-event. Controleer ook hoe het systeem toekomstige events maakt. |
| ID02 | gedeeltelijk | `normo-event-id`<br>`normo-event-id-uuid` | Het verzendende systeem moet bijhouden welke identificaties al zijn gebruikt. Hetzelfde event opnieuw versturen met dezelfde identiteit is toegestaan. |
| ID03 | gedeeltelijk | `normo-event-source`<br>`normo-event-source-ean13` | Controleer zelf of de organisatie, het bronsysteem en de identificatie in het register kloppen. |
| ID04 | gedeeltelijk | `normo-event-type`<br>`normo-event-past-tense` | Laat beoordelen of de naam de gebeurtenis goed beschrijft en in de verleden tijd staat. |
| ID05 | statisch | `normo-event-content-type` | Deze controle geldt voor dit JSON-event. Controleer ook hoe het systeem toekomstige events maakt. |
| ID06 | statisch | `normo-event-time` | Deze controle geldt voor dit JSON-event. Controleer ook hoe het systeem toekomstige events maakt. |
| ID07 | statisch | `normo-event-data-version` | Deze controle geldt voor dit JSON-event. Controleer ook hoe het systeem toekomstige events maakt. |
| ID08 | gedeeltelijk | `normo-event-data-object` | Keuze E01 vraagt bij aanwezige data een object met minstens één veld. Toets de inhoud zelf aan het afgesproken gegevensschema. |
| ID09 | gedeeltelijk | `normo-event-size-limit`<br>`normo-event-size-advice` | Meet de werkelijk verzonden bytes, inclusief de extra gegevens die voor verzending nodig zijn. |
| ID10 | gedeeltelijk | `normo-event-context-names`<br>`normo-event-payload-names` | De eventinhoud en REST-gegevens gebruiken hetzelfde gegevensmodel. Vergelijk beide contracten ook zelf. |
| ID11 | statisch | `normo-event-subject` | Deze controle geldt voor dit JSON-event. Controleer ook hoe het systeem toekomstige events maakt. |
| ID12 | gedeeltelijk | `normo-event-dataref` | Test of het adres bereikbaar is, naar de juiste gegevens wijst en alleen toegang geeft aan wie dat mag. |

## Alle 69 eigen regels

Het pakket bevat 69 eigen regels. De algemene `spectral:oas`-regels komen daar nog bij.

Het profiel `events` is voor eventberichten. `oas` is voor REST API-contracten. `central` voegt regels voor centrale API-adressen toe.

Bij **Ernst** betekent `error` een fout, `warn` een waarschuwing en `info` een informatieve melding. Bij **Herkomst** staat waar de regel op is gebaseerd. ‘Interpretatie’ verwijst naar een keuze in [BESLUITEN.md](BESLUITEN.md). ‘Heuristiek’ betekent dat de regel een mogelijk probleem herkent aan patronen. ‘Reviewondersteuning’ betekent dat de melding helpt bij een menselijke beoordeling. Een ‘Implementatiekeuze’ of ‘Beveiligingsprofiel’ is een extra keuze van dit pakket.

Een `enum` is een lijst met toegestane waarden. Een schema beschrijft welke gegevens zijn toegestaan. Een string is een tekstwaarde. Een header geeft extra informatie bij een HTTP-verzoek of antwoord.

| Profiel | Regel | Ernst | Herkomst | Controle |
| --- | --- | --- | --- | --- |
| events | `tool-event-document` | error | Implementatiekeuze | Past het bestand bij dit eventprofiel? |
| events | `normo-event-specversion` | error | Normo | Klopt de opgegeven CloudEvents-versie? |
| events | `normo-event-id` | error | Normo | Heeft het event een identificatie die niet leeg is? |
| events | `normo-event-id-uuid` | warn | Normo aanbeveling | Advies om een UUID als identificatie te gebruiken. |
| events | `normo-event-source` | error | Normo | Heeft de bronidentificatie de juiste onderdelen? |
| events | `normo-event-source-ean13` | error | Interpretatie E03 | Bestaat een ean13-identificatie uit precies dertien cijfers? |
| events | `normo-event-type` | error | Normo | Heeft het eventtype de drie vereiste onderdelen? |
| events | `normo-event-past-tense` | warn | Heuristiek | Staat het type mogelijk niet in de verleden tijd? |
| events | `normo-event-content-type` | error | Normo | Is het inhoudstype aanwezig waar nodig en goed geschreven? |
| events | `normo-event-time` | error | Normo | Is de tijd in UTC opgegeven met zes cijfers achter de seconde? |
| events | `normo-event-data-version` | error | Normo | Is de versie van de payload aanwezig waar nodig en geldig? |
| events | `normo-event-data-object` | error | Interpretatie E01 | Is aanwezige data een object met minstens één veld? |
| events | `cloudevents-event-data-encoding` | error | CloudEvents | Passen het inhoudstype en de JSON-inhoud bij elkaar? |
| events | `normo-event-size-limit` | error | Interpretatie E02 | Blijft de compacte JSON plus ingestelde verzendruimte onder of op de maximumgrens? |
| events | `normo-event-size-advice` | warn | Normo aanbeveling | Blijft de compacte JSON plus ingestelde verzendruimte onder of op de adviesgrens? |
| events | `normo-event-context-names` | error | Normo | Voldoen de algemene veldnamen aan de naam- en lengteregels? |
| events | `normo-event-payload-names` | error | Normo | Kloppen alle payloadveldnamen, ook in onderliggende objecten en bij gerichte uitzonderingen? |
| events | `normo-event-subject` | error | Normo | Is subject geldig als het is opgegeven? |
| events | `normo-event-dataref` | error | Normo | Is de verwijzing naar gegevens geldig als die is opgegeven? |
| events | `cloudevents-event-dataschema` | error | CloudEvents | Heeft een opgegeven schema-adres de juiste URI-vorm? |
| events | `cloudevents-event-context-values` | error | CloudEvents | Hebben algemene eventvelden toegestane typen en Unicode-waarden? |
| oas | `tool-oas-supported-version` | error | Implementatiekeuze | Gebruikt het contract een ondersteunde OpenAPI-versie? |
| oas | `normo-api-info` | error | Normo | Is de vereiste algemene API-informatie ingevuld? |
| oas | `normo-api-version` | error | Normo | Volgt het versienummer de SemVer-afspraken? |
| oas | `normo-api-release-date` | error | Normo | Bestaat de opgegeven kalenderdatum? |
| oas | `tool-api-operation-kind` | error | Implementatiekeuze | Is de extra aanduiding voor het soort handeling geldig? |
| oas | `normo-api-status-codes` | error | Interpretatie R01 | Zijn alle minimaal vereiste antwoordcodes apart beschreven? |
| oas | `normo-api-get-no-body` | error | Normo | Heeft een GET-verzoek geen body? |
| oas | `http-api-no-content` | error | HTTP + Normo | Hebben antwoorden geen body waar HTTP dat verbiedt? |
| oas | `normo-api-created-reference` | error | Normo | Verwijst het antwoord naar de aangemaakte gegevens? |
| oas | `normo-api-precondition-responses` | error | Normo | Passen de beschreven antwoorden bij de voorwaarden voor het verzoek? |
| oas | `normo-api-mutation-review` | warn | Reviewondersteuning | Laat antwoorden op wijzigingen beoordelen. |
| oas | `normo-api-body-schema` | error | Normo | Heeft iedere beschreven body een schema? |
| oas | `normo-api-problem-media` | error | Interpretatie R02 | Gebruiken foutantwoorden het juiste inhoudstype? |
| oas | `normo-api-problem-fields` | error | Normo | Kloppen de verplichte Problem Details-velden, typen en status? |
| oas | `normo-api-problem-examples` | error | Normo | Passen de foutvoorbeelden bij de HTTP-antwoordcode? |
| oas | `normo-api-error-detail-review` | warn | Heuristiek | Bevatten foutmeldingen mogelijk technische details? |
| oas | `tool-api-default-review` | warn | Reviewondersteuning | Laat het default-antwoord apart beoordelen. |
| oas | `normo-api-string-min-length` | error | Interpretatie R03 | Is de minimumlengte van tekst vastgelegd? |
| oas | `normo-api-string-max-length` | warn | Normo aanbeveling | Is de maximumlengte van tekst vastgelegd? |
| oas | `normo-api-string-bounds` | error | Interpretatie R03 | Kloppen de minimum-, maximum- en vaste tekstlengtes met elkaar? |
| oas | `normo-api-date-examples` | error | Normo | Zijn datumvoorbeelden in het schema geldig? |
| oas | `normo-api-date-utc-advice` | warn | Normo aanbeveling | Volgen tijden het advies voor UTC met milliseconden? |
| oas | `normo-api-property-names` | warn | Normo | Kloppen veldnamen, rekening houdend met het afgesproken gegevensmodel? |
| oas | `normo-api-enum-case` | warn | Normo aanbeveling | Kloppen de namen in vaste waardelijsten, rekening houdend met internationale afspraken? |
| oas | `normo-api-no-dynamic-enum` | error | Normo | Wordt een veranderlijke waardelijst niet als vaste enum vastgelegd? |
| oas | `normo-api-enum-review` | info | Reviewondersteuning | Laat beoordelen of de waardelijst echt vast is. |
| oas | `normo-api-schema-composition` | warn | Normo aanbeveling | Zijn er combinaties van schema’s binnen andere combinaties? |
| oas | `profile-api-effective-security` | error | Beveiligingsprofiel | Zijn er toegangsregels zonder anonieme mogelijkheid? |
| oas | `normo-api-oauth-scheme` | warn | Normo aanbeveling | Gebruikt iedere toegangsroute OAuth2 of OpenID Connect? |
| oas | `oas-api-security-references` | error | OpenAPI | Kloppen verwijzingen naar toegangsregels en OAuth-scopes? |
| oas | `profile-api-oauth-https` | error | Beveiligingsprofiel | Gebruiken OAuth-adressen en adressen voor inloginstellingen HTTPS? |
| oas | `normo-api-oauth-flow-advice` | warn | Normo aanbeveling | Wordt een aanbevolen OAuth-proces gebruikt? |
| oas | `profile-api-no-query-credentials` | error | Beveiligingsprofiel | Staan toegangsbewijzen niet in queryparameters in het adres? |
| oas | `normo-api-parameter-purpose` | error | Normo | Past de parameternaam bij het opgegeven doel? |
| oas | `normo-api-query-underscore-advice` | info | Normo aanbeveling | Advies om de naamvariant met een underscore te gebruiken. |
| oas | `normo-api-cursor-contract` | error | Normo | Kloppen de afspraken voor herkende cursorpaginering? |
| oas | `normo-api-cursor-default-advice` | warn | Normo aanbeveling | Volgt het standaardaantal resultaten het advies? |
| oas | `normo-api-pagination-review` | warn | Reviewondersteuning | Laat oudere vormen van paginering beoordelen. |
| oas | `normo-api-foreign-key-query` | error | Normo | Is zoeken via een als foreignKey aangeduide sleutel goed beschreven? |
| oas | `normo-api-sender-header` | error | Interpretatie R04 | Heeft de beschreven afzenderidentificatie de juiste vorm? |
| oas | `normo-api-qos-review` | info | Reviewondersteuning | Zijn de afspraken over servicekwaliteit en de beoordeling vastgelegd? |
| oas | `tool-api-extension-config` | error | Implementatiekeuze | Zijn de extra x-normo-velden geldig ingesteld? |
| oas | `normo-api-uri-major` | error | Normo | Past de hoofdversie in het volledige adres bij de API-versie? |
| oas | `profile-api-server-https` | error | Beveiligingsprofiel | Voldoen de volledige serveradressen aan de HTTPS-regel? |
| central | `normo-uri-central-authority` | error | Normo | Heeft het centrale domein de juiste opbouw? |
| central | `normo-uri-hierarchy-review` | warn | Reviewondersteuning | Laat de NBility-padstructuur en de plek van de centrale versie beoordelen. |
| central | `normo-uri-lowercase` | error | Normo | Gebruiken de vaste delen van het pad kleine letters? |
| central | `tool-uri-variable-review` | warn | Reviewondersteuning | Laat servervariabelen beoordelen waarvan de mogelijkheden niet volledig vastliggen. |
