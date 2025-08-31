<template>
  <section class="py-24 sm:py-32 bg-background">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-6xl mx-auto">
        <!-- Section Header -->
        <div class="text-center mb-16">
          <Badge variant="outline"
            class="mb-6 px-4 py-2 rounded-full text-sm font-semibold tracking-wide  bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 transition-colors">
            How It Works
          </Badge>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Get Started in 3 Easy Steps
          </h2>
          <p class="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Our platform is simple to join, easy to use, and designed to help you start collaborating right away.
          </p>
        </div>

        <!-- Steps Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card v-for="step in steps" :key="step.title"
            class="relative border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm">
            <CardContent class="p-8 text-left">
              <!-- Icon -->
              <div class="mb-6">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl">
                  <component :is="step.icon" class="w-8 h-8 text-primary" />
                </div>
              </div>

              <!-- Content -->
              <h3 class="text-xl font-bold text-foreground mb-3">{{ step.title }}</h3>
              <p class="text-muted-foreground leading-relaxed text-sm">{{ step.description }}</p>
            </CardContent>
          </Card>
        </div>


      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  Calendar,
  MessageSquare,
  CheckCircle as CheckIcon
} from 'lucide-vue-next'
import Badge from './ui/badge/Badge.vue';
import Card from './ui/card/Card.vue';

// Steps data
const steps = [
  {
    title: '1. Schedule & invite',
    description: 'Create a meeting link and share it with your team. They can join with one click.',
    icon: Calendar
  },
  {
    title: '2. Meet & collaborate',
    description: 'Take notes together in real-time. Everyone stays on the same page, literally.',
    icon: MessageSquare
  },
  {
    title: '3. Follow through',
    description: 'Assign action items with deadlines. Get automatic reminders so nothing falls through the cracks.',
    icon: CheckIcon
  }
]
</script>

<style scoped>
/* Add subtle animations for better UX */
.group:hover .transition-colors {
  transition: all 0.3s ease;
}

/* Ensure proper spacing and alignment */
@media (min-width: 1024px) {
  .grid.grid-cols-3>div:nth-child(2) {
    position: relative;
    z-index: 10;
  }
}
</style>
