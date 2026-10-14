# Keuzes en grenzen van dit pakket

Sommige regels vragen uitleg of laten ruimte voor een keuze. Hieronder staat hoe dit pakket daarmee omgaat. Laat deze keuzes beoordelen voordat je ze overneemt. Ze veranderen de Normo-standaard niet.

De letters en nummers, zoals E01 en R03, zijn vaste verwijzingen. Je vindt ze ook terug in de [regelcatalogus](../rulesets/rule-catalog.json). De gebruikte standaarden staan in [BRONNEN.md](BRONNEN.md).

## E01. Gegevens in een event

Eventregel ID08 noemt een object met minstens één veld. De uitleg bij die regel beschrijft informatie in bredere woorden. Dit pakket volgt de concrete eis uit de objecttabel.

Als `data` aanwezig is, moet het daarom een JSON-object met minstens één veld zijn. Een lijst, tekstwaarde, leeg object of `null` geeft een melding. Laat de beheerder deze keuze goedkeuren.

Dit is een keuze voor dit profiel. CloudEvents kan ook andere payloadtypen gebruiken. `data_base64` en binaire verzending vallen buiten dit profiel.

## E02. De grootte van een bericht

Standaard telt 1 kB als 1000 bytes. De maximumgrens is **256.000 bytes**. De adviesgrens is **64.000 bytes**. Je kunt ook 1024 bytes per kB instellen als dat is afgesproken.

De Spectral-functie meet `JSON.stringify(event)`: de JSON zonder overbodige spaties en regeleinden. Daar telt de functie de ingestelde extra verzendbytes bij op. Het losse script `check:size` meet de oorspronkelijke bestandsbytes plus die extra bytes.

De compacte JSON kan kleiner zijn dan het werkelijk verstuurde bericht. Meet daarom ook de echte verzending vanuit het systeem dat de events maakt. De linter geeft geen garantie over de volledige grootte op het netwerk.

## E03. De bron van een event

De bron wordt beschreven met een samengestelde URN. Dat is een vaste identificatie die hier het type identificatie, de organisatie en het logische bronsysteem bevat.

Staat het type op `ean13`? Dan controleert het pakket of de identificatie uit precies dertien cijfers bestaat. Het zoekt het nummer niet op in een register en berekent geen controlecijfer. Zo’n controlecijfer helpt normaal om typefouten te ontdekken.

In de Normo-publicatie staat ook een voorbeeld met elf cijfers. Dat voorbeeld is hier niet overgenomen als geldig testgeval. KVK en OIN blijven toegestaan. Dit pakket legt daarvoor geen zelfbedacht verplicht registerformaat op.

## E04. Algemene velden van een CloudEvent

De contextvelden beschrijven het event zelf, zoals de bron en het type. Hun namen volgen de lengtebeperking van Normo.

Algemene extra contextvelden gebruiken de eenvoudige waardetypen uit het gekozen JSON-profiel. Dat zijn losse waarden, zoals tekst of een getal, in plaats van objecten of lijsten. Voor een uitbreiding met een eigen geregistreerde manier van opslaan is een aanvullend profiel nodig.

Een optioneel contextveld met `null` telt volgens de JSON-afspraken als niet ingevuld. Verplichte Normo-velden moeten wel aanwezig zijn. `dataref` wordt niet automatisch verplicht als `data` ontbreekt.

De controle op verleden tijd in `type` herkent patronen, maar begrijpt niet alle taal. Daarom geeft deze regel een waarschuwing.

## R01. De tabel met minimale antwoordcodes

Het pakket gebruikt de gepubliceerde ID10-tabel voor de antwoordcodes die je minimaal moet beschrijven. Er zijn punten die uitleg vragen. De tabel noemt bijvoorbeeld `422` bij zoeken met GET, terwijl de tekst over `422` uitgaat van een payload. Ook `204` bij HEAD volgt een keuze van de sector.

