<script setup lang="ts">
import { useUiStore } from '@/stores/ui'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'

/**
 * Layout compartido de la Secretaría
 * Criterio 1: Estructura general y Criterio 4: Router
 * Integra la barra lateral (Sidebar), la barra superior (Topbar) y el área de contenido dinámico.
 */
const uiStore = useUiStore()
</script>

<template>
  <div class="layout-wrapper">
    <!-- Backdrop móvil reactivo sincronizado con Pinia -->
    <div
      v-if="uiStore.isMobileSidebarOpen"
      class="sidebar-backdrop"
      @click="uiStore.closeSidebar"
    ></div>

    <!-- Barra Lateral Reutilizable configurada para Secretaría -->
    <AppSidebar variant="secretaria" />

    <!-- Contenedor Principal -->
    <div class="hospital-main-wrapper">
      <!-- Barra Superior Reutilizable -->
      <AppTopbar />

      <!-- Área Principal con Contenido Dinámico de las Vistas -->
      <main class="hospital-content">
        <router-view />
      </main>
    </div>
  </div>
</template>
