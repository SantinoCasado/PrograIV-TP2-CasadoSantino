# Aura — Red Social

> Aplicación de red social fullstack desarrollada para la materia **Programación IV** (UTN).

---

## 🚀 Demo en vivo

[![Ver demo](https://img.shields.io/badge/Demo-Live-brightgreen?style=for-the-badge)](https://prograiv-saladejuegos.web.app)

---

## 👤 Autor

|              |                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------- |
| **Nombre**   | Santino Casado                                                                                    |
| **LinkedIn** | [linkedin.com/in/santino-casado-1841902aa](https://www.linkedin.com/in/santino-casado-1841902aa/) |
| **GitHub**   | [github.com/SantinoCasado](https://github.com/SantinoCasado)                                      |
| **Email**    | [santino.casado05@gmail.com](mailto:santino.casado05@gmail.com)                                   |

---

## Tecnologías

| Capa           | Tecnología                                  |
| -------------- | ------------------------------------------- |
| Frontend       | Angular 21 (standalone components, Signals) |
| Backend        | NestJS                                      |
| Base de datos  | MongoDB (Mongoose)                          |
| Almacenamiento | Supabase Storage                            |
| Autenticación  | JWT + bcrypt                                |
| Deploy         | Vercel (front y back por separado)          |
| Estilos        | CSS custom + Bootstrap + Bootstrap Icons    |

---

## 📸 Capturas de pantalla

### 🔐 Login

![Login](./SalaDeJuegos/src/assets/images/readme/login.png)

### 📝 Registro

![Registro](./SalaDeJuegos/src/assets/images/readme/registro.png)

### 🏠 Home o Publicaciones

![Home](./SalaDeJuegos/src/assets/images/readme/home.png)

### 💬 Acceder a Publicacion

![Chat](./SalaDeJuegos/src/assets/images/readme/chat.png)

### 👤 Mi perfil

![Quien Soy](./SalaDeJuegos/src/assets/images/readme/quien-soy.png)

### 📊 Estadisticas

![RankingPersonal](./SalaDeJuegos/src/assets/images/readme/estadisticas.png)
![RankingGeneral](./SalaDeJuegos/src/assets/images/readme/reanking.png)

### 🌍 Administracion de Usuarios

![Preguntados](./SalaDeJuegos/src/assets/images/readme/preguntados.png)

---

## ⚙️ Flujo de la aplicación

### 1. Inicio

El usuario entra a cualquier URL → redirige a `/cargando` (timer mínimo de 2 segundos).

- **Sin token** → redirige a `/log-in`
- **Con token** → llama a `POST /auth/autorizar`
  - Token válido → `/publicaciones`
  - Token inválido/expirado → limpia sesión → `/log-in`

### 2. Autenticación

- **Registro**: `POST /auth/registro` — guarda usuario con contraseña encriptada (bcrypt) e imagen en Supabase. Devuelve `{ token, usuario }`.
- **Login**: `POST /auth/login` — valida credenciales y estado del usuario. Devuelve `{ token, usuario, mensaje }`.
  - Si el usuario está deshabilitado → `400 Bad Request` con mensaje informativo.
- El token se guarda en `localStorage` como `aura_token`. Los datos del usuario como `aura_usuario`.

### 3. Sesión activa

- El **interceptor HTTP** agrega automáticamente `Authorization: Bearer <token>` a cada request.
- Si el back devuelve **401** → el interceptor limpia la sesión y redirige al login.
- Al iniciar sesión arranca un **contador**:
  - A los **1 minuto** (testeo) / **10 minutos** (producción) aparece un modal preguntando si extender la sesión.
  - Si el usuario acepta → `POST /auth/refrescar` → nuevo token → reinicia el contador.
  - El token vence a los **15 minutos** en el back.

### 4. Publicaciones

- Feed paginado (10 por página) con botón "Cargar más".
- Ordenamiento por **fecha** (default) o **likes**.
- Dar/quitar like actualiza la publicación localmente sin recargar.
- Crear publicación desde un modal con título, mensaje e imagen opcional.
- Eliminar publicación propia (o cualquiera si es admin) con modal de confirmación.
- Click en "Comentar" navega a `/publicaciones/:id`.

### 5. Publicación individual

- Muestra la publicación completa con imagen, likes y cantidad de comentarios.
- Comentarios paginados (5 por carga), más recientes primero.
- Botón "Cargar más" agrega comentarios sin reemplazar los anteriores.
- El autor de un comentario puede editarlo. Los comentarios editados muestran el indicador "editado".

### 6. Mi Perfil

- Muestra datos del usuario logueado (leídos del localStorage, sin llamada al back).
- Últimas 3 publicaciones del usuario con likes y fecha.

### 7. Administrador

El usuario con `perfil: "administrador"` tiene acceso a funcionalidades extra:

- **En publicaciones y publicación individual**: botón de eliminar visible en cualquier publicación (no solo las propias).
- **Dashboard/usuarios** (`/dashboard/usuarios`):
  - Listado de todos los usuarios.
  - Formulario de alta con radio buttons para elegir perfil (usuario/administrador).
  - Deshabilitar/habilitar usuarios con modal de confirmación.
  - Un usuario deshabilitado no puede iniciar sesión.
- **Dashboard/estadísticas** (`/dashboard/estadisticas`):
  - Filtro de fechas (desde/hasta).
  - Gráfico de barras: publicaciones por usuario.
  - Gráfico de líneas: comentarios en el tiempo.
  - Gráfico de torta: comentarios por publicación.

### 8. Cierre de sesión

- Botón "Salir" en navbar → limpia `aura_token` y `aura_usuario` del localStorage → redirige a `/log-in`.

---

## 🪢 Rutas

### Frontend

| Ruta                      | Guard                  | Descripción                    |
| ------------------------- | ---------------------- | ------------------------------ |
| `/cargando`               | —                      | Pantalla inicial, valida token |
| `/log-in`                 | GuestGuard             | Login                          |
| `/registro`               | GuestGuard             | Registro                       |
| `/publicaciones`          | AuthGuard              | Feed principal                 |
| `/publicaciones/:id`      | AuthGuard              | Publicación individual         |
| `/mi-perfil`              | AuthGuard              | Perfil del usuario logueado    |
| `/dashboard/usuarios`     | AuthGuard + AdminGuard | Gestión de usuarios            |
| `/dashboard/estadisticas` | AuthGuard + AdminGuard | Estadísticas                   |

### Backend

| Método | Ruta                                        | Guard | Descripción                |
| ------ | ------------------------------------------- | ----- | -------------------------- |
| POST   | `/auth/registro`                            | —     | Registro de usuario        |
| POST   | `/auth/login`                               | —     | Login                      |
| POST   | `/auth/autorizar`                           | —     | Valida token               |
| POST   | `/auth/refrescar`                           | —     | Refresca token             |
| GET    | `/publicaciones`                            | JWT   | Listar publicaciones       |
| POST   | `/publicaciones`                            | JWT   | Crear publicación          |
| GET    | `/publicaciones/:id`                        | JWT   | Obtener publicación por ID |
| DELETE | `/publicaciones/:id`                        | JWT   | Baja lógica                |
| POST   | `/publicaciones/:id/like`                   | JWT   | Dar like                   |
| DELETE | `/publicaciones/:id/like`                   | JWT   | Quitar like                |
| GET    | `/publicaciones/:id/comentarios`            | JWT   | Listar comentarios         |
| POST   | `/publicaciones/:id/comentarios`            | JWT   | Agregar comentario         |
| PUT    | `/publicaciones/:id/comentarios/:cid`       | JWT   | Editar comentario          |
| GET    | `/usuarios`                                 | Admin | Listar usuarios            |
| POST   | `/usuarios`                                 | Admin | Crear usuario              |
| DELETE | `/usuarios/:id`                             | Admin | Deshabilitar usuario       |
| POST   | `/usuarios/:id/habilitar`                   | Admin | Habilitar usuario          |
| GET    | `/estadisticas/publicaciones-por-usuario`   | Admin | Estadística 1              |
| GET    | `/estadisticas/comentarios-por-lapso`       | Admin | Estadística 2              |
| GET    | `/estadisticas/comentarios-por-publicacion` | Admin | Estadística 3              |

---

## 🔧 Pipes propias

| Pipe            | Uso                              | Ejemplo                      |
| --------------- | -------------------------------- | ---------------------------- |
| `fechaRelativa` | Convierte fecha a texto relativo | `hace 5 min`                 |
| `iniciales`     | Extrae iniciales de un usuario   | `SC`                         |
| `truncar`       | Corta texto largo con `...`      | `{{ titulo \| truncar:50 }}` |

---

## 🛡️ Directivas propias

| Directiva           | Elemento           | Comportamiento                                 |
| ------------------- | ------------------ | ---------------------------------------------- |
| `appImgFallback`    | `<img>`            | Oculta la imagen si falla al cargar            |
| `appHighlightAdmin` | Cualquier elemento | Resalta con glow si el perfil es administrador |
| `appAutoResize`     | `<textarea>`       | Crece automáticamente al escribir              |

---

## 📦 PWA

La aplicación es instalable como PWA. Al abrir en Chrome aparece el ícono de instalación en la barra de direcciones. Una vez instalada funciona como app de escritorio con ícono personalizado (luna azul).

---

## 🛡️ Validaciones destacadas

- Contraseña: mínimo 8 caracteres, una mayúscula y un número.
- Edad mínima: 15 años (validada en front y back).
- Fecha de nacimiento: no puede ser futura ni con año menor a 1900.
- Contraseñas coincidentes: validador a nivel formulario.
- Imágenes: solo JPG, PNG o WEBP.
- Unicidad de usuario y correo.

---

## 🧠 Conclusión

Desarrollar **Aura** fue uno de los proyectos más desafiantes y enriquecedores que me tocó encarar como estudiante. Arranqué el Sprint 1 con una base simple — pantallas estáticas, un registro y un login — y fui construyendo sprint a sprint hasta llegar a una aplicación fullstack completa con autenticación JWT, gestión de roles, estadísticas en tiempo real y soporte PWA.

### 👨‍💻 Dificultades encontradas

Una de las primeras dificultades fue entender cómo integrar **Supabase** con NestJS para el manejo de imágenes. No era simplemente subir un archivo — había que validar el tipo, generar paths únicos, obtener URLs públicas y manejar errores de red. Una vez resuelto ese patrón para las fotos de perfil, reutilizarlo para las imágenes de publicaciones fue mucho más natural.

El manejo del **JWT** también representó un desafío interesante. Implementar el flujo completo — generación, validación, refresco, interceptor HTTP y guards tanto en el front como en el back — requirió entender cómo se comunican las capas y dónde corresponde manejar cada responsabilidad.

Otro punto que me costó fue el **aggregate de MongoDB** para el ordenamiento por likes. El `populate` de Mongoose no funciona en pipelines de agregación, así que tuve que aprender a usar `$lookup` y `$unwind` manualmente para traer los datos del usuario junto con cada publicación.

En el frontend, adoptar **Signals** de Angular 21 fue un cambio de paradigma respecto a lo que conocía. Al principio tenía problemas con la detección de cambios — los avatares no cargaban, los estados se quedaban pegados — hasta que entendí cómo Angular trackea los cambios con signals y cuándo forzar actualizaciones.

### 🥇 Lo que más me enorgullece

Me enorgullece haber podido construir algo que funciona de punta a punta: desde que el usuario entra a la app y ve la pantalla de carga verificando su sesión, hasta que puede publicar, comentar, dar likes, y si es administrador gestionar usuarios y ver estadísticas en gráficos reales.

También me siento satisfecho con las decisiones de diseño que tomé: usar `findByIdAndUpdate` en lugar de `.save()` para evitar validaciones de Mongoose en documentos legacy, preservar el usuario populado localmente al dar likes para no hacer requests innecesarios, o usar `Promise.all` en la pantalla de cargando para respetar un timer mínimo mientras se valida el token en paralelo. Son detalles pequeños, pero hacen que la app se sienta profesional.

Por último, implementar las **pipes y directivas propias** de forma que realmente reemplazaran código duplicado — en lugar de ser features forzadas — fue algo que me dio mucha satisfacción. Ver `pub.createdAt | fechaRelativa` en el template en lugar de llamar a `formatearFechaRelativa()` en cada componente es exactamente el tipo de abstracción que hace que el código escale bien.

**Aura** me demostró que puedo construir una aplicación real desde cero, tomar decisiones técnicas fundamentadas y superar los obstáculos que aparecen en el camino. Estoy orgulloso del resultado.

---

## Autor

**Santino Casado** — Programación IV, UTN
