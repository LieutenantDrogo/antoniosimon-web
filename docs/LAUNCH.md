# Publicación de antoniosimon.es

Preparado el 18 de septiembre de 2026. La web está construida y desplegada en
`antoniosimon-web.pages.dev`. Este documento es el plan para llevarla al dominio
definitivo sin tocar el correo. **No se ha cambiado todavía ningún servicio, DNS
ni contrato.**

---

## 1. Recomendación en una línea

**Web en Cloudflare Pages (gratis), zona DNS en Cloudflare (gratis), correo en
dinahosting rebajado a su plan de solo correo, dominio en Arsys por ahora.**

Son cuatro servicios independientes. No hace falta trasladar el dominio para
cambiar de alojamiento web, y no hace falta tocar el correo para cambiar la web.
El ahorro está en sustituir el alojamiento web —que ya no necesitas, porque el
sitio es estático— conservando un buzón completo para `info@antoniosimon.es`.

| Servicio | Hoy | Después | Coste anual |
|---|---|---|---|
| Web | dinahosting (hosting web) | Cloudflare Pages Free | 0 € |
| Zona DNS | dinahosting (`ns*.gestiondecuenta.com`) | Cloudflare (zona Free) | 0 € |
| Correo | dinahosting (hosting web) | dinahosting «Hosting Correo» | ~30 € + IVA |
| Dominio `.es` | Arsys | Arsys, y más adelante dinahosting | ~25 € + IVA |

### Por qué Cloudflare Pages

El sitio es HTML, CSS y tipografías estáticas: sin base de datos, sin PHP, sin
gestor de contenidos. El plan gratuito de Pages da ancho de banda ilimitado para
estáticos, CDN global, certificado automático, 500 compilaciones al mes y hasta
20.000 archivos por sitio (esta web tiene menos de cien). Ya está funcionando
ahí: cada `git push` a `main` regenera y despliega el sitio en aproximadamente un
minuto.

Alternativas descartadas, con su razón:

- **Seguir en dinahosting.** Es lo de menor esfuerzo inmediato —subir una
  carpeta— y sirve de red de seguridad durante la migración. Pero implica
  mantener un plan de alojamiento web que solo usarías para servir ficheros
  estáticos, sin despliegue automático ni CDN.
- **Netlify Free.** Equivalente en capacidad. La web ya está en Pages; cambiar
  no aporta nada.
- **Cloudflare Registrar.** No admite dominios `.es`: el TLD no aparece en su
  lista de extensiones soportadas. Queda descartado como registrador.

### Por qué el correo se queda en dinahosting

Un servicio de reenvío (por ejemplo Cloudflare Email Routing, gratuito) reenvía
el correo a otra cuenta, pero no es un buzón: no conserva histórico, carpetas ni
acceso IMAP, y enviar *como* `info@antoniosimon.es` exige además un SMTP externo.
Para conservar el buzón tal y como está, el camino limpio es quedarse en
dinahosting y rebajar el plan.

Su plan **Hosting Correo** ofrece 10 buzones y 50 GB por 1,25 €/mes el primer año
y 2,50 €/mes en renovación, impuestos aparte. Requiere que el dominio esté
registrado en dinahosting **o** que el DNS apunte a sus servidores de correo, que
es exactamente lo que hará la zona de Cloudflare.

---

## 2. Estado observado hoy

Consulta DNS pública del 18/09/2026. Es una instantánea parcial, **no una copia
de la zona**: antes de migrar hay que exportar la zona completa desde
dinahosting.

| Registro | Valor |
|---|---|
| NS | `ns.gestiondecuenta.com`, `ns2`, `ns3`, `ns4` (dinahosting) |
| A de `antoniosimon.es` | `82.98.164.41` |
| MX | prioridad 10 → `mail.antoniosimon.es` |
| A de `mail.antoniosimon.es` | `82.98.164.41` |
| TXT SPF | `v=spf1 a mx ~all` |
| `_dmarc` | sin respuesta |
| DS (DNSSEC) | sin respuesta |
| Registrador | Arsys; dominio creado en 1988, estado ACTIVE |

