<template>
  <section class="py-24 sm:py-32 bg-muted/30">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-6xl mx-auto">
        <!-- Section Header -->
        <div class="text-center mb-16">
          <p class="text-sm font-semibold text-primary tracking-wide uppercase mb-4">Core Features</p>
          <h2 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight">
            Everything you need for productive meetings
          </h2>
          <p class="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Streamline your meetings with powerful collaboration tools designed for modern teams.
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
    title: 'Real-time Collaboration',
    description: 'Share notes instantly with live editing and auto-save functionality. See who\'s editing in real-time.',
    linkText: 'Learn more',
    icon: Users
  },
  {
    title: 'Smart Action Items',
    description: 'Create, assign, and track tasks with priorities and due dates. Never miss important follow-ups.',
    linkText: 'Learn more',
    icon: CheckSquare
  },
  {
    title: 'Instant Sharing',
    description: 'Generate shareable links and join meetings with a single click. No complex setup required.',
    linkText: 'Learn more',
    icon: Share2
  },
]
</script>

<style scoped></style>
