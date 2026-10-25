# Sistema de Gestión de Turnos Hospitalarios — Frontend

Frontend integral desarrollado con **Vue 3**, **TypeScript**, **Vite**, **Bootstrap 5** y **Pinia** para la administración hospitalaria, turnos, pacientes, especialidades, profesionales médicos y usuarios del sistema.

Este proyecto implementa dos perfiles visuales diferenciados dentro de la misma aplicación:
- **Secretaría (Tonalidades verdes):** orientada a la gestión operativa de turnos, pacientes y horarios semanales de atención médica.
- **Administrador (Tonalidades azules):** orientada a la gestión de especialidades, padrón de médicos y administración de usuarios del sistema.

Ambos perfiles se alternan dinámicamente mediante un **Selector visual de perfil** ubicado en la esquina inferior izquierda de la barra lateral, compartiendo componentes transversales y garantizando coherencia visual, código limpio y cumplimiento riguroso de los diez criterios académicos de evaluación.

---

## 1. Estructura General del Proyecto

La arquitectura del proyecto sigue una estricta separación de responsabilidades:

```text
FrontEndTurnosHospi/
├── public/                 # Archivos estáticos
├── src/
│   ├── assets/             # Estilos globales y tokens CSS (styles.css)
│   ├── components/         # Componentes reutilizables
│   │   ├── common/         # Componentes transversales
│   │   │   ├── BaseModal.vue       # Diálogo modal accesible con backdrop y slots
│   │   │   ├── EmptyState.vue      # Estado vacío para tablas y paneles
│   │   │   ├── PageHeader.vue      # Encabezado estandarizado de página
│   │   │   └── StatCard.vue        # Tarjeta de indicadores y métricas
│   │   └── layout/         # Componentes estructurales
│   │       ├── AppSidebar.vue      # Menú lateral dinámico (Verde/Azul) con selector de perfil
│   │       └── AppTopbar.vue       # Barra superior con buscador y perfil activo
│   ├── layouts/            # Layouts principales de la aplicación
│   │   ├── SecretariaLayout.vue    # Layout del panel de secretaría (tema verde)
│   │   └── AdminLayout.vue         # Layout del panel de administración (tema azul)
│   ├── router/             # Configuración de rutas (Vue Router)
│   │   └── index.ts
│   ├── services/           # Capa de servicios preparada para futuras APIs
│   │   ├── especialidadesService.ts
│   │   ├── medicosService.ts
│   │   ├── pacientesService.ts
│   │   ├── turnosService.ts
│   │   └── usuariosService.ts
│   ├── stores/             # Estado global reactivo con Pinia
│   │   └── ui.ts                   # Store de UI, perfil activo y navegación
│   ├── types/              # Definiciones e interfaces de TypeScript
│   │   ├── common.ts
│   │   ├── especialidad.ts
│   │   ├── medico.ts
│   │   ├── paciente.ts
│   │   ├── turno.ts
│   │   └── usuario.ts
│   ├── views/              # Vistas principales del sistema
│   │   ├── secretaria/     # Módulo de Secretaría (4 vistas)
│   │   │   ├── InicioView.vue      # Panel de control y turnos del día
│   │   │   ├── MedicosView.vue     # Cuerpo médico y horarios de atención
│   │   │   ├── PacientesView.vue   # Padrón de pacientes y coberturas
│   │   │   └── TurnosView.vue      # Grilla de horarios y asignación de citas
│   │   └── admin/          # Módulo de Administrador (4 vistas)
│   │       ├── AdminHomeView.vue   # Panel de control, estadísticas y grilla de especialidades
│   │       ├── AdminDoctorsView.vue# Padrón general y datos de médicos
│   │       ├── SpecialtiesView.vue # Gestión de especialidades médicas
│   │       └── UsersView.vue       # Gestión de usuarios y asignación de roles
│   ├── App.vue             # Componente raíz con <router-view />
│   └── main.ts             # Punto de entrada (Vue + Router + Pinia)
├── package.json            # Dependencias y scripts
├── tsconfig.json           # Configuración de TypeScript
└── vite.config.ts          # Configuración de Vite
```

