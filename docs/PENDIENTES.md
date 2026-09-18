# Pendientes antes de publicar

La web está completa y navegable. No hay enlaces rotos ni botones sin destino:
donde falta un dato, la frase se ha escrito de modo que no lo necesite, en lugar
de dejar un hueco visible. Esta lista es lo que **mejoraría** la web, no lo que
la bloquea. Ninguno de estos puntos impide publicar.

## 1. Vídeos (`src/content/videos.yaml`)

Los dos vídeos del borrador se conservan. Títulos verificados contra YouTube:
Schubert, Sonata D. 960, II. Andante sostenuto (fortepiano) y Scriabin, Preludio
op. 11 n.º 15 (piano moderno). **Faltan:** el instrumento concreto (¿qué
fortepiano?), la sala y la fecha de cada grabación. Cuando los tengas, se añaden
al pie de cada vídeo.

También conviene decidir si esta pareja sigue siendo la que mejor te representa.
La página está construida para dos vídeos; añadir un tercero requiere un ajuste
de rejilla de una línea.

## 2. Duraciones de los programas (`src/content/programmes.yaml`)

Cada programa tiene un campo `duration` vacío. Hoy la página dice que repertorio,
duración e instrumento se acuerdan por propuesta, lo cual es cierto y suficiente.
Pero un programador agradece una cifra orientativa. Si me das las cinco
duraciones aproximadas, aparecerán en la línea de datos de cada ficha.

## 3. Investigación: enlaces (`src/content/research.yaml`)

Cada una de las cuatro líneas admite un campo `url` opcional que, si existe,
pinta un enlace «Leer / Read». Hoy no hay ninguno. Candidatos:

- Vídeo o programa de la conferencia de Perugia (*Against Horror Vacui*).
- Repositorio de la tesis doctoral (RIUMA u otro) y su título exacto.
- Dos o tres artículos publicados, como máximo.

## 4. Agenda (`src/content/agenda.yaml`)

Los seis compromisos proceden de Career Atlas, solo los marcados como
confirmados. Antes de publicar conviene comprobar dos cosas:

- **Permiso de anuncio.** ¿Puede anunciarse ya cada fecha, o algún organizador
  prefiere anunciarla él primero? Especialmente Alhaurín y Unicaja.
- **Salas y enlaces.** Unicaja figura como «septiembre de 2027, día por
  confirmar». Cada fila admite un campo `url` opcional hacia la página del
  organizador.

No se publica nada de Atlas que no sea un compromiso confirmado: ni el ensemble,
ni las negociaciones, ni los contactos, ni las notas privadas.

## 5. Disco de Liszt

Figura como grabado en un Bechstein de 1860, en posproducción, con publicación
prevista para 2027. **No se nombra sello** y **no se afirma primicia** («primera
grabación con instrumento de época»), porque Atlas marca ambas cosas como no
cerradas. Cuando el sello esté firmado y la primicia verificada, son dos líneas
en `src/content/recordings.yaml`.

## 6. Fotografías de prensa

La biografía breve, en los dos idiomas, está en la propia página de biografía,
lista para copiar y para imprimir. Las fotografías se piden por correo: no se ha
inventado un dossier descargable. Si en algún momento montas un PDF de prensa, el
sitio para colgarlo es `public/press/` y el enlace va en la página de contacto.

## 7. Retrato de la biografía

`source-photos/portraits/about-profile-green.JPG` es el original de menor
resolución del conjunto (768×960 frente a 960×1200 del resto). Si aparece una
toma de mayor resolución de esa misma sesión, se sustituye el archivo y se
ejecuta `npm run images`.

---

## Lo que ya no hace falta decidir

- Correo: `info@antoniosimon.es`, confirmado y en uso en toda la web.
- Idioma principal: inglés en la raíz, español bajo `/es/`, con `hreflang` en
  ambas direcciones y conmutador que conserva la sección.
- Cabecera: fila completa a partir de 1080 px, menú desplegable por debajo.
