# Pulso Desk · Manual de uso

Plataforma para gestionar **soporte al cliente + pedidos de mejora + desarrollo** desde un solo lugar. Reemplaza el caos de tener los pedidos sueltos en WhatsApp.

- 🌐 URL: **https://pulso-desk.pages.dev**
- 👥 Funciona en mobile, tablet y escritorio (PWA — podés "instalarla" como app).
- 🎨 Cada módulo tiene su color: **Tickets** rojo, **Solicitudes** ámbar, **Órdenes** indigo, **Clientes** emerald, **Sistemas** violeta.

---

## Primer acceso

1. Entrás con el **email y la contraseña** que te pasó el admin.
2. Si la pantalla queda en "Cuenta sin perfil asignado", pedile al admin que te cree el perfil.
3. Arriba a la derecha de la pantalla inicial vas a ver tu **rol**: Administrador, Desarrollador o Soporte. Según el rol, ves más o menos cosas.

### Navegación
- **Mobile**: barra abajo con Inicio · Tickets · Órdenes · Clientes · Más.
- **Desktop**: sidebar a la izquierda con todos los módulos.
- **Modo oscuro**: Más → toggle "Modo oscuro/claro".

---

## 🎧 Guía para SOPORTE

Tu trabajo: **recibir mensajes por WhatsApp, registrarlos rápido y darles seguimiento**.

### 🔴 1. Captura rápida (el botón que más vas a usar)

En la esquina inferior derecha hay un **botón rojo con un `+`**. Ese botón está siempre visible mientras navegás. Es tu arma principal.

**Cuando un cliente te escribe por WhatsApp:**

1. Tocá el botón rojo `+`.
2. Se abre el sheet "Captura rápida". El cursor está automáticamente en **Teléfono**.
3. Tipeá el número del cliente (ej: `0981234567`).

**La magia pasa acá según lo que encuentre:**

- ✅ **Si el cliente YA existe** → aparecen coincidencias verdes. Tocá la que corresponde y queda seleccionado.
- 🆕 **Si es cliente NUEVO** → aparece un cartelito ámbar pidiendo nombre de quien escribe + empresa (opcional). Se va a crear todo junto al guardar.

4. Escribí **qué pasó** en el título (una línea: *"No imprime el ticket tras actualización"*).
5. Elegí la **prioridad**: 🔴 Alta · 🟡 Media · ⚪ Baja.
6. Apretá **"Crear ticket ahora"**.

Listo — el ticket queda abierto, asignado a vos, con el cliente (nuevo o existente) enganchado. Te lleva automáticamente al detalle para seguir trabajándolo.

### 🎫 2. Trabajar el ticket

Cuando entrás al ticket (desde la lista o recién creado), tenés:

#### Botón grande verde "Cerrar ticket" arriba de todo
Tocalo cuando resolviste el problema. Si te equivocás, podés **reabrirlo** después (botón negro).

#### Cambiar campos
- **Estado**: Abierto → En proceso (empezaste a trabajarlo) → Esperando cliente (le mandaste una pregunta, esperás respuesta) → Cerrado.
- **Prioridad**: ajustala si ves que es más urgente/menos.
- **Asignado a**: si otro del equipo tiene que encargarse, cambiale.
- Todo se guarda **automáticamente** al cambiarlo.

#### Historial (timeline)
Cada vez que le respondés al cliente o anotás algo interno, apretá el botón **"Agregar al historial"**. Tenés 3 tipos de origen:
- 🛠 **Interno** → nota para el equipo, el cliente no la ve.
- 💬 **Cliente** → lo que te escribió el cliente (pegalo textual).
- 📝 **Nota** → recordatorio/observación.

Esto es importante porque cuando otro del equipo abra el ticket, ve toda la conversación y no arranca de cero.

#### Etiquetas
Tagueá el ticket con palabras clave: `impresora`, `facturación`, `error sistema`, etc. Son botones — tocás para activar/desactivar. Después el dashboard te dice qué etiquetas son las más frecuentes (= qué falla más seguido).

#### Generar orden de trabajo
Si el problema requiere que el dev **cambie código**, apretá **"Generar orden de trabajo"** al pie. Eso crea una orden vinculada al ticket con los datos ya heredados (título, descripción, prioridad). El dev la ve en su cola.

### 💡 3. Registrar pedidos de mejora

Si el cliente **no reporta un problema sino que pide una mejora** (*"me gustaría que el sistema sume tal función"*), usás **Solicitudes** en vez de Tickets:

1. Barra lateral → **Solicitudes → + Nueva**.
2. Título corto: *"Reporte de ventas por vendedor"*.
3. Descripción: qué quiere, para qué.
4. **Cliente que lo pidió**: elegís el cliente (o dejás vacío si lo pidieron varios).
5. **Sistema**: qué producto cambia (POS / SIFEN / etc).
6. **Impacto**: bajo / medio / alto (qué tanto le mejora al cliente).
7. **Frecuencia**: cuántos clientes lo pidieron. Si ya existe y otro lo vuelve a pedir, **subile el número**.

