<script setup lang="ts">
import { useUiStore } from '@/stores/ui'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'


const uiStore = useUiStore()
</script>

<template>
  <div class="layout-wrapper">

    <div
      v-if="uiStore.isMobileSidebarOpen"
      class="sidebar-backdrop"
      @click="uiStore.closeSidebar"
    ></div>


    <AppSidebar variant="secretaria" />


    <div class="hospital-main-wrapper">

      <AppTopbar />


      <main class="hospital-content">
        <router-view />
      </main>
    </div>
  </div>
</template>
