# Wat moet je zelf nog controleren?

Spectral controleert bestanden. Voor sommige eisen moet je ook de werkende software testen of een inhoudelijk deskundige laten meekijken. Gebruik deze lijst voordat je het pakket en je eigen API’s of events goedkeurt.

## Het pakket beoordelen

1. Controleer of de gebruikte versies van de standaarden passen bij jouw project. Ze staan in [BRONNEN.md](BRONNEN.md).
2. Lees de keuzes in [BESLUITEN.md](BESLUITEN.md). Beoordeel of je die keuzes kunt overnemen.
3. Installeer de vastgelegde softwareversies met `npm ci --ignore-scripts`. Bewaar `package-lock.json` in versiebeheer.
4. Voer `npm run verify` uit. Alle functietests, de controle van de gegenereerde rulesets en alle negen integratietests moeten slagen.
5. Controleer ook je eigen contracten. Kies voorbeelden die samen de belangrijke situaties in je project afdekken.
6. Leg vast welke pakketversie je goedkeurt en welke uitzonderingen zijn toegestaan.

Test bijvoorbeeld verwijzingen naar andere bestanden en schema’s die naar zichzelf verwijzen. Controleer ook toegangsregels per API-handeling en de adresregels voor een centrale of lokale API. Kijk of de linter echte fouten mist of geldige onderdelen ten onrechte afkeurt.

## De inhoud van een REST API-contract beoordelen

Beoordeel of beschrijvingen duidelijk zijn en de juiste taal gebruiken. Controleer of de beschreven gegevens en handelingen passen bij het doel van de API. Laat ook complexe zoekopdrachten en de gekozen gegevensmodellen beoordelen.

Gebruikt de API HAL? Dat is een manier om links naar verwante gegevens in antwoorden op te nemen. Controleer dan of die links en relaties kloppen.

Een `enum` is een lijst met toegestane waarden. Controleer of die lijst echt vast is. Een lijst die tijdens het gebruik kan veranderen, vraagt een andere aanpak.

Laat deskundigen controleren welke gebruikers welke velden mogen zien. Bekijk ook of de API alleen noodzakelijke gegevens verwerkt en of persoonsgegevens in adressen voorkomen. Dit pakket geeft geen juridisch oordeel.

Bekijk daarnaast deze onderdelen:

- Een `default`-antwoord: is duidelijk voor welke situaties het geldt?
- Ingewikkelde schema’s: zijn de verschillende mogelijkheden en voorwaarden goed beschreven?
- Afwijkende API-paden: klopt de betekenis van de handeling?
- Extra `x-normo-*`-velden: klopt de uitleg die daarin staat?
- Antwoordcodes: hoe ga je om met verschillen tussen de Normo-tabel, de HTTP-bijlage en de HTTP-standaard?

Een geslaagde lintcontrole neemt deze keuzes niet over.

## De werkende REST API testen

Controleer in de echte software wie toegang krijgt en wat die persoon of dat systeem mag doen. *Authenticatie* controleert wie je bent. *Autorisatie* bepaalt wat je mag. Test de rechten per handeling, per gegevensobject en waar nodig per veld.

| Onderdeel | Wat test je? |
| --- | --- |
| Beveiligde verbinding | Werken TLS en de certificaten goed? TLS beveiligt de verbinding. |
| Toegangsbewijzen | Controleert de API tokens en scopes goed? Een token is een digitaal toegangsbewijs; scopes begrenzen de toegestane toegang. Test ook PKCE als die extra bescherming in het inlogproces nodig is. |
| Logging en foutmeldingen | Worden gebeurtenissen goed vastgelegd? Lekken antwoorden geen technische details? |
| Aantal verzoeken | Werkt rate limiting: het beperken van het aantal verzoeken? Alleen antwoordcode `429` in het contract opnemen is daarvoor geen bewijs. |
| HTTP-gedrag | Kloppen de methoden, voorwaarden en antwoordcodes? Heeft herhalen hetzelfde bedoelde effect waar dat nodig is? Dat laatste heet idempotentie. |
| Contract en software | Doet de werkende API wat het gepubliceerde contract beschrijft? |
| Servicekwaliteit | Haalt de API de afgesproken snelheid en beschikbaarheid? |

Bij cursorpaginering haal je resultaten in delen op. Test hoe lang de cursor geldig blijft en of hij bij de juiste zoekopdracht hoort. Controleer ook of de resultaten blijven kloppen als de gegevens tussendoor veranderen.

Een beschreven beveiligingsinstelling bewijst nog niet dat de software die toepast. Test dit dus altijd in de werkende API.

## Events beoordelen en testen

Controleer dat `source` en `id` samen één gebeurtenis aanwijzen. Wordt hetzelfde event opnieuw verstuurd? Dan moet het dezelfde identiteit houden.

Beoordeel de organisatie en het bronsysteem in `source`. Bekijk ook of `type` de gebeurtenis goed beschrijft en in de verleden tijd staat. Controleer of de versie van de inhoud klopt.

Vergelijk de payload met het afgesproken gegevensschema voor jouw onderwerp. Vergelijk de inhoud ook met de bijbehorende REST-gegevens. De linter controleert de payload niet tegen dit domeinschema.

Test vervolgens de verzending en verwerking:

- Meet hoeveel bytes het bericht werkelijk gebruikt, inclusief de gekozen manier van verzenden en de extra verzendgegevens.
- Controleer de volgorde als die belangrijk is.
- Test opnieuw afleveren, dubbele berichten herkennen en fouten afhandelen.
- Controleer welke systemen events mogen versturen en ontvangen.
- Controleer bij `dataref` of het adres bereikbaar is, naar de juiste gegevens wijst en alleen toegang geeft aan wie dat mag.

Wil je andere payloadtypen of binaire gegevens ondersteunen? Behandel dat als een aparte wijziging die eerst beoordeeld moet worden.

## Wanneer moet je opnieuw controleren?

Herhaal de beoordeling als Normo, Spectral, Node.js of een ruleset verandert. Doe dit ook bij wijzigingen in de softwarepakketten die deze programma’s gebruiken.

Gebruik [DEKKING.md](DEKKING.md) en de [regelcatalogus](../rulesets/rule-catalog.json) om te bepalen welke onderdelen geraakt worden. Bewaar bij iedere gecontroleerde release de exacte versies en de oorspronkelijke uitvoer van de linter.
