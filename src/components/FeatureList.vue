<template>
  <section class="py-24 sm:py-32 bg-muted/30">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-6xl mx-auto">
        <!-- Section Header -->
        <div class="text-center mb-16">
          <p class="text-sm font-semibold text-primary tracking-wide uppercase mb-4">Features</p>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Meet smarter, not harder
          </h2>
          <p class="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transform your meetings into actionable outcomes with tools that actually work.
          </p>
        </div>

        <!-- Features Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard v-for="feature in features" :key="feature.title" :title="feature.title"
            :description="feature.description" :link-text="feature.linkText" :icon="feature.icon" />
        </div>

      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import FeatureCard from './FeatureCard.vue'
import {
  Users,
  CheckSquare,
  Share2
} from 'lucide-vue-next'

// Example features data
const features = [

  {
    title: 'Collaborate in real-time',
    description: 'Edit notes together instantly. See changes as they happen and never lose your thoughts.',
    linkText: 'See how it works',
    icon: Users
  },
  {
    title: 'Track what matters',
    description: 'Turn discussions into clear action items. Assign owners, set deadlines, and follow through.',
    linkText: 'Start organizing',
    icon: CheckSquare
  },
  {
    title: 'Share instantly',
    description: 'One link, one click. Join meetings or share notes without the hassle.',
    linkText: 'Try sharing',
    icon: Share2
  },
]
</script>

<style scoped></style>
