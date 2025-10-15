<script setup lang="ts">
import type { TooltipTriggerProps } from "radix-vue"
import { TooltipTrigger } from "radix-vue"

const props = defineProps<TooltipTriggerProps>()
</script>

<template>
  <TooltipTrigger
    data-slot="tooltip-trigger"
    v-bind="props"
  >
    <slot />
  </TooltipTrigger>
</template>
