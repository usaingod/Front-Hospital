# Sistema de Gestión de Turnos Hospitalarios — Frontend

Frontend integral desarrollado con **Vue 3**, **TypeScript**, **Vite**, **Bootstrap 5** y **Pinia** para la administración hospitalaria, turnos, pacientes, especialidades, profesionales médicos y usuarios del sistema.

Este proyecto implementa tres perfiles visuales diferenciados dentro de la misma aplicación:
- **Secretaría (Tonalidades verdes):** orientada a la gestión operativa de turnos, pacientes y horarios semanales de atención médica.
- **Administrador (Tonalidades azules):** orientada a la gestión de especialidades, padrón de médicos y administración de usuarios del sistema.
- **Médico (Tonalidades amarillas/doradas):** orientada a la consulta de agenda diaria y turnos asignados, búsqueda de pacientes y visualización de historias clínicas.

Los tres perfiles se alternan dinámicamente mediante un **Selector visual de perfil** ubicado en la esquina inferior izquierda de la barra lateral, compartiendo componentes transversales y garantizando coherencia visual, código limpio y cumplimiento riguroso de los diez criterios académicos de evaluación.

---

## 1. Estructura General del Proyecto

La arquitectura del proyecto sigue una estricta separación de responsabilidades:

```text
FrontHospitall/
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
│   │       ├── AppSidebar.vue      # Menú lateral dinámico (Verde/Azul/Dorado) con selector de 3 perfiles
│   │       └── AppTopbar.vue       # Barra superior con buscador y perfil activo
│   ├── layouts/            # Layouts principales de la aplicación
│   │   ├── SecretariaLayout.vue    # Layout del panel de secretaría (tema verde)
│   │   ├── AdminLayout.vue         # Layout del panel de administración (tema azul)
│   │   └── MedicoLayout.vue        # Layout del panel del médico (tema amarillo/dorado)
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
│   │   ├── historiaClinica.ts      # Contratos para Historia Clínica y evoluciones
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
│   │   ├── admin/          # Módulo de Administrador (4 vistas)
│   │   │   ├── AdminHomeView.vue   # Panel de control, estadísticas y grilla de especialidades
│   │   │   ├── AdminDoctorsView.vue# Padrón general y datos de médicos
│   │   │   ├── SpecialtiesView.vue # Gestión de especialidades médicas
│   │   │   └── UsersView.vue       # Gestión de usuarios y asignación de roles
│   │   └── medico/         # Módulo de Médico (3 vistas)
│   │       ├── MedicoInicioView.vue    # Panel de inicio médico, calendario y turnos de hoy
│   │       ├── MedicoTurnosView.vue    # Agenda horaria (30 min), tabla y panel lateral de detalle
│   │       └── MedicoPacientesView.vue # Padrón, ficha de paciente e Historia Clínica
│   ├── App.vue             # Componente raíz con <router-view />
│   ├── env.d.ts            # Declaraciones globales de tipos y módulos Vue
│   └── main.ts             # Punto de entrada (Vue + Router + Pinia)
├── package.json            # Dependencias y scripts
├── tsconfig.app.json       # Configuración TS de la aplicación
├── tsconfig.json           # Configuración raíz de TypeScript (Project References)
└── vite.config.ts          # Configuración de Vite
```

---

## 2. Selector Visual de Perfil (Esquina Inferior Izquierda)

En la parte inferior izquierda de la barra lateral (`AppSidebar.vue`) se ubica el **Selector de Perfil**:

- **Visualización continua:** Muestra el perfil actualmente activo (avatar con icono representativo, nombre del perfil y subtítulo de rol) acompañado de un indicador visual desplegable (`bi-chevron-down`).
- **Menú interactivo desplegable:** Al hacer clic, despliega un menú flotante con los tres perfiles del sistema:
  1. **Secretaría:** Icono verde (`bi-calendar3`), descripción "Turnos, pacientes y horarios".
  2. **Administrador:** Icono azul (`bi-shield-check`), descripción "Especialidades, médicos y usuarios".
  3. **Médico:** Icono dorado/ámbar (`bi-stethoscope`), descripción "Mis turnos y pacientes".
  - Se destaca con una tilde (`bi-check2`) la opción actualmente en uso.
