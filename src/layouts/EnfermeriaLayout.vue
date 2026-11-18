<script setup lang="ts">
import { useUiStore } from '@/stores/ui'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'

/**
 * Layout compartido de Enfermería
 * Criterio 1: Estructura general y Criterio 4: Router
 * Aplica la identidad visual en tonalidades rojas y bordó (.theme-enfermeria),
 * barra lateral con 3 opciones de internación (Inicio, Camas, Paciente),
 * barra superior clara con buscador y perfil de enfermería, y área de contenido dinámico.
 */
const uiStore = useUiStore()
</script>

<template>
  <div class="layout-wrapper theme-enfermeria">
    <!-- Backdrop móvil reactivo sincronizado con Pinia -->
    <div
      v-if="uiStore.isMobileSidebarOpen"
      class="sidebar-backdrop"
      @click="uiStore.closeSidebar"
    ></div>

    <!-- Barra Lateral Reutilizable configurada para Enfermería -->
    <AppSidebar variant="enfermeria" />

    <!-- Contenedor Principal -->
    <div class="hospital-main-wrapper">
      <!-- Barra Superior Reutilizable -->
      <AppTopbar />

      <!-- Área Principal con Contenido Dinámico de las Vistas de Enfermería -->
      <main class="hospital-content">
        <router-view />
      </main>
    </div>
  </div>
</template>