---

## 2. Selector Visual de Perfil (Esquina Inferior Izquierda)

En la parte inferior izquierda de la barra lateral (Sidebar) se ubica el **Selector de Perfil**:

- **Visualización continua:** Muestra el perfil actualmente activo (avatar con icono representativo, nombre del perfil y subtítulo de rol) acompañado de un indicador visual desplegable (`bi-chevron-down`).
- **Menú interactivo desplegable:** Al hacer clic, se abre un menú flotante con las dos opciones disponibles:
  1. **Secretaría:** Identificada con icono verde (`bi-calendar3`) y descripción "Turnos, pacientes y horarios".
  2. **Administrador:** Identificada con icono azul (`bi-shield-check`) y descripción "Especialidades, médicos y usuarios".
  - Se destaca con una tilde (`bi-check2`) la opción actualmente en uso.
- **Navegación reactiva con Vue Router:**
  - Al seleccionar **Secretaría**, navega automáticamente a `/secretaria/inicio`.
  - Al seleccionar **Administrador**, navega automáticamente a `/admin/inicio`.
  - La navegación se efectúa mediante Vue Router sin recargar la página.
- **Opción «Cerrar sesión»:** Permanece visible de forma clara justo debajo del selector.
- **Alcance académico:** Este mecanismo es puramente visual para la alternancia de interfaces en presentación y desarrollo; no implementa autenticación real ni seguridad de roles.

---

## 3. Vistas del Administrador (Módulo Admin)

Las cuatro vistas del administrador utilizan la identidad visual en tonalidades azules (`.theme-admin`), barra lateral azul oscuro y tarjetas adaptativas:

1. **`AdminHomeView.vue` (`/admin/inicio`)**:
   - Título "Inicio" con cabecera descriptiva.
   - Cuatro tarjetas estadísticas: *Especialidades*, *Médicos Registrados*, *Médicos Activos*, *Médicos Inactivos*, todas con guión neutral (`—`) según la regla de no inventar datos.
   - Accesos directos a las áreas de gestión.
   - Sección "Especialidades y Médicos" con buscador visual.
   - Grilla adaptativa preparada para mostrar tarjetas de especialidades, cada una con botón de expandir/contraer y una tabla interna con columnas para *Nombre*, *Matrícula* y *Estado*.
   - Estado vacío estandarizado (`EmptyState`) mientras los registros provengan del backend.

2. **`SpecialtiesView.vue` (`/admin/especialidades`)**:
   - Título "Gestión de Especialidades".
   - Botón de acción "Nueva especialidad".
   - Tarjetas estadísticas (*Total Especialidades*, *Especialidades Activas*, *Médicos Asignados*) con guión neutral.
   - Barra de filtros con búsqueda por texto y selector por estado (Activas / Inactivas).
   - Tabla con columnas: *Nombre*, *Descripción*, *Cantidad de médicos*, *Estado* y *Acciones*.
   - Acciones visuales por fila: Consultar (ver detalle), Editar y Eliminar.
   - Modal interactivo (`BaseModal`) con formulario de campos vacíos y placeholders descriptivos: nombre, descripción, icono representativo y estado.

3. **`AdminDoctorsView.vue` (`/admin/medicos`)**:
   - Título "Gestión de Médicos".
   - Botón de acción "Nuevo médico".
   - Tarjetas estadísticas (*Total Médicos*, *Médicos Activos*, *En Licencia / Inactivos*) con guión neutral.
   - Barra de filtros con búsqueda, selector por especialidad y selector por estado profesional (Activo / Licencia / Inactivo).
   - Tabla con columnas: *Médico*, *Especialidad*, *Matrícula*, *Contacto*, *Consultorio* y *Acciones*.
   - Acciones visuales por fila: Consultar (ficha técnica), Editar y Eliminar.
   - Modal interactivo con formulario de alta/edición de datos generales del médico: nombre, apellido, especialidad, matrícula profesional, teléfono, email, dirección del consultorio, observaciones y estado.
   - **Nota de diseño:** No duplica la configuración de horarios de atención (esta permanece en la vista de Médicos de la secretaría).