- **Navegación reactiva con Vue Router:**
  - Al seleccionar **Secretaría**, navega automáticamente a `/secretaria/inicio`.
  - Al seleccionar **Administrador**, navega automáticamente a `/admin/inicio`.
  - Al seleccionar **Médico**, navega automáticamente a `/medico/inicio`.
  - La navegación se efectúa mediante Vue Router sin recargar la aplicación.
- **Opción «Cerrar sesión»:** Permanece visible de forma clara justo debajo del selector.
- **Alcance académico:** Este mecanismo es puramente visual para la alternancia de interfaces en presentación y desarrollo; no implementa autenticación real ni seguridad de roles.

---

## 3. Vistas del Médico (Módulo Médico)

Las tres vistas del médico utilizan la identidad visual en tonalidades amarillas y doradas (`.theme-medico`), barra lateral mostaza/dorada con estrictamente 3 opciones y tarjetas adaptativas:

1. **`MedicoInicioView.vue` (`/medico/inicio`)**:
   - Título "Inicio" con cabecera descriptiva y badge de fecha actual del sistema.
   - Cuatro tarjetas de resumen estadístico: *Turnos de hoy*, *Turnos confirmados*, *Turnos pendientes*, *Turnos cancelados*, todas con guión neutral (`—`) según la regla de no inventar datos.
   - Accesos directos a: *Ver mis turnos* (`/medico/turnos`), *Buscar pacientes* (`/medico/pacientes`) y *Ver historia clínica* (`/medico/pacientes?tab=historia`).
   - Tabla de "Turnos de hoy" con columnas *Hora*, *Paciente*, *Especialidad*, *Estado* y *Acciones*, con estado vacío estandarizado (`EmptyState`).
   - Calendario mensual compacto con cálculo matemático real de días, navegación entre meses, botón "Hoy" e indicador de fecha seleccionada.
   - Tabla de "Próximos turnos" con columnas *Fecha*, *Hora*, *Paciente*, *Especialidad*, *Estado* y *Acciones*, con estado vacío.

2. **`MedicoTurnosView.vue` (`/medico/turnos`)**:
   - Título "Turnos" y controles de visualización por Día, Semana y Mes.
   - Selector de fecha con controles anterior/hoy/siguiente e input de fecha nativo.
   - Barra de filtros visuales por estado (*Confirmado*, *Pendiente*, *En atención*, *Atendido*, *Cancelado*) y por franja horaria (*Mañana*, *Tarde*, *Vespertino*), con botón para limpiar filtros.
   - Leyenda visual de estados con badges semánticos.
   - Grilla horaria del día con intervalos de 30 minutos (08:00 a 20:00) en estructura visual vacía lista para recibir citas.
   - Tabla detallada de turnos con columnas: *Hora*, *Paciente*, *Especialidad*, *Estado* y *Acciones*.
   - Panel lateral desplegable para consultar el detalle de un turno seleccionado (datos del paciente, fecha, hora, especialidad, estado y observaciones).
   - Alcance de consulta exclusivo: no permite asignación ni cancelación de turnos, respetando la regla del perfil profesional.

3. **`MedicoPacientesView.vue` (`/medico/pacientes`)**:
   - Estructura en dos columnas:
     - **Columna izquierda (Listado de pacientes):**
       - Campo de búsqueda por nombre, apellido o DNI.
       - Filtro visual por estado (Activos / Inactivos).
       - Tabla con columnas: *Paciente*, *DNI*, *Última atención* y *Acciones*.
       - Estado vacío discreto cuando no hay resultados.
     - **Columna derecha (Detalle del paciente e Historia Clínica):**
       - Estado inicial con mensaje "Seleccioná un paciente para consultar su información".
       - Al seleccionar un paciente, muestra cabecera con avatar, nombre, DNI, estado y cuatro pestañas:
         1. **Historia clínica:** estructura visual dividida en *Antecedentes clínicos*, *Consultas previas y diagnósticos* y *Tratamientos y recetas*, cada una con estado vacío informativo y aviso de futura integración backend.
         2. **Turnos:** historial de turnos asociados al paciente con estado vacío.
         3. **Datos personales:** ficha con nombre y apellido, DNI, fecha de nacimiento, obra social/prepaga y n° de afiliado, teléfono, email, dirección y contacto de emergencia.
         4. **Observaciones:** panel de notas clínicas y observaciones.
       - Sin formularios de carga clínica ni registros ficticios en esta etapa.

