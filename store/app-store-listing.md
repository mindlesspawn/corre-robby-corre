# App Store listing (draft)

Everything to paste into App Store Connect when the app is created. Nothing here is final until it is submitted, so change anything.

Robby's individual Apple Developer membership is confirmed. Mexico is required. Native optional tips are implemented, but the products must be registered and sandbox-tested before this listing is submitted. See [launch-checklist.md](launch-checklist.md) and [tip-products.json](tip-products.json).

## The basics

| Field | Value |
| --- | --- |
| App name (30 letters at most) | corre, robby, corre (the same in English and in Spanish) |
| Bundle ID | `com.mindlesspawn.correrobbycorre` **DECIDE**: this can be changed until the first upload, never after. It is set in `capacitor.config.json` and in Xcode. |
| Seller name | The legal name on Robby's existing individual Apple Developer account. |
| Primary language | English (U.S.) |
| Other language | Spanish (Mexico) |
| Primary category | Education |
| Secondary category | Games, then Family |
| Made for Kids | Yes: ages 5 and under |
| Price | Free |
| Availability | Mexico required; also select the United States or other desired storefronts. |
| In-app purchases | Optional consumable tips behind the parent gate. Register and review all three products with the first version. |
| Devices | iPhone (upright only) and iPad (any way up) |
| Privacy policy | <https://mindlesspawn.github.io/corre-robby-corre/privacy.html> |
| Support page | <https://github.com/mindlesspawn/corre-robby-corre/issues> |
| Copyright | 2026, plus the seller name |

## Spanish (Mexico)

**Subtitle (30 letters at most)**

Números, colores y figuras

**Promotional text (170 letters at most)**

Un juego de aprender para los más pequeños: gratis, sin anuncios y en español de México. Elige un personaje, corre y entra por la puerta correcta.

**Description**

corre, robby, corre es un juego de aprender para niñas y niños de 3 a 6 años. Tres puertas vienen por el camino y hay que entrar por la correcta.

Es gratis, no tiene anuncios y no recoge ningún dato.

Los adultos pueden dejar una propina opcional mediante Apple, detrás de una pregunta para adultos. Las propinas son pagos únicos: no desbloquean funciones ni dan premios a los niños.

SIETE JUEGOS
• Números: cantidades, más y menos, contar, qué número sigue y sumas.
• Colores: diez colores, primero viéndolos y luego solo por su nombre.
• Princesa: coronas, castillos, unicornios y más.
• Animales: encuentra animales por su imagen y por su nombre.
• Frutas: reconoce frutas y escucha sus nombres.
• Figuras: círculo, cuadrado, triángulo y otras seis, en distintos tamaños y posiciones.
• Patrones: rojo, azul, rojo, azul... ¿qué sigue?

HECHO PARA SU EDAD
• Se elige la edad (3, 4, 5 o 6 en adelante) y cada juego tiene diez niveles para esa edad.
• Lo que se pide en cada edad sigue guías de educación inicial.
• La pregunta se muestra, se escribe y se dice en voz alta, y el juego espera.
• Al tocar una pregunta sin responder, las puertas esperan mientras se repite y luego dan más tiempo para contestar.
• Nunca castiga: una puerta equivocada enseña cuál era la correcta y dice la respuesta.

PARA SEGUIR JUGANDO SOLOS
• Una práctica sin tiempo enseña a tocar una puerta o deslizar el dedo.
• Al pasar un nivel se gana una estampa.
• Un solo botón grande lleva al siguiente nivel. No hace falta saber leer.

PARA LA FAMILIA
• En español de México y en inglés, con voz en los dos idiomas.
• Cuatro personajes: manzana, princesa, dinosaurio y ninja.
• Tres velocidades y controles de volumen general, música, voz y efectos.
• El avance se guarda por edad, para que hermanos de distintas edades compartan el mismo aparato.

La voz del juego está generada por inteligencia artificial; no es una persona.

**Keywords (100 letters at most, separated by commas)**

preescolar,niños,números,colores,figuras,contar,sumar,patrones,aprender,kínder,educativo,princesa

**What's new (first version)**

Primera versión.

## English (U.S.)

**Subtitle**

Numbers, colors and shapes

**Promotional text**

