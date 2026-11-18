<script setup lang="ts">
import { useUiStore } from '@/stores/ui'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'

/**
 * Layout compartido del Administrador
 * Criterio 1: Estructura general y Criterio 4: Router
 * Aplica la identidad visual en tonalidades azules (.theme-admin),
 * barra lateral azul oscuro con 4 opciones de administración,
 * barra superior clara con buscador y perfil, y área de contenido dinámico.
 */
const uiStore = useUiStore()
</script>

<template>
  <div class="layout-wrapper theme-admin">
    <!-- Backdrop móvil reactivo sincronizado con Pinia -->
    <div
      v-if="uiStore.isMobileSidebarOpen"
      class="sidebar-backdrop"
      @click="uiStore.closeSidebar"
    ></div>

    <!-- Barra Lateral Reutilizable configurada para Administrador -->
    <AppSidebar variant="admin" />

    <!-- Contenedor Principal -->
    <div class="hospital-main-wrapper">
      <!-- Barra Superior Reutilizable -->
      <AppTopbar />

      <!-- Área Principal con Contenido Dinámico de las Vistas del Administrador -->
      <main class="hospital-content">
        <router-view />
      </main>
    </div>
  </div>
</template>
