<script setup lang="ts">
import { useUiStore } from '@/stores/ui'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'

/**
 * Layout compartido del Médico (Perfil Profesional)
 * Criterio 1: Estructura general y Criterio 4: Router
 * Aplica la identidad visual en tonalidades amarillas y doradas (.theme-medico),
 * barra lateral mostaza/dorada con 3 opciones de atención (Inicio, Turnos, Pacientes),
 * barra superior clara con buscador y perfil médico, y área de contenido dinámico.
 */
const uiStore = useUiStore()
</script>

<template>
  <div class="layout-wrapper theme-medico">
    <!-- Backdrop móvil reactivo sincronizado con Pinia -->
    <div
      v-if="uiStore.isMobileSidebarOpen"
      class="sidebar-backdrop"
      @click="uiStore.closeSidebar"
    ></div>

    <!-- Barra Lateral Reutilizable configurada para Médico -->
    <AppSidebar variant="medico" />

    <!-- Contenedor Principal -->
    <div class="hospital-main-wrapper">
      <!-- Barra Superior Reutilizable -->
      <AppTopbar />

      <!-- Área Principal con Contenido Dinámico de las Vistas del Médico -->
      <main class="hospital-content">
        <router-view />
      </main>
    </div>
  </div>
</template>