A learning game for the littlest ones: free, no ads, in Spanish and English. Pick a character, run, and go through the right door.

**Description**

corre, robby, corre is a learning game for children aged 3 to 6. Three doors come down the road, and the runner goes through the right one.

It is free, has no ads, and collects no data.

Adults can optionally leave a one-time tip through Apple, behind a parental gate. Tips do not unlock features or give children rewards.

SEVEN GAMES
• Numbers: amounts, more and fewer, counting, what number comes next, and sums.
• Colors: ten colors, first by sight and then from the name alone.
• Princess: crowns, castles, unicorns and more.
• Animals: find animals by their pictures and names.
• Fruit: recognize fruit and hear its names.
• Shapes: circle, square, triangle and six more, in different sizes and positions.
• Patterns: red, blue, red, blue... what comes next?

MADE FOR THEIR AGE
• Pick an age (3, 4, 5, or 6 and up) and every game has ten levels for that age.
• What each age is asked follows early-childhood teaching guidance.
• The question is shown, written and said aloud, and the game waits.
• Tap an unanswered question to hold the doors while it repeats, then get more time to answer.
• It never punishes: a wrong door shows which one was right and says the answer.

PLAYING ON ALONE
• Untimed practice shows how to tap a door or swipe sideways.
• Clearing a level earns a sticker.
• One big button leads to the next level. No reading needed.

FOR THE FAMILY
• In Mexican Spanish and in English, with a voice in both.
• Four characters: an apple, a princess, a dinosaur and a ninja.
• Three speeds and separate overall, music, voice and effects volume controls.
• Progress is kept for each age, so brothers and sisters of different ages can share a device.

The game's voice is AI-generated, not a person.

**Keywords**

preschool,toddler,kids,numbers,colors,shapes,counting,addition,patterns,learning,spanish,princess

**What's new (first version)**

First version.

## Privacy answers ("App Privacy" in App Store Connect)

- Does the app collect data? **No.** The label will read "Data Not Collected".
- The game creates no accounts and uses no ads or analytics. Gameplay data stays on the device. Apple processes optional tips through StoreKit; the app verifies transactions locally and does not send receipts or purchase history to a developer server.
- Review the final archive's privacy report and current questionnaire before submission. Information processed solely on-device is not collected by the developer; Apple's payment processing is separate.

## Age rating answers

Complete Apple's current questionnaire based on the submitted build. There is no chat, user-generated content, advertising, gambling or unrestricted web browsing. Parent-only support/privacy references are behind an adult question. Do not mark every item "None" without reading it: purchase and other capability questions must reflect the final build. "Made for Kids: ages 5 and under" is separate from the calculated content rating.

## Notes for Apple's reviewer

Paste this into "App Review Information":

> This is a free learning game for children aged 3 to 6, with no ads, game accounts or developer data collection. Gameplay works offline. Optional consumable tips require an App Store connection and unlock no content.
>
> The settings screen is reached with the gear button on the start screen. Choose Support the game / Apoyar el juego and type the answer to the multiplication question. The three tip amounts come from StoreKit and open Apple's purchase confirmation. Each attempt requires a fresh parent check. Cancellation and pending approval do not change game progress. No external payment links appear in the iOS app. Privacy and credits is also behind a parental gate.
>
> The spoken voice is AI-generated (ElevenLabs text-to-speech, a voice designed for this game), recorded in advance and stored inside the app.

## Before submitting tips

English description: "The entire game is free. Adults can optionally leave a one-time tip through Apple's in-app purchase system, behind a parental gate. Tips do not unlock features or give children rewards."

Spanish description: "Todo el juego es gratis. Los adultos pueden dejar una propina opcional mediante las compras dentro de la app de Apple, detrás de una pregunta para adultos. Las propinas no desbloquean funciones ni dan premios a los niños."

Attach the three consumable products in `tip-products.json` to the first submission, after real sandbox testing. Do not submit until Apple returns the products in both the US and Mexico sandbox storefronts.

## Still to make

- **Screenshots**, after this weekend's changes are in, so they show the finished game: iPhone 6.9-inch (1320 × 2868) and iPad 13-inch (2064 × 2752), in Spanish and in English.
- **A contact email** for the App Store listing, if you would like one that is not your own.