El admin después aprueba o rechaza. Las aprobadas las convierte en órdenes el desarrollador.

### 👀 Dónde mirás qué cada día

| Pregunta | Dónde |
|---|---|
| "¿Qué tengo abierto para responder?" | **Inicio** → tus tickets asignados |
| "¿Cuántos tickets hay en total?" | **Tickets** filtro "Abiertos" |
| "¿Este cliente me escribe seguido?" | **Clientes** → buscás → su historial de tickets |
| "¿Hay alguno vencido hace días?" | **Inicio** → los días en rojo son tickets viejos sin cerrar |
| "¿Qué empresa es este teléfono?" | **Clientes** → buscar por número (funciona aunque el número cambie 1-2 dígitos) |

### ⚠️ Reglas de oro de soporte

- **Siempre registrar** — si no quedó en Pulso Desk, es como si no pasó.
- **Cerrar tickets cuando se resuelven** — si no, el dashboard se ensucia con tickets "zombies".
- **Etiquetar** — te sirve a futuro para decir *"este problema ya lo tuvimos 8 veces"*.
- **Escribir el título como una frase clara**, no *"no anda"* sino *"Impresora no imprime después de actualización del 2026-04-20"*.

---

## 💻 Guía para DESARROLLADOR

Tu trabajo: **mirar las órdenes aprobadas, trabajarlas, entregarlas**.

### 📋 1. Cola de órdenes

Entrás a **Órdenes** (icono tablilla, color indigo). Ves la lista **ordenada por prioridad + antigüedad** — las más urgentes arriba.

**Filtros disponibles:**
- Arriba: estado (Activas / Pendiente / En progreso / Terminadas / Todas).
- Abajo: por sistema (POS, SIFEN Engine, Panel Web, XMLBox, CRM-Contactos, Pulso Desk, etc).

Cada card te muestra:
- **#N° · estado · prioridad · sistema** (badges de color)
- **Título** de la orden
- **Funcionalidad** (qué agrega/cambia)
- **"Hace X días"** — en rojo si pasaron 14+ sin terminar, naranja si 7+.
- **Vencida**: si la fecha objetivo ya pasó, aparece un badge rojo con ⚠️.
- Asignado a quién.

### 🛠 2. Trabajar una orden

Al abrirla ves arriba:
- 📅 **Badge con los días transcurridos**
- 📅 **Fecha objetivo** (si tiene) — se pinta rojo si ya venció.

Más abajo:
- **Estado**: Pendiente → En progreso → Terminado. Cambialo al arrancar y al terminar.
- **Sistema / prioridad / complejidad / asignado / fecha objetivo** — editables.
- **Funcionalidad**: qué se agrega.
- **Descripción técnica**: notas (endpoints, tablas, consideraciones).

#### Bitácora de observaciones (crítico)

Esto es lo que te diferencia de "solo cambié el estado". Cada vez que hay un avance real, **agregá una observación**:

- *"Migration subida, falta probar con data real"*
- *"Backend listo, empezando la UI"*
- *"Deployado en staging, esperando feedback del cliente"*
- *"Bug corregido, cerrado en commit abc123"*

Cada nota queda con tu nombre + fecha. Así cuando el admin o soporte miran la orden, entienden el estado real sin preguntarte.

#### Tickets y solicitudes vinculados

Una orden puede estar relacionada a uno o más tickets/solicitudes (N:N). Abajo del detalle ves esas relaciones y podés:
- **Vincular** más tickets/solicitudes (si descubrís que 3 clientes reportaron el mismo bug, los enganchás todos acá).
- **Desvincular** con el `✕` si una no corresponde.

### 💡 3. Convertir solicitudes en órdenes

Cuando el admin **aprueba** una solicitud, ya podés convertirla:

1. Entrás a la solicitud (desde **Solicitudes**).
2. Botón al pie **"Generar orden de trabajo"**.
3. Se abre Nueva Orden con los campos **ya heredados**: título, descripción técnica, sistema, prioridad (según el impacto de la solicitud).
4. Ajustás lo que falte (complejidad, fecha objetivo, asignado) → **Crear orden**.

Queda vinculada automáticamente a la solicitud.

### 🧭 4. Filosofía: Pendiente vs En progreso vs Terminado

- **Pendiente**: está en el backlog, nadie la empezó. Decidís vos cuándo arrancar.
- **En progreso**: estás activamente desarrollándola. No tengas 10 órdenes en progreso al mismo tiempo — ideal es 1-2.
- **Terminado**: ya la entregaste. Se registra automáticamente la fecha.

**Cuando termines, avisa al soporte** para que cierre los tickets relacionados con el cliente. El soporte no mira las órdenes todo el día.

### 🖥 5. Sistemas

En **Sistemas** (violeta) ves la lista de productos que mantiene el equipo (POS, SIFEN, etc). Entrando a cada uno:
- Cuántas órdenes totales / activas / terminadas tiene.
- Historial completo de todas las órdenes de ese sistema.

Útil cuando alguien pregunta *"¿qué estamos tocando del POS?"* — entrás ahí y mostrás.

### ⚠️ Reglas de oro de dev

