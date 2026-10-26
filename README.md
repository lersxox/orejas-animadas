# Orejas Animadas (Fabric 1.20.1) — para Modrinth App

Mod del lado del cliente con orejas de **zorro**, **gato** y **perro**.

## Instalar en el launcher de Modrinth (App)
1. Consigue el `.jar` (ver "Obtener el .jar" abajo).
2. En Modrinth App: **Library → Create new instance** → Minecraft **1.20.1**, loader **Fabric**.
3. Abre la instancia → **Add content** → busca **Fabric API** e instálalo.
4. **Add content → Add from file** y elige `orejas-animadas-1.0.0.jar`.
5. Play. Las teclas están en Opciones → Controles → *Orejas Animadas*.

(Funciona igual con Quilt.)

## Obtener el .jar
**Opción A, sin instalar nada (GitHub Actions):**
1. Crea un repo en GitHub y sube todo el contenido de esta carpeta.
2. Pestaña **Actions** → workflow **Build** → cuando termine, descarga el artefacto `orejas-animadas-jar`.

**Opción B, en tu PC (JDK 17):**
1. `gradle wrapper --gradle-version 8.5`  (o copia gradlew y gradle/ de fabric-example-mod)
2. `./gradlew build` → el .jar queda en `build/libs/` (usa el que no termina en `-sources`).
3. Para probar sin launcher: `./gradlew runClient`.

## Publicar en Modrinth (opcional)
1. Crea el proyecto en modrinth.com (usa el texto de `MODRINTH_PAGE.md` y `assets/earsmod/icon.png`).
2. Sube el .jar como versión: loaders Fabric/Quilt, versión de juego 1.20.1, dependencia **Fabric API**, entorno *client*.
3. Automático: pon tu token en el secret `MODRINTH_TOKEN`, el ID en `.github/workflows/build.yml` y crea un tag `v1.0.0`.

## Teclas
G cambiar orejas · H mover orejitas · J orejas en otros jugadores.

Config: `config/earsmod.properties` (type, showOthers, hideWithHelmet).