Voor de minimumset volgt dit pakket de tabel. Andere geldige antwoordcodes mogen erbij staan. Voor PUT en PATCH geeft de tabel geen eenduidige verplichte succescode. Het pakket voegt daarvoor zelf geen eis toe. De algemene OpenAPI-regels en een beoordeling door een mens vullen deze controle aan.

Een `default`-antwoord of een bereik zoals `4XX` vervangt hier geen afzonderlijk verplichte code. De linter kiest het soort handeling op basis van de methode en het pad. Een geldig extra veld kan die keuze verduidelijken. Is de bedoeling niet uit het pad af te leiden? Laat iemand de handeling dan inhoudelijk indelen.

## R02. Foutmeldingen en antwoorden zonder inhoud

Normo ID05 verplicht de velden `type`, `title` en `status` voor Problem Details. Dat is een vaste opbouw voor foutmeldingen. Deze Normo-eis is strenger dan RFC 9457. Het JSON REST-profiel gebruikt hiervoor `application/problem+json`.

Een HEAD-antwoord en andere HTTP-antwoorden waarvoor inhoud verboden is, blijven zonder body. De body is het inhoudelijke deel van het antwoord. Dit geldt ook bij fouten.

De linter controleert het schema en de voorbeelden in het contract. Hij controleert niet de fouttekst die de werkende API werkelijk terugstuurt. Laat een `default`-antwoord apart beoordelen: het is daarbij niet altijd duidelijk of het alleen fouten beschrijft.

## R03. De lengte van tekst

Voor een string, een tekstwaarde, moet je een minimumlengte groter dan nul opgeven. Een ontbrekende maximumlengte geeft een waarschuwing. ID14 beschrijft lengtes namelijk deels als eis en deels als advies voor antwoorden.

Een organisatie kan de regel voor de maximumlengte strenger maken door die op `error` te zetten. Voor een vaste lengte gebruikt dit pakket gelijke waarden voor `minLength` en `maxLength`. Het woord `length` uit een voorbeeld is geen standaard JSON Schema-regel.

`null` blijft toegestaan waar het contract dat toestaat. Een lege string (`""`) en `null` zijn verschillende waarden.

## R04. Extra velden in HTTP-headers

Headers bevatten extra informatie bij een verzoek of antwoord. Er is geen vaste set X-headers die voor iedere API verplicht is. De afspraken van de Business Service bepalen welke headers nodig zijn en hoe vaak ze mogen voorkomen.

Staat `X-Sender-ID` in het contract? Dan controleert het pakket de tekstlengte voor EAN13. Bij het aanmaken van gegevens controleert het op `Location` of `X-Object-ID`, zodat het antwoord naar de nieuwe gegevens kan verwijzen.

Het pakket controleert niet of de verzender de juiste organisatie, persoon of rol invult.

## R05. Keuzes voor beveiliging

Dit pakket maakt drie extra beveiligingskeuzes: geen anonieme toegangsroute, geen toegangsbewijzen in queryparameters en HTTPS voor OAuth-adressen. Queryparameters staan in het adres na een vraagteken. De regelcatalogus maakt duidelijk welke regels eigen keuzes zijn en welke letterlijk uit Normo komen.

De linter bekijkt de algemene toegangsregels samen met die van iedere handeling. Een instelling per handeling kan de algemene instelling vervangen. De controle houdt rekening met `security: []` en het anonieme alternatief `{}`.

De linter test geen tokens, PKCE-inlogproces of rechten op echte gegevens. Een bewust publieke API vraagt daarom een apart beoordeeld profiel.

Een relatief serveradres geeft op zichzelf geen protocol aan. Het algemene profiel wijst expliciete HTTP-adressen af. Het centrale profiel vraagt volledige HTTPS-adressen.

Heeft een serveradres variabelen? Dan werkt de controle de mogelijke waarden uit, tot maximaal 256 combinaties. Zijn die mogelijkheden niet begrensd, dan vraagt het centrale profiel om een beoordeling.

