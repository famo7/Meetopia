<template>
  <SidebarProvider>
    <AppSidebar v-if="!isLiveMeeting" />
    <SidebarInset class="bg-background" :class="{ 'ml-0': isLiveMeeting }">
      <header v-if="!isLiveMeeting" class="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 bg-background/95 backdrop-blur-sm px-6">
        <SidebarTrigger class="-ml-1 h-8 w-8 data-[state=open]:bg-sidebar-accent/50" />
        <div class="flex-1" />
      </header>
      <main class="flex-1 overflow-auto bg-muted/30">
        <div class="container mx-auto px-6 py-6">
          <RouterView />
        </div>
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'

const route = useRoute()
const isLiveMeeting = computed(() => route.path.includes('/live'))
</script>