4. **`UsersView.vue` (`/admin/usuarios`)**:
   - Título "Gestión de Usuarios".
   - Botón de acción "Nuevo usuario".
   - Tarjetas estadísticas (*Total Usuarios*, *Administradores*, *Secretaría*, *Usuarios Activos*) con guión neutral.
   - Barra de filtros con búsqueda, selector por rol (Administrador / Secretaría) y selector por estado (Activo / Inactivo).
   - Tabla con columnas: *Usuario*, *Email*, *Rol*, *Estado* y *Acciones*.
   - Acciones visuales por fila: Consultar, Editar y Eliminar.
   - Modal interactivo con formulario: nombre, apellido, email institucional, rol asignado, estado de cuenta, contraseña (con `type="password"` y botón de alternar visibilidad) y confirmación de contraseña.

---

## 4. Vistas de la Secretaría (Módulo Secretaría)

Las cuatro vistas de la secretaría mantienen su identidad en tonalidades verdes:

1. **`InicioView.vue` (`/secretaria/inicio`)**:
   - Panel de control operativo del día con turnos y estadísticas en guión neutral.
   - Calendario mensual interactivo y cola de atención rápida.
2. **`TurnosView.vue` (`/secretaria/turnos`)**:
   - Grilla horaria con intervalos de 30 minutos (08:00 a 20:00), alternancia de vistas (Día, Semana, Mes) y modal de asignación de turnos.
3. **`PacientesView.vue` (`/secretaria/pacientes`)**:
   - Padrón centralizado de pacientes, filtros por obra social y estado, y modal de alta/edición.
4. **`MedicosView.vue` (`/secretaria/medicos`)**:
   - Directorio de médicos y configuración de agendas semanales de atención (días, franjas horarias, modalidad y consultorio).

---

## 5. Componentes Reutilizables

Para evitar duplicación de código (Criterios 3 y 5), ambos perfiles comparten:

- **`AppSidebar.vue` (`src/components/layout/AppSidebar.vue`)**:
  - Detecta el rol activo y adapta la paleta (verde para secretaría, azul para administrador).
  - Configura dinámicamente las 4 opciones de cada menú.
  - Aloja el Selector de Perfil y el botón de cierre de sesión en la parte inferior izquierda.
- **`AppTopbar.vue` (`src/components/layout/AppTopbar.vue`)**:
  - Barra superior sincronizada con el perfil activo, buscador y notificaciones.
- **`PageHeader.vue` (`src/components/common/PageHeader.vue`)**:
  - Título, subtítulo y ranura (`#actions`) para botones de acción.
- **`StatCard.vue` (`src/components/common/StatCard.vue`)**:
  - Métricas e indicadores con colores semánticos (`green`, `blue`, `amber`, `rose`).
- **`EmptyState.vue` (`src/components/common/EmptyState.vue`)**:
  - Estado vacío para tablas y paneles cuando no existen registros.
- **`BaseModal.vue` (`src/components/common/BaseModal.vue`)**:
  - Diálogo modal con backdrop accesible, botón de cierre y slots para cuerpo y pie.

---

## 6. Configuración de Vue Router

La navegación se gestiona mediante **Vue Router 4** con modo de historial HTML5 (`createWebHistory`):

- **Rutas de Secretaría:**
  - `/secretaria/inicio` → `InicioView.vue`
  - `/secretaria/turnos` → `TurnosView.vue`
  - `/secretaria/pacientes` → `PacientesView.vue`
  - `/secretaria/medicos` → `MedicosView.vue`
- **Rutas de Administrador:**
  - `/admin/inicio` → `AdminHomeView.vue`
  - `/admin/especialidades` → `SpecialtiesView.vue`
  - `/admin/medicos` → `AdminDoctorsView.vue`
  - `/admin/usuarios` → `UsersView.vue`