---

## 4. Vistas del Administrador (Módulo Admin)

Las cuatro vistas del administrador utilizan la identidad visual en tonalidades azules (`.theme-admin`), barra lateral azul oscuro y tarjetas adaptativas:

1. **`AdminHomeView.vue` (`/admin/inicio`)**: Panel de control, estadísticas con guion neutral, accesos directos y grilla adaptativa de especialidades.
2. **`SpecialtiesView.vue` (`/admin/especialidades`)**: Padrón de especialidades, filtros y modal de alta/edición.
3. **`AdminDoctorsView.vue` (`/admin/medicos`)**: Padrón general de profesionales médicos, filtros por especialidad y estado, y modal de alta/edición.
4. **`UsersView.vue` (`/admin/usuarios`)**: Gestión de cuentas de usuario, asignación de roles (Administrador / Secretaría) y modal interactivo.

---

## 5. Vistas de la Secretaría (Módulo Secretaría)

Las cuatro vistas de la secretaría mantienen su identidad en tonalidades verdes:

1. **`InicioView.vue` (`/secretaria/inicio`)**: Panel de control operativo del día con turnos y estadísticas en guión neutral, calendario mensual y cola de atención rápida.
2. **`TurnosView.vue` (`/secretaria/turnos`)**: Grilla horaria con intervalos de 30 minutos (08:00 a 20:00), alternancia de vistas y modal de asignación de turnos.
3. **`PacientesView.vue` (`/secretaria/pacientes`)**: Padrón general de pacientes, filtros por obra social y estado, y modal de alta/edición.
4. **`MedicosView.vue` (`/secretaria/medicos`)**: Directorio de médicos y configuración de agendas semanales de atención (días, franjas horarias y consultorios).

---

## 6. Componentes Reutilizables

Para evitar duplicación de código (Criterios 3 y 5), los tres perfiles comparten:

- **`AppSidebar.vue` (`src/components/layout/AppSidebar.vue`)**:
  - Detecta el rol activo y adapta su paleta (verde para secretaría, azul para administrador, dorado para médico).
  - Configura dinámicamente las opciones del menú (4 para secretaría, 4 para administrador, 3 para médico).
  - Aloja el Selector de Perfil con menú desplegable de 3 opciones y el botón de cierre de sesión en la parte inferior izquierda.
- **`AppTopbar.vue` (`src/components/layout/AppTopbar.vue`)**:
  - Barra superior sincronizada con el perfil activo, buscador dinámico y notificaciones.
- **`PageHeader.vue` (`src/components/common/PageHeader.vue`)**:
  - Título, subtítulo y ranura (`#actions` / `#default`) para botones de acción.
- **`StatCard.vue` (`src/components/common/StatCard.vue`)**:
  - Métricas e indicadores con colores semánticos (`green`, `blue`, `amber`, `rose`) y guion neutral por defecto.
- **`EmptyState.vue` (`src/components/common/EmptyState.vue`)**:
  - Estado vacío para tablas y paneles cuando no existen registros disponibles.
- **`BaseModal.vue` (`src/components/common/BaseModal.vue`)**:
  - Diálogo modal con backdrop accesible, botón de cierre y slots para cuerpo y pie.

---

## 7. Configuración de Vue Router

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
- **Rutas de Médico:**
  - `/medico/inicio` → `MedicoInicioView.vue`
  - `/medico/turnos` → `MedicoTurnosView.vue`
  - `/medico/pacientes` → `MedicoPacientesView.vue`
