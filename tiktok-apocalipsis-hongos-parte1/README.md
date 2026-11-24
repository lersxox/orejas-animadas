# Guía para no morir como un tonto · Parte 1

Un vídeo de TikTok de 60 segundos (9:16, 1080×1920, 30 fps) en español, para adolescentes. Trata de qué hacer si vives en un apocalipsis de hongos tipo *The Last of Us*. Todos los dibujos, personajes y sonidos son originales y están hechos con código: no hay imágenes ni música de stock.

**El vídeo final:** `final/guia-apocalipsis-hongos-parte1.mp4`

## El formato de la serie

**Kevin** lo hace todo mal. El narrador (los textos grandes) le insulta con cariño (✗ ASÍ NO). Después **Lupe** enseña cómo se hace bien (✓ ASÍ SÍ).

| tiempo | escena | insulto / consejo |
|---|---|---|
| 0–4 s | Gancho: Kevin tan feliz con el móvil y los infectados acercándose | "…NO SEAS COMO KEVIN. Duró 2 días. Y tú, con esa cara, uno." |
| 4–6 s | Título, una palabra por golpe | GUÍA PARA NO MORIR COMO UN TONTO · PARTE 1 |
| 6–16 s | Regla 1: CERO RUIDO (música a tope, ¡CLANK!) | "¿Música a tope, genio? Les estás dando un concierto." ✓ "Camina como un ninja, no como un elefante en chanclas." |
| 16–26 s | Regla 2: PONTE LA MÁSCARA (¡ACHÍS! y le salen setas) | "Las esporas no son purpurina, cerebro de lenteja." ✓ "Máscara siempre. Aunque te despeine." |
| 26–36 s | Regla 3: SI TE MUERDEN, AVISA ("me arañó un gato", y el gato: "¿perdona?") | "¿Qué gato, Kevin? Mentir no te cura, payaso." ✓ "Te muerden = avisas." |
| 36–46 s | Regla 4: SI HACE CLIC-CLIC, NI RESPIRES (selfie con el Coliflor) | "¿Un selfie? Aura −1000. Influencer de pacotilla." ✓ "Tira algo lejos y pasa calladito." |
| 46–54 s | Regla 5: NUNCA VAYAS SOLO ("¿hola? ¿hay alguien?") | "Sí, Kevin: 20 zombis y tu ego. ¿En serio, NPC?" ✓ "En grupo. Hasta para ir al baño." |
| 54–60 s | Final: Kevin ya es un champiñón con patas | "Sígueme para la Parte 2… o te sale un champiñón." · sello PARTE 2 MUY PRONTO |

## Texto sugerido para publicar

> Guía para NO morir como un tonto en el apocalipsis de los hongos 🍄 Parte 1. ¿Qué regla rompería tu amigo? 👀 Etiquétalo
>
> #thelastofus #zombies #apocalipsis #humor #parati #fyp #kevin #animacion

## Sonido

Es una música propia en re menor: trap "de puntillas" a 120 BPM, con pizzicato, 808 y palmas. Cada gag tiene su golpe exacto: el CLANK de la lata, el ¡ACHÍS!, los POP de las setas, el clic-clic, el CLIC del selfie, la puerta… Las voces son balbuceos de dibujos animados y lo que dicen va en bocadillos. Así el vídeo se entiende sin sonido, y si quieres puedes añadir tu propia voz o la voz de texto a voz de TikTok encima. El volumen está a −14 LUFS.

## Cómo editarlo o hacer la Parte 2

Hace falta Node 22+, ffmpeg y Chrome/Chromium. No hay que instalar nada con npm.

```bash
node song.js                       # la música  -> out/music.wav
node engine/render.js stills 12.5  # un fotograma para revisar -> out/stills/
node engine/render.js video        # todos los fotogramas -> out/video.mp4 (unos minutos)
node engine/render.js mux          # vídeo + música -> out/tiktok-apocalipsis-hongos-parte1.mp4
node engine/render.js verify       # comprueba que cada golpe de sonido cae en su fotograma
```

- `score.js`: el guion. Ahí están los tiempos de cada evento, los textos del narrador (`say`; `*palabra*` sale en amarillo) y los bocadillos (`lines`). Si cambias un tiempo aquí, se mueven a la vez la imagen y el sonido.
- `song.js`: la música y los efectos.
- `lib.js`: el reparto (Kevin, Lupe, Toño, Nora, los infectados, el Coliflor), los accesorios y los textos.
- `backgrounds.js`: los fondos (ciudad, sótano, campamento, centro comercial, pasillo).
- `film.js`: las escenas y el montaje.

Para la Parte 2, copia la carpeta, cambia las reglas en `score.js` (`rules`, `say`, `lines`, `ev`) y reutiliza a Kevin, Lupe y los fondos.