- **Redirecciones y sincronización:**
  - `/` → Redirección a `/secretaria/inicio`.
  - Rutas no coincidentes `/:pathMatch(.*)*` → Redirección segura a `/secretaria/inicio`.
  - Hook global `router.afterEach`: Sincroniza automáticamente el estado `currentRole` en Pinia tras cada navegación.

---

## 7. Gestión de Estado Global con Pinia

El store `ui.ts` (`src/stores/ui.ts`) centraliza el estado de interfaz necesario:
- `currentRole`: Rol activo (`'secretaria'` o `'admin'`).
- `secretaryProfile` y `adminProfile`: Datos visuales de representación (nombre, subtítulo y credenciales institucionales).
- `activeProfile`: Propiedad computada que devuelve el perfil activo en tiempo real.
- `isMobileSidebarOpen`: Apertura y cierre del menú móvil sincronizado entre Topbar y Sidebar.
- `setRole(role)` y `syncRoleWithRoute(path)`: Alternancia visual y sincronización de rutas.
- **Regla estricta:** No almacena datos ficticios ni actúa como base de datos simulada.

---

## 8. Capa de Servicios y Tipos para Futuras APIs

Cumpliendo con el **Criterio 7**, se estructuró la capa de servicios sin llamadas HTTP prematuras ni datos falsos:
- **`src/types/`**: `common.ts`, `especialidad.ts`, `medico.ts`, `paciente.ts`, `turno.ts`, `usuario.ts`.
- **`src/services/`**:
  - `especialidadesService.ts`: Métodos `getEspecialidades`, `createEspecialidad`, `updateEspecialidad`, `deleteEspecialidad`.
  - `usuariosService.ts`: Métodos `getUsuarios`, `createUsuario`, `updateUsuario`, `deleteUsuario`.
  - `medicosService.ts`: Métodos de padrón médico y horarios.
  - `pacientesService.ts` y `turnosService.ts`.

---

## 9. Instrucciones de Instalación y Ejecución

### Prerrequisitos
- **Node.js**: Versión `^22.18.0` o `>=24.12.0` (o LTS compatible).
- **npm**: Gestor de paquetes incluido con Node.js.

### Instalación
```bash
npm install
```

### Ejecución en desarrollo
```bash
npm run dev
```
La aplicación iniciará en `http://localhost:5173/`.

### Verificación de tipos TypeScript
```bash
npm run type-check
```

### Compilación para producción
```bash
npm run build
```

---

## 10. Cumplimiento de los Criterios de Evaluación

| Criterio | Estado | Implementación |
| :--- | :---: | :--- |
| **1. Estructura general** | Cumplido | Separación en layouts (`AdminLayout`, `SecretariaLayout`), vistas por módulo, componentes y servicios. |
| **2. Directivas y templates** | Cumplido | Uso riguroso de `v-if`, `v-else`, `v-for`, `v-model`, `:class` y directivas en templates limpios. |
| **3. Comunicación entre componentes** | Cumplido | Props tipadas en TypeScript, slots con nombre y eventos `emit`. |
| **4. Vue Router** | Cumplido | 8 rutas organizadas bajo `/secretaria` y `/admin` con layouts específicos y sincronización de navegación. |
| **5. Componentes reutilizables** | Cumplido | Componentes transversales (`BaseModal`, `StatCard`, `EmptyState`, `PageHeader`, `AppSidebar`, `AppTopbar`). |
| **6. Pinia** | Cumplido | Store `ui.ts` para alternancia de perfiles, perfil activo y menú móvil. Sin datos ficticios. |
| **7. Preparación de APIs** | Cumplido | Contratos TypeScript (`types/`) y servicios (`services/`) documentados para futura integración backend. |
| **8. UX y diseño visual** | Cumplido | Identidad diferenciada (Verde Secretaría / Azul Administrador), responsive y estados vacíos estandarizados. |
| **9. Creatividad y funcionalidad** | Cumplido | Selector visual desplegable de perfil en la esquina inferior izquierda, alternancia de temas y modales dinámicos. |
| **10. Documentación** | Cumplido | Documentación completa y fidedigna en este archivo `README.md`. |