- **Bitácora siempre** — mínimo 1 nota por día de trabajo en la orden.
- **Mover estado al arrancar** — si está en "En progreso" pero vos todavía no la empezaste, otro puede confundirse.
- **Cerrar al terminar** — estado Terminado + nota final "Entregado a cliente".
- **Una cosa a la vez** — si te llegan 3 urgencias, priorizá, no arranques las 3.

---

## 🆘 Preguntas frecuentes

### "No me deja crear un ticket"
- ¿Ves el botón rojo `+` flotante? Si no → no tenés rol admin ni soporte. Pediselo al admin.
- ¿La página carga blanca? Refrescá con Ctrl+F5.
- ¿Dice "JWT expired"? Refrescá la página o cerrá sesión y volvé a entrar.

### "No encuentro al cliente"
- Probá buscar por teléfono, nombre o empresa en **Clientes**.
- La búsqueda es **fuzzy** — aunque le erres 1 o 2 dígitos te lo muestra.
- Si realmente no está, creaselo con **+ Nuevo** o directamente desde la captura rápida del ticket.

### "Hice algo mal en un ticket, ¿puedo deshacer?"
- **Cambios a selectores** (estado, prioridad): no hay deshacer. Volvelo a la opción correcta.
- **Mensajes del historial**: una vez agregados quedan, podés agregar una nota aclaratoria al lado.
- **Tickets completos**: solo el admin puede borrar (desde el ícono de basura).

### "Cerré un ticket por error"
- Botón **"Reabrir ticket"** arriba del todo.

### "El cliente escribió de otro número"
- Abrí su cliente, **+ Agregar contacto** → cargás el número nuevo con su rol (dueño, cajero, etc). Después los tickets nuevos podés asignarlos a ese contacto específico.

### "¿Qué diferencia hay entre Ticket y Solicitud?"
- **Ticket** = algo puntual que pasa ahora (problema o consulta). Tiene dueño y se cierra.
- **Solicitud** = mejora/feature a futuro. Se acumula con frecuencia (cuántos la pidieron) y el admin decide si la aprueba.

### "¿Qué diferencia hay entre Solicitud y Orden?"
- **Solicitud** = *"me gustaría que..."* (idea, sin trabajo comprometido).
- **Orden** = *"vamos a hacer esto"* (trabajo concreto en el pipeline de dev).

---

## 🎯 Flujo completo de ejemplo

**Día lunes 9:00 AM — el cliente Pizzería El Rey (Juan) escribe por WA:**
> *"Buen día, la impresora no imprime después de la actualización de ayer."*

**9:02 — Ana (soporte) abre Pulso Desk en el celu:**
1. Botón rojo `+` → escribe `0981234567`.
2. Salta la coincidencia: *"Juan · Pizzería El Rey"*. Tap.
3. Título: *"Impresora no imprime tras actualización"*.
4. Prioridad: 🔴 Alta (el cliente no puede vender).
5. Crear ticket → queda ticket #47.

**9:05 — Ana le responde al cliente por WA, y deja nota en el ticket:**
- Origen **Cliente**: *"Pregunté si probó reiniciar la impresora → dijo que sí"*.
- Origen **Interno**: *"Parece bug del driver tras update. Paso a dev"*.
- Cambia estado a "En proceso".

**9:10 — Ana genera orden desde el ticket:**
- Botón "Generar orden de trabajo" al pie → se abre Nueva Orden con datos heredados.
- Ajusta: Sistema = POS, Complejidad = media, Fecha objetivo = 2026-04-23.
- Crear orden → queda orden #12 vinculada al ticket #47.

**11:30 — Carlos (dev) mira Órdenes:**
- Ve la #12 arriba porque es prioridad alta.
- Abre, estado → En progreso, se la asigna.
- Empieza a debuggear.

**14:00 — Carlos deja nota en la bitácora:**
- *"Identifiqué el bug en driver de Epson. Rollbackeando a versión anterior del driver en el update."*

**16:30 — Carlos termina:**
- Estado → Terminado.
- Nota final: *"Fix subido, cliente tiene que bajar la actualización 2.3.1."*
- Le avisa a Ana por WhatsApp interno.

**16:35 — Ana entra al ticket #47:**
- Le avisa a Juan por WhatsApp con el link/instrucciones.
- Estado → Esperando cliente.

**Martes 10:00 — Juan confirma por WA que todo funciona:**
- Ana agrega mensaje: *"Cliente confirma que ya imprime OK"*.
- Botón verde **"Cerrar ticket"**.

**Miércoles — Dashboard muestra:**
- Problema frecuente: etiqueta "impresora" con 3 apariciones.
- Tiempo promedio de cierre: 1.2 días.
- Cliente más demandante del mes: Pizzería El Rey con 4 tickets.

Con esos datos decidís qué priorizar la próxima semana.

---

## 📞 Contacto / soporte interno

Si algo de la plataforma no funciona, avisá al admin del equipo. Si el admin necesita algo nuevo de la app, lo cargás como **Solicitud** con sistema = **Pulso Desk**.

**Versión de este manual:** 2026-04-21