## R06. Resultaten in delen opvragen met een cursor

De linter herkent cursorpaginering aan `_cursor` of aan een extra veld dat dit expliciet aangeeft. Een cursor is een waarde waarmee de gebruiker het volgende deel van de resultaten opvraagt.

Een oudere vorm van paginering kun je als `legacy` aangeven. Dat levert een melding voor beoordeling op. Het bewijst niet dat een historische uitzondering geldt.

De lijst met resultaten hoeft niet altijd dezelfde naam te hebben. `nextCursor` is optioneel en moet, als het aanwezig is, het type string hebben.

De linter bewijst niet dat een cursor onvoorspelbaar is, op tijd verloopt of alleen bij de juiste zoekopdracht werkt. Dat moet je in de software testen.

## R07. Schema’s en OpenAPI-versies

De eigen regels ondersteunen OpenAPI 3.0 en 3.1. De controle volgt de onderdelen die echt schema’s zijn. Zo wordt voorbeeldinhoud niet per ongeluk als schema gecontroleerd.

Spectral zoekt verwijzingen naar andere onderdelen op. De controle van `allOf`, waarmee je schema’s combineert, ondersteunt eenvoudige combinaties zonder voorwaarden. Hij kan niet alle mogelijke JSON Schema-logica volledig beoordelen.

De regel voor samengestelde schema’s geeft daarom een waarschuwing. Test ingewikkelde keuzemogelijkheden en schema’s met voorwaarden apart.

## R08. Uitzonderingen vanwege de betekenis van gegevens

Een afgesproken gegevensmodel kan andere veldnamen voorschrijven dan de lokale naamregels. Zo’n model gaat bij namen voor. Met een extra bronveld leg je die keuze vast. De linter controleert niet of de naam werkelijk in dat model staat.

Die beperking geldt ook voor vaste waardelijsten, soorten handelingen en het doel van parameters. Laat daarom de betekenis beoordelen. Brits Engels, duidelijke beschrijvingen, privacy en het juiste gebruik van HAL-links blijven ook onderwerpen voor een menselijke beoordeling.

## U01. Adressen van centrale API’s

Alleen het aanvullende centrale profiel controleert het centrale energiedomein en de NBility-padstructuur. NBility wordt hier gebruikt voor de afgesproken indeling van centrale API-paden.

Het volledige pad bestaat uit het serveradres plus het pad van de handeling. De controle op de opbouw van dat pad geeft een waarschuwing. Iemand moet beoordelen of de NBility-indeling inhoudelijk klopt en of een fijnere of grovere indeling is toegestaan.

Lokale diensten krijgen niet automatisch de eisen voor centrale domeinen.

## T01. Installatie en teststatus

Dit pakket gebruikt Spectral 6.17.0. Bij de eerste oplevering slaagden de functietests onder Node.js 22.16.0. De installatie van Spectral mislukte toen door een DNS-probleem: het npm-adres kon niet worden gevonden. De integratietests waren daardoor nog niet uitgevoerd.

De installatie is inmiddels wel gelukt. De exacte versies van alle benodigde pakketten staan in `package-lock.json`. Onder Node.js 24.19.0 slagen alle 234 functietests, de controle van de drie gegenereerde rulesets en alle negen integratietests.

Het integratiescript gebruikt nu `--quiet`, zodat Spectral alleen de gevraagde JSON-uitvoer schrijft. Zonder die optie kwam er bij een geslaagde controle nog een tekstmelding achter de JSON. Daardoor kon het script het resultaat niet lezen.

Bekijk het [actuele testrapport](../reports/TESTRAPPORT.md). De dependency-audit, de controle op bekende beveiligingsproblemen in gebruikte pakketten, meldde vier problemen met niveau `high`. Die staan nog open. Een geslaagde functietest vervangt de integratietests en de tests met je eigen contracten niet.