Dos consecuencias prácticas:

1. La web y el correo comparten IP, pero `mail.antoniosimon.es` tiene su propio
   registro A. **Al mover la web, ese registro debe conservarse intacto.**
2. El SPF contiene el mecanismo `a`, que autoriza la IP del dominio raíz. Al
   cambiar el A de la raíz a Cloudflare, ese mecanismo deja de autorizar al
   servidor de salida de dinahosting. Hay que **pedirles el SPF correcto** y
   dejarlo escrito antes de mover la web, manteniendo un único registro SPF.

---

## 3. Secuencia de publicación

### Paso 0 — Revisión editorial

Repasar `docs/TEXTOS.md` y `docs/PENDIENTES.md`. Ninguno de los pendientes
bloquea la publicación.

### Paso 1 — Revisión en dispositivos

Abrir `https://antoniosimon-web.pages.dev/` en escritorio, iPad y móvil reales.
Comprobar las ocho secciones en los dos idiomas, el menú desplegable, el
conmutador de idioma y la reproducción de los dos vídeos.

### Paso 2 — Copias de seguridad

- Exportar **la zona DNS completa** desde el panel de dinahosting y guardarla.
- Descargar una copia de la web que hoy está publicada.
- Anotar los datos de configuración de los clientes de correo que ya funcionan
  (servidor entrante, saliente, puertos), por si hubiera que reconstruirlos.

### Paso 3 — Crear la zona en Cloudflare

Cloudflare Pages solo puede servir el dominio **raíz** (`antoniosimon.es`, sin
`www`) si la zona DNS está en Cloudflare. El registrador puede seguir siendo
Arsys.

1. Añadir `antoniosimon.es` como zona Free en Cloudflare.
2. **Comparar la importación automática registro a registro con la exportación
   del paso 2.** Una importación automática puede omitir registros.
3. Conservar MX, `mail`, webmail, autodiscover, SPF, DKIM, TXT de verificación y
   cualquier otro registro de correo. Todos los nombres que atienden correo van
   en modo **DNS only**, sin proxy naranja.
4. Añadir DMARC en modo observación: `_dmarc` TXT `v=DMARC1; p=none; rua=mailto:info@antoniosimon.es`.
5. Confirmar con dinahosting el SPF correcto para sus servidores de salida y el
   selector DKIM si lo ofrecen.
6. Comprobar DNSSEC en Arsys. Hoy no hay DS, pero hay que repetir la consulta en
   el momento de migrar: un DS activo durante el cambio de nameservers deja la
   delegación inválida.

### Paso 4 — Cambiar los nameservers

En el panel de Arsys, sustituir los cuatro nameservers de dinahosting por **los
dos exactos que asigne Cloudflare**. Hacerlo un día laborable por la mañana.
No tocar MX. No dar de baja nada todavía.

Mientras propaga (de minutos a 24 h), el correo sigue funcionando porque los
registros de correo se han copiado idénticos a la zona nueva.

### Paso 5 — Conectar el dominio a Pages

1. En el proyecto de Pages, añadir `antoniosimon.es` y `www.antoniosimon.es`
   desde el panel. Un CNAME suelto sin asociar antes el dominio **no funciona**.
2. Esperar la validación y la emisión del certificado.
3. Crear una regla de redirección permanente de `www` al dominio raíz,
   conservando ruta y parámetros. Forzar HTTPS.

### Paso 6 — Abrir a los buscadores

En las variables de entorno de Producción del proyecto de Pages, **borrar
`NOINDEX`** (o darle cualquier valor distinto de `true`) y lanzar un nuevo
despliegue. `robots.txt` pasa solo de `Disallow: /` a `Allow: /` más el puntero
al sitemap, porque lee la misma variable. No hay cambio de código.

### Paso 7 — Verificación en producción

- Las 16 rutas en los dos idiomas, más una URL inexistente (debe dar el 404 del
  sitio).
