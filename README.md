# RPG Fantasy Generator v9

Bygget videre fra v5-layoutet med v8-funktionerne, men med ryddet provider-flow.

## V9 ændringer

- Beholder v5-kortets layout og portrætplacering.
- Level-slider 1–20 ligger i topbaren.
- Kampdata skalerer med level.
- Lokale reroll-terninger på navn, udseende, traits, NPC-felter og scenehook.
- Billedprompts er engelske og kan kopieres til MidJourney/Perchance.
- Perchance forsøges altid først uden API-nøgle via server-route.
- Pollinations er kun skjult fallback, ikke en primær knap.
- Pollinations 402/queue-full håndteres med pæn fejlbesked og retry, ikke rå JSON-toast.
- Promptpanelet er foldbart.
- PDF-download er fjernet. PNG-download er bevaret.

## Vigtigt om Perchance

Perchance har ikke en stabil OpenAI-lignende API med nøgle og billing-dashboard. Denne version bruger deres offentlige billed-endpoint defensivt og inkluderer de parametre, som public-generatoren normalt sender: `subChannel`, `userKey`, `requestId`, `bdf`, osv.

Hvis Perchance ændrer endpointet eller rate-limiter, falder appen automatisk tilbage til Pollinations. Hvis Pollinations melder kø fuld, vises en kort og læsbar besked.

## Kør lokalt

```bash
npm install
npm run dev
```

Åbn derefter http://localhost:3000


## v11

- V5/V9-style layout retained, but toolbar simplified.
- Cinematic + Three Quarter portrait generation is locked as the default; no art-style or crop dropdowns.
- High quality image generation is forced by default.
- Portrait frame uses a blurred background fill plus an undistorted foreground image, so the preview and PNG export keep correct proportions.
- Reroll controls use a cleaner circular refresh icon, placed to the right of relevant fields.
