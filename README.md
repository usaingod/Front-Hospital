# Sistema de Gestión Hospitalaria — Front-Hospital

Frontend integral desarrollado con **Vue 3**, **TypeScript**, **Vite**, **Bootstrap 5** y **Pinia** para la gestión hospitalaria de turnos, pacientes, historias clínicas, internaciones, camas, signos vitales, prescripciones médicas, especialidades, profesionales y usuarios del sistema.

La aplicación implementa cuatro perfiles operativos con identidad visual y permisos específicos:
- **Secretaría (Tonalidades verdes):** orientada a la gestión operativa de turnos, recepción de pacientes, triaje, padrón de pacientes con estado de cuenta y saldos, agenda médica semanal e internaciones.
- **Administrador (Tonalidades azules):** orientada a la gestión de especialidades, padrón de profesionales médicos, administración de infraestructura hospitalaria (salas y camas) y gestión de cuentas de usuario con asignación de roles.
- **Médico (Tonalidades amarillas/doradas):** orientada a la consulta de agenda diaria y turnos asignados, evolución e historia clínica de pacientes ambulatorios e internados, y prescripción de medicamentos y suministros.
- **Enfermería (Tonalidades rojas/bordó):** orientada al control de internación, monitoreo de camas y pacientes internados, registro y seguimiento de signos vitales, y administración de dosis de medicación prescrita.

El sistema cuenta con autenticación real mediante tokens JWT, protección de rutas por roles con Vue Router y consumo centralizado de la API REST del backend hospitalario.

---

## 1. Tecnologías Utilizadas

