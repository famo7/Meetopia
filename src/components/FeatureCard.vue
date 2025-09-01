<template>
  <div class="group cursor-pointer">
    <div class="flex items-start gap-4">
      <div class="flex-shrink-0">
        <component :is="icon" class="w-5 h-5 text-primary mt-1" />
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="text-lg font-semibold text-foreground mb-2">{{ title }}</h3>
        <p class="text-muted-foreground mb-6 leading-relaxed">
          {{ description }}
        </p>
        <div class="flex items-center text-primary text-sm font-semibold group-hover:text-primary/80 transition-colors">
          <span>{{ linkText }}</span>
          <MoveRight :size="14" :stroke-width="2" class="ml-2 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MoveRight } from 'lucide-vue-next'

interface Props {
  title: string
  description: string
  linkText?: string
  icon: any
}

withDefaults(defineProps<Props>(), {
  linkText: 'Learn more'
})
</script>

<style scoped></style>