- `hreflang`, canónicas y sitemap: `https://antoniosimon.es/sitemap-index.xml`.
- Los dos vídeos, reproducidos de verdad en el dominio definitivo: YouTube puede
  restringir la incrustación según el origen.
- **Correo:** enviar un mensaje a `info@antoniosimon.es` desde una cuenta externa
  (Gmail sirve), responder desde el buzón, y comprobar en la cabecera del mensaje
  recibido que SPF y DKIM dan `pass` y que no ha caído en spam. Comprobar que los
  dispositivos que ya usan el buzón siguen funcionando.
- Lighthouse en móvil y escritorio.

### Paso 8 — Search Console

Verificar la propiedad de dominio con un TXT en Cloudflare y enviar el sitemap.

### Paso 9 — Reversión, si hiciera falta

- **Problema solo de web:** restaurar el registro A de la raíz hacia
  `82.98.164.41`, dejando intactos los de correo. El alojamiento antiguo sigue
  activo hasta febrero de 2027.
- **Problema de correo:** comparar la zona importada con la exportación del paso
  2 y corregir el registro concreto. No mezclar una incidencia de correo con un
  cambio de nameservers.
- La propagación y las cachés hacen que ninguna reversión sea instantánea.

---

## 4. Calendario hasta febrero de 2027

| Cuándo | Qué |
|---|---|
| Ahora | Pasos 0 a 8: publicar en el dominio |
| Diciembre 2026 | Pedir a dinahosting por escrito: precio de renovación con impuestos del plan «Hosting Correo»; si la conversión desde el plan actual conserva buzón, histórico, carpetas, alias y contraseñas sin migración; SPF y DKIM de sus servidores de salida; plazo para modificar o desactivar la renovación del alojamiento web |
| Enero 2027 | Ejecutar el cambio de plan, con margen sobre el 3 de febrero. **No dar de baja el alojamiento mientras el correo dependa de él** |
| Cuando venza el dominio en Arsys | Valorar el traslado del `.es` a dinahosting, para tener dominio y correo en un solo proveedor |

### Sobre el traslado del dominio

No es urgente y no mejora la velocidad de la web. Cuando se haga:

- El auth-code de un `.es` se pide en Arsys desde «Contacto» del Área de Cliente,
  como trámite administrativo. Caduca a los diez días.
- red.es envía después un correo al contacto administrativo del dominio con un
  enlace para aceptar o cancelar el traslado. **Ese contacto tiene que ser una
  dirección que puedas leer**; conviene comprobarlo antes de empezar.
- Un traslado de `.es` no funciona igual que un `.com` y no siempre añade un año
  de registro. Confirmar precio de renovación, no de promoción.
- Los nameservers de Cloudflare se conservan en el traslado: el registrador
  cambia, la zona no.
- **Nunca encadenar en la misma semana** traslado de registrador, cambio de
  nameservers y cambio de plan de correo.

---

## 5. Accesos necesarios

Cuenta de Cloudflare a tu nombre; panel de Arsys para los nameservers; panel de
dinahosting para exportar la zona y gestionar el correo. No hacen falta claves de
API. Ninguna contraseña debe guardarse en este repositorio ni enviarse por
correo.

---

## 6. Después de publicar

- **Contenido** (agenda, programas, textos): editar los ficheros de
  `src/content/`, confirmar el cambio y subirlo. Se puede hacer desde el editor
  web de GitHub. El despliegue es automático.
- **Agenda:** añadir un concierto es añadir un bloque a `src/content/agenda.yaml`.
  La web reparte sola entre «Próximamente» y «Recientes» según la fecha, y la
  portada calcula sola cuál es la próxima cita.
- **Textos para revisar:** `python3 scripts/export-texts.py` regenera
  `docs/TEXTOS.md` con toda la copia del sitio en los dos idiomas.
- **Retratos:** `npm run images` regenera `public/img/` desde
  `source-photos/portraits/`. Requiere el entorno Python local; nunca se ejecuta
  en el servidor. La salida se confirma al repositorio a mano.
- **Sin analítica.** Si algún día la quieres, Plausible o GoatCounter no
  necesitan aviso de cookies.