- **Framework:** [Vue 3](https://vuejs.org/) (Composition API, `<script setup lang="ts">`)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) (modo estricto y tipado integral)
- **Herramienta de compilación:** [Vite](https://vitejs.dev/)
- **Enrutamiento:** [Vue Router 4](https://router.vuejs.org/) (HTML5 History Mode con navigation guards)
- **Gestor de estado:** [Pinia](https://pinia.vuejs.org/) (stores modulares de autenticación y UI)
- **Diseño y estilos:** [Bootstrap 5](https://getbootstrap.com/) y [Bootstrap Icons](https://icons.getbootstrap.com/) complementados con tokens y temas CSS personalizados (`src/assets/styles.css`)
- **Comunicación HTTP:** Fetch API nativa envuelta en un cliente HTTP tipado (`src/services/api.ts`) con gestión de tokens Bearer JWT y control de errores

---

## 2. Estructura y Organización del Frontend

```text
Front-Hospital/
├── public/                 # Archivos estáticos y favicon
├── src/
│   ├── assets/             # Estilos globales y tokens CSS por perfil (styles.css)
│   ├── components/         # Componentes reutilizables
│   │   ├── common/         # Componentes transversales
│   │   │   ├── BaseModal.vue       # Diálogo modal accesible con backdrop y slots
│   │   │   ├── EmptyState.vue      # Estado vacío para tablas y paneles
│   │   │   ├── PageHeader.vue      # Encabezado estandarizado de página
│   │   │   └── StatCard.vue        # Tarjeta de indicadores y métricas
│   │   └── layout/         # Componentes estructurales
│   │       ├── AppSidebar.vue      # Barra lateral dinámica con selector de perfil y navegación por rol
│   │       └── AppTopbar.vue       # Barra superior con buscador, estado y perfil del usuario
│   ├── composables/        # Lógica reutilizable basada en Composition API
│   │   └── usePacientesListado.ts  # Composable para carga, búsqueda y filtrado de pacientes
│   ├── layouts/            # Layouts principales según el rol activo
│   │   ├── AdminLayout.vue         # Layout del panel de administración (tema azul)
│   │   ├── EnfermeriaLayout.vue    # Layout del panel de enfermería (tema rojo/bordó)
│   │   ├── MedicoLayout.vue        # Layout del panel médico (tema amarillo/dorado)
│   │   └── SecretariaLayout.vue    # Layout del panel de secretaría (tema verde)
│   ├── router/             # Configuración de Vue Router y guardias de seguridad
│   │   └── index.ts
│   ├── services/           # Servicios de comunicación con los endpoints de la API REST
│   │   ├── api.ts                  # Cliente base HTTP, manejo de JWT y ApiError
│   │   ├── billingService.ts       # Consultas de facturación y cobros
│   │   ├── camasService.ts         # Gestión de camas, salas e internaciones
│   │   ├── especialidadesService.ts# ABM de especialidades médicas
│   │   ├── medicosService.ts       # Padrón médico y disponibilidad horaria
│   │   ├── pacientesService.ts     # Padrón de pacientes, alta/edición y cancelación de saldo
│   │   ├── prescripcionService.ts  # Prescripciones médicas, suministros y dosis
│   │   ├── protocolsService.ts     # Protocolos clínicos
│   │   ├── signosVitalesService.ts # Registro y consulta de signos vitales
│   │   ├── triageService.ts        # Registro y categorización Manchester de triaje
│   │   ├── turnosService.ts        # Turnos, agenda, lista de espera y cancelaciones
│   │   └── usuariosService.ts      # Gestión de usuarios del sistema y roles
│   ├── stores/             # Stores reactivos de Pinia
│   │   ├── auth.ts                 # Sesión de usuario, JWT, login, logout y bootstrap
│   │   └── ui.ts                   # Perfil activo, tema, menú móvil y notificaciones
│   ├── types/              # Definiciones e interfaces TypeScript
│   │   ├── api.ts                  # Tipos de respuesta cruda de la API
│   │   ├── common.ts               # Tipos genéricos y paginación
│   │   ├── especialidad.ts         # Entidad y DTO de especialidades
│   │   ├── historiaClinica.ts      # Entidades de historia clínica y evolución
│   │   ├── internacion.ts          # Camas, salas, alas e internaciones
│   │   ├── medico.ts               # Profesionales y horarios de atención
│   │   ├── paciente.ts             # Entidades de paciente y DTOs de creación/edición
│   │   ├── prescripcion.ts         # Prescripciones, medicamentos e indicaciones
│   │   ├── signosVitales.ts        # Mediciones de signos vitales
│   │   ├── turno.ts                # Turnos y filtros de agenda
│   │   └── usuario.ts              # Cuentas de usuario y roles
│   ├── utils/              # Funciones auxiliares
│   │   └── dateLocal.ts            # Manejo y formateo de fechas locales
│   ├── views/              # Vistas organizadas por módulo operativo
│   │   ├── admin/          # Módulo de Administración (5 vistas)
│   │   │   ├── AdminCamasView.vue      # Gestión de salas, alas y camas hospitalarias
│   │   │   ├── AdminDoctorsView.vue    # Padrón general y datos de médicos
│   │   │   ├── AdminHomeView.vue       # Panel de control, estadísticas y especialidades
│   │   │   ├── SpecialtiesView.vue     # Gestión de especialidades médicas
│   │   │   └── UsersView.vue           # Gestión de usuarios y asignación de roles
│   │   ├── enfermeria/     # Módulo de Enfermería (3 vistas)
│   │   │   ├── EnfermeriaCamasView.vue    # Grilla de camas, estado y asignación
│   │   │   ├── EnfermeriaInicioView.vue   # Panel de control y métricas de internación
│   │   │   └── EnfermeriaPacienteView.vue # Ficha del paciente, signos vitales y medicación
│   │   ├── medico/         # Módulo Médico (3 vistas)
│   │   │   ├── MedicoInicioView.vue    # Panel médico, turnos de hoy y calendario
│   │   │   ├── MedicoPacientesView.vue # Padrón de turnos/internación, HC y prescripciones
│   │   │   └── MedicoTurnosView.vue    # Agenda horaria, filtros y detalle de consulta
│   │   ├── secretaria/     # Módulo de Secretaría (6 vistas)
│   │   │   ├── InicioView.vue          # Panel operativo diario y recepción rápida
│   │   │   ├── InternacionView.vue     # Gestión de internaciones y asignación de camas
│   │   │   ├── MedicosView.vue         # Directorio médico y agendas semanales
│   │   │   ├── PacientesView.vue       # Padrón de pacientes, coberturas, saldos y pagos
│   │   │   ├── TriajeView.vue          # Clasificación y triaje Manchester de urgencias
│   │   │   └── TurnosView.vue          # Asignación y grilla horaria de turnos
│   │   └── LoginView.vue   # Formulario de inicio de sesión con JWT
│   ├── App.vue             # Componente raíz con `<router-view />`
│   ├── env.d.ts            # Declaraciones globales de tipos para componentes Vue
│   └── main.ts             # Punto de entrada de la aplicación
├── package.json            # Dependencias y scripts del proyecto
├── tsconfig.app.json       # Configuración TypeScript del código de aplicación
├── tsconfig.json           # Configuración raíz de TypeScript
├── tsconfig.node.json      # Configuración TypeScript para herramientas Node/Vite
└── vite.config.ts          # Configuración de empaquetado y proxy de desarrollo
```

---

## 3. Autenticación JWT y Protección de Rutas

El acceso al sistema está protegido por autenticación basada en JSON Web Tokens (JWT):

1. **Inicio de sesión (`/login`):**
   - El usuario ingresa sus credenciales (email y contraseña).
   - Se realiza la petición `POST /auth/login` contra el backend.
   - El token recibido se persiste en `localStorage` bajo la clave `accessToken`.
   - Se solicita de forma inmediata la información del usuario autenticado mediante `GET /users/me`.
   - La aplicación redirige automáticamente a la vista de inicio correspondiente al rol del usuario.

2. **Inicialización y persistencia de sesión (`bootstrap`):**
   - Al cargar o recargar cualquier página, el guard de navegación ejecuta `auth.bootstrap()`.
   - Si existe un token almacenado, valida la sesión contra `/users/me`. Si el token expiró o resulta inválido, se cierra la sesión limpiando el almacenamiento y redirigiendo a `/login`.

3. **Cierre de sesión:**
   - Limpia el token y los datos de sesión en Pinia y `localStorage`, redirigiendo al usuario a `/login`.

4. **Protección de rutas con Vue Router (`router.beforeEach`):**
   - Las rutas cuentan con metadatos de roles permitidos (`meta.roles`).
   - Las rutas públicas (`/login`) no requieren autenticación; si un usuario autenticado intenta acceder a `/login`, se lo redirige a la página principal de su rol.
   - Las rutas privadas requieren token válido. Si el usuario intenta acceder a una ruta sin autenticarse, es redirigido a `/login?redirect=...`.
   - Control de permisos: los usuarios con rol `admin` tienen permiso para navegar por todos los paneles. Los usuarios con roles `secretaria`, `profesional` (médico) o `enfermero` únicamente pueden acceder a sus respectivas áreas autorizadas.

---

## 4. Perfiles del Sistema y Funcionalidades

### 4.1. Perfil Secretaría (`.theme-secretaria`, Tonalidad Verde)
- **Inicio (`/secretaria/inicio`):** Resumen operativo del día, métricas en tiempo real, calendario mensual interactivo, turnos del día y panel de recepción rápida de pacientes.
- **Turnos (`/secretaria/turnos`):** Grilla horaria en intervalos de 30 minutos (08:00 a 20:00), alternancia entre vistas diaria, semanal y mensual, filtros por profesional y estado, y modal de asignación de turnos.
- **Triaje (`/secretaria/triaje`):** Registro de ingreso y clasificación de urgencias con el sistema Manchester (niveles de prioridad 1 a 5 con colores semánticos: rojo, naranja, amarillo, verde, azul), toma inicial de signos vitales y derivación a atención médica.
- **Pacientes (`/secretaria/pacientes`):** Padrón general de pacientes con filtros de búsqueda por nombre, apellido, DNI, estado y obra social. Modal de alta y edición con cálculo unificado de saldo pendiente (`appointmentBalance` + `supplyBalance`). Modal de ficha detallada con estado de cuenta y diálogo de confirmación para liquidar el saldo total mediante `POST /patients/:id/pay`.
- **Médicos (`/secretaria/medicos`):** Directorio de profesionales médicos y configuración de agendas semanales de atención (días, franjas horarias y consultorios).
- **Internación (`/secretaria/internacion`):** Gestión del estado de camas e internaciones hospitalarias, visualización de camas disponibles/ocupadas/en limpieza, y modal de asignación de cama e ingreso de pacientes internados.

### 4.2. Perfil Administrador (`.theme-admin`, Tonalidad Azul)
- **Inicio (`/admin/inicio`):** Panel de control general con estadísticas globales del hospital, accesos rápidos a módulos y grilla de especialidades disponibles.
- **Especialidades (`/admin/especialidades`):** Catálogo de especialidades médicas con filtros por estado, modal de alta, edición y baja lógica.
- **Médicos (`/admin/medicos`):** Padrón general del cuerpo médico, asignación de especialidades, matrícula profesional, información de contacto y modal de alta/edición.
- **Camas (`/admin/camas`):** Administración de infraestructura hospitalaria, configuración de salas y alas, alta y edición de camas con generación automática de numeración y control de estado (disponible, ocupada, mantenimiento).
- **Usuarios (`/admin/usuarios`):** Gestión de cuentas de acceso al sistema, asignación de roles (`admin`, `secretaria`, `profesional`, `enfermero`), control de activación y modal de creación/edición de credenciales.

### 4.3. Perfil Médico (`.theme-medico`, Tonalidad Amarilla/Dorada)
- **Inicio (`/medico/inicio`):** Panel clínico del profesional con resumen de turnos de hoy, accesos directos, calendario mensual con cálculo exacto de días y lista de turnos programados.
- **Turnos (`/medico/turnos`):** Agenda de citas asignadas al médico, selector de fecha con controles anterior/hoy/siguiente, filtros por estado (*Confirmado*, *Pendiente*, *En atención*, *Atendido*, *Cancelado*) y franja horaria, y panel lateral con detalle del paciente, observaciones y diagnóstico.
- **Pacientes e Historia Clínica (`/medico/pacientes`):**
  - **Padrón de Turnos:** Búsqueda rápida por nombre, apellido o DNI y filtro por estado. Panel lateral con cuatro pestañas: Historia clínica (antecedentes clínicos, consultas previas y diagnósticos), Historial de turnos, Datos personales completos y Observaciones.
  - **Padrón de Internación:** Listado de pacientes internados organizados por sala y cama, con visualización de antecedentes, evolución clínica y modal de nueva prescripción médica (suministro/medicamento, dosis e intervalo horario).

### 4.4. Perfil Enfermería (`.theme-enfermeria`, Tonalidad Roja/Bordó)
- **Inicio (`/enfermeria/inicio`):** Panel de monitoreo de internación con indicadores de camas ocupadas, medicaciones pendientes del turno, alertas clínicas y pacientes a cargo.
- **Camas (`/enfermeria/camas`):** Mapa interactivo de camas hospitalarias organizadas por sala y ala, estado visual de ocupación, último registro de signos vitales del paciente asignado, acciones de alta y transición a limpieza.
- **Ficha del Paciente (`/enfermeria/paciente`):** Visualización del paciente seleccionado, registro y evolución histórica de signos vitales (presión arterial sistólica/diastólica, frecuencia cardíaca, temperatura corporal, saturación de oxígeno y frecuencia respiratoria) y control de administración de medicamentos con confirmación de dosis administrada.

---

## 5. Composables Implementados

### `usePacientesListado` (`src/composables/usePacientesListado.ts`)

Composable desarrollado para encapsular y reutilizar la lógica de carga, estado y filtrado del padrón de pacientes, siguiendo las buenas prácticas de Vue 3 Composition API:

- **Estado centralizado:**
  - `pacientes`: referencia reactiva con el listado completo de pacientes obtenido de la API.
  - `loading`: indicador booleano de estado de carga mientras se realiza la consulta.
  - `error`: mensaje de error ante fallos de conexión o respuestas no satisfactorias de la API.
  - `searchQuery`: modelo reactivo para la búsqueda por texto (nombre, apellido, DNI o teléfono).
  - `filterEstado`: modelo reactivo para el filtrado por estado del paciente (`activo` / `inactivo`).
- **Lista computada:**
  - `pacientesFiltrados`: propiedad computada que aplica de forma reactiva los criterios de búsqueda y filtro sobre la colección de pacientes.
- **Acciones:**
  - `loadPacientes()`: función asíncrona para obtener o recargar la lista de pacientes desde `pacientesService.getPacientes()`.
  - `resetFiltros()`: restablece los filtros de búsqueda y estado a sus valores por defecto.

#### Integración en las vistas:
1. **Secretaría (`src/views/secretaria/PacientesView.vue`):**
   Utiliza el composable para la obtención de datos, indicadores de carga y filtrado base por texto y estado. Sobre dicha lista computada, la vista aplica su filtro específico de obra social (`filterObraSocial`) y mantiene las funcionalidades de alta/edición de pacientes, visualización del estado de cuenta y cancelación de saldos pendientes.
2. **Médico (`src/views/medico/MedicoPacientesView.vue`):**
   Utiliza el composable para gestionar el padrón de pacientes de turnos (`pacientesTurnos`), su búsqueda reactiva y filtro por estado, coordinando la carga con los datos de internación y medicamentos, y preservando intactas las funcionalidades clínicas de internación, historia clínica y prescripciones.

Cada vista instancia su propio composable, garantizando un estado reactivo completamente aislado e independiente.

---

## 6. Componentes Reutilizables

El proyecto implementa componentes transversales que garantizan coherencia visual y eliminan la duplicación de código:

- **`AppSidebar.vue` (`src/components/layout/AppSidebar.vue`):**
  Barra lateral que adapta su paleta y opciones de navegación según el rol activo. Integra el selector interactivo de perfiles con control de permisos de acceso y el botón de cierre de sesión.
- **`AppTopbar.vue` (`src/components/layout/AppTopbar.vue`):**
  Barra superior que sincroniza el perfil visual, buscador de acciones rápidas, notificaciones y disparador del menú en dispositivos móviles.
- **`PageHeader.vue` (`src/components/common/PageHeader.vue`):**
  Encabezado uniforme para cada vista con título, subtítulo explicativo y slot para botones de acción.
- **`StatCard.vue` (`src/components/common/StatCard.vue`):**
  Tarjeta métrica para indicadores numéricos con variantes de color semántico (`green`, `blue`, `amber`, `rose`).
- **`EmptyState.vue` (`src/components/common/EmptyState.vue`):**
  Componente visual para indicar ausencia de registros en tablas, listas o paneles de detalle, con soporte para icono, título, mensaje y acción.
- **`BaseModal.vue` (`src/components/common/BaseModal.vue`):**
  Diálogo modal accesible con backdrop oscuro, cierre mediante botón o tecla Escape, y slots personalizables (`#title`, `#body`, `#footer`).

---

## 7. Gestión de Estado Global con Pinia

La aplicación utiliza dos stores de Pinia con Composition API:

### 7.1. Store de Autenticación (`src/stores/auth.ts`)
- Centraliza el token JWT y los datos del usuario en sesión (`AuthSessionUser`).
- Propiedades computadas: `isAuthenticated` y `uiRole` (mapea roles del backend a roles de interfaz: `profesional` → `medico`, `enfermero` → `enfermeria`).
- Métodos:
  - `login(email, password)`: ejecuta el inicio de sesión y almacena el token.
  - `fetchMe()`: recupera los datos del usuario autenticado desde `/users/me`.
  - `logout()`: elimina el token de `localStorage` y limpia el estado.
  - `bootstrap()`: revalida el token al iniciar o refrescar la aplicación.

### 7.2. Store de UI y Navegación (`src/stores/ui.ts`)
- `currentRole`: rol visual activo (`'secretaria'`, `'admin'`, `'medico'`, `'enfermeria'`).
- `activeProfile`: computada con los datos de representación institucional del perfil activo (nombre, rol y centro hospitalario).
- `isMobileSidebarOpen`: controla la visibilidad del menú lateral en pantallas móviles.
- Métodos `toggleSidebar()`, `closeSidebar()`, `openSidebar()`, `setRole(role)` y `syncRoleWithRoute(path)`.

---

## 8. Capa de Servicios y Comunicación con la API

Las solicitudes HTTP se gestionan a través de `src/services/api.ts`, que provee los métodos `api.get`, `api.post`, `api.patch` y `api.delete`. Este módulo añade automáticamente la cabecera `Authorization: Bearer <token>` cuando el usuario se encuentra autenticado y redirige a `/login` si el backend responde con un error 401.

Los servicios especializados consumen los endpoints de la API REST:
- **`usuariosService.ts`:** `/users` (listado, creación, edición y baja de usuarios).
- **`especialidadesService.ts`:** `/specialties` (listado, creación, actualización y baja de especialidades).
- **`medicosService.ts`:** `/professionals` y `/availability` (gestión del padrón médico y horarios de atención).
- **`pacientesService.ts`:** `/patients` (listado con filtros, detalle por ID, creación, actualización y cancelación de saldo en `/patients/:id/pay`).
- **`turnosService.ts`:** `/appointments` y `/appointments/waitlist` (agenda de citas, estados, turnos del día y lista de espera).
- **`camasService.ts`:** `/beds`, `/beds/:id/status`, `/admissions` y `/admissions/:id/discharge` (gestión de camas, salas e internaciones).
- **`triageService.ts`:** `/triage` (clasificación y niveles de urgencia de pacientes).
- **`signosVitalesService.ts`:** `/patients/:id/vitals` y `/admissions/:id/vitals` (registro histórico de signos vitales).
- **`prescripcionService.ts`:** `/patients/:id/prescriptions`, `/supplies` y `/admissions/:id/doses` (indicaciones médicas, catálogo de medicamentos y suministro de dosis).
- **`billingService.ts`:** `/appointments/:id/charges` y `/admissions/:id/account` (resumen de cuenta y facturación).
- **`protocolsService.ts`:** `/protocols` (protocolos clínicos hospitalarios).

---

## 9. Instalación y Ejecución

### Prerrequisitos
- **Node.js:** Versión `^22.18.0` o `>=24.12.0` (o versión LTS compatible).
- **npm:** Gestor de paquetes incluido con la instalación de Node.js.

### 1. Clonar el repositorio y acceder a la carpeta del frontend
```bash
cd Front-Hospital
```

### 2. Configuración de variables de entorno
Crear un archivo `.env` en la raíz del proyecto basándose en `.env.example`:

```env
# URL base para la comunicación con el backend (por defecto /api/v1 mediante proxy)
VITE_API_BASE_URL=/api/v1

# Destino del proxy de desarrollo de Vite para redirigir peticiones al backend
VITE_API_PROXY_TARGET=http://localhost:3001
```

### 3. Instalación de dependencias
```bash
npm install
```

### 4. Ejecución en entorno de desarrollo
```bash
npm run dev
```
La aplicación estará disponible de forma predeterminada en `http://localhost:5173/`.

### 5. Verificación de tipos TypeScript
```bash
npm run type-check
```

### 6. Compilación para producción
```bash
npm run build
```
Genera la compilación optimizada en la carpeta `dist/` verificando tipos y assets.

### 7. Vista previa de la compilación de producción
```bash
npm run preview
```
Inicia un servidor local para previsualizar los archivos generados en `dist/`.
