<template>
  <section class="py-24 sm:py-32 bg-muted/30">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Section Header -->
        <div class="text-center mb-16">
          <Badge variant="outline"
            class="mb-6 px-4 py-2 rounded-full text-sm font-semibold tracking-wide bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 transition-colors">
            Pricing
          </Badge>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Simple, honest pricing.
          </h2>
          <p class="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Start for free. Upgrade to unlock unlimited meetings and powerful action tracking for your team.

          </p>
        </div>

        <!-- Pricing Cards -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <!-- Free Plan -->
          <Card class="relative border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent class="p-8">
              <div class="text-center mb-8">
                <h3 class="text-xl font-bold text-foreground mb-2">Free Plan</h3>
                <p class="text-sm text-muted-foreground mb-6">For trying out Meetopia</p>
                <div class="flex items-baseline justify-center">
                  <span class="text-4xl font-bold text-foreground">$0</span>
                  <span class="text-sm text-muted-foreground ml-2">/ Forever</span>
                </div>
              </div>

              <Button variant="outline" class="w-full mb-8">
                Get Started for Free
              </Button>

              <div class="mb-6">
                <p class="text-sm font-medium text-foreground mb-4">Includes:</p>
              </div>

              <ul class="space-y-4">
                <li v-for="feature in freeFeatures" :key="feature" class="flex items-start">
                  <Check class="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span class="text-sm text-muted-foreground">{{ feature }}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <!-- Pro Plan (Most Popular) -->
          <Card
            class="relative border-2 border-primary shadow-lg hover:shadow-xl transition-all duration-300 scale-105">
            <!-- Most Popular Badge -->
            <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge class="px-4 py-2 bg-primary text-primary-foreground font-semibold">
                Most Popular
              </Badge>
            </div>

            <CardContent class="p-8 pt-12">
              <div class="text-center mb-8">
                <h3 class="text-xl font-bold text-foreground mb-2">Pro Plan</h3>
                <p class="text-sm text-muted-foreground mb-6">For teams that rely on Meetopia</p>
                <div class="flex items-baseline justify-center mb-2">
                  <span class="text-4xl font-bold text-foreground">$8</span>
                  <span class="text-sm text-muted-foreground ml-1">/user per month</span>
                </div>
                <p class="text-xs text-muted-foreground">Billed monthly. No hidden fees.</p>

              </div>

              <Button class="w-full mb-8 bg-primary hover:bg-primary/90">
                Start Your Free Trial
              </Button>


              <div class="mb-6">
                <p class="text-sm font-medium text-foreground mb-4">Includes everything in Free, plus:</p>
              </div>

              <ul class="space-y-4">
                <li v-for="feature in proFeatures" :key="feature" class="flex items-start">
                  <Check class="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span class="text-sm text-muted-foreground"
                    :class="feature.includes('Assign Action Items') ? 'font-medium text-foreground' : ''">{{ feature
                    }}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>


      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Check
} from 'lucide-vue-next'

// Feature lists for each plan
const freeFeatures = [
  '1 Concurrent Active Meeting',
  'Real-time Collaborative Notes',
  'Create & View Action Items',
  'Up to 5 Participants',
  'Basic Email Support'
]

const proFeatures = [
  'Unlimited Active Meetings',
  'Up to 25 Participants per Meeting',
  'Assign Action Items & Set Due Dates',
  'Priority Email Support',
  'Personal Action Item Dashboard'
]
</script>

<style scoped>
.scale-105 {
  transform: scale(1.05);
}

@media (max-width: 1024px) {
  .scale-105 {
    transform: none;
  }
}
</style>