- **Redirecciones y sincronización:**
  - `/` → Redirección a `/secretaria/inicio`.
  - Rutas no coincidentes `/:pathMatch(.*)*` → Redirección segura a `/secretaria/inicio`.
  - Hook global `router.afterEach`: Sincroniza automáticamente el estado `currentRole` en Pinia tras cada navegación (`/admin` -> 'admin', `/medico` -> 'medico', `/secretaria` -> 'secretaria').

---

## 8. Gestión de Estado Global con Pinia

El store `ui.ts` (`src/stores/ui.ts`) centraliza el estado de interfaz necesario:
- `currentRole`: Rol activo (`'secretaria'`, `'admin'` o `'medico'`).
- `secretaryProfile`, `adminProfile` y `doctorProfile`: Datos visuales de representación institucional (nombre, rol y credenciales).
- `activeProfile`: Propiedad computada que devuelve el perfil activo en tiempo real.
- `isMobileSidebarOpen`: Apertura y cierre del menú móvil sincronizado entre Topbar y Sidebar.
- `setRole(role)` y `syncRoleWithRoute(path)`: Alternancia visual y sincronización de rutas.
- **Regla estricta:** No almacena datos ficticios ni actúa como base de datos simulada.

---

## 9. Capa de Servicios y Tipos para Futuras APIs

Cumpliendo con el **Criterio 7**, se estructuró la capa de servicios sin llamadas HTTP prematuras ni datos falsos:
- **`src/types/`**: `common.ts`, `especialidad.ts`, `historiaClinica.ts`, `medico.ts`, `paciente.ts`, `turno.ts`, `usuario.ts`.
- **`src/services/`**:
  - `especialidadesService.ts`: Métodos `getEspecialidades`, `createEspecialidad`, `updateEspecialidad`, `deleteEspecialidad`.
  - `usuariosService.ts`: Métodos `getUsuarios`, `createUsuario`, `updateUsuario`, `deleteUsuario`.
  - `medicosService.ts`: Métodos de padrón médico y horarios.
  - `pacientesService.ts` y `turnosService.ts`.

---

## 10. Instrucciones de Instalación y Ejecución

### Prerrequisitos
- **Node.js**: Versión `^22.18.0` o `>=24.12.0` (o LTS compatible).
- **npm**: Gestor de paquetes incluido con Node.js.

### Navegar al directorio del frontend
```bash
cd FrontHospitall
```

### Instalación de dependencias
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

## 11. Cumplimiento de los Criterios de Evaluación

| Criterio | Estado | Implementación |
| :--- | :---: | :--- |
| **1. Estructura general** | Cumplido | Separación en layouts (`AdminLayout`, `SecretariaLayout`, `MedicoLayout`), vistas por módulo (`secretaria`, `admin`, `medico`), componentes comunes y servicios. |
| **2. Directivas y templates** | Cumplido | Uso riguroso de `v-if`, `v-else`, `v-for`, `v-model`, `:class` y directivas en templates limpios sin datos inventados. |
| **3. Comunicación entre componentes** | Cumplido | Props tipadas en TypeScript, slots con nombre y eventos `emit`. |
| **4. Vue Router** | Cumplido | 11 rutas organizadas bajo `/secretaria`, `/admin` y `/medico` con layouts específicos y sincronización de navegación. |
| **5. Componentes reutilizables** | Cumplido | Componentes transversales (`BaseModal`, `StatCard`, `EmptyState`, `PageHeader`, `AppSidebar`, `AppTopbar`). |
| **6. Pinia** | Cumplido | Store `ui.ts` para alternancia de 3 perfiles visuales, perfil activo y menú móvil. Sin datos ficticios. |
| **7. Preparación de APIs** | Cumplido | Contratos TypeScript (`types/`) y servicios (`services/`) documentados para futura integración backend. |
| **8. UX y diseño visual** | Cumplido | Identidad visual diferenciada por colores (Verde Secretaría / Azul Administrador / Dorado Médico), responsive y estados vacíos estandarizados. |
| **9. Creatividad y funcionalidad** | Cumplido | Selector visual desplegable de 3 perfiles en la esquina inferior izquierda, alternancia de temas, calendario interactivo y panel lateral de detalle. |
| **10. Documentación** | Cumplido | Documentación completa y fidedigna en este archivo `README.md`. |
