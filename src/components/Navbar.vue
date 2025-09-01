<template>
  <header class="absolute inset-x-0 top-0 z-50">
    <nav class="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
      <!-- Logo/Brand -->
      <div class="flex lg:flex-1">
        <router-link to="/" class="-m-1.5 p-1.5">
          <span class="sr-only">Meetopia</span>
          <span class="text-2xl font-bold text-primary">Meetopia</span>
        </router-link>
      </div>

      <!-- Mobile menu button -->
      <div class="flex lg:hidden">
        <Sheet>
          <SheetTrigger as-child>
            <Button variant="ghost" size="sm"
              class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-muted-foreground">
              <span class="sr-only">Open main menu</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"
                class="h-6 w-6">
                <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" class="w-full sm:max-w-sm bg-background border-l border-border/20">
            <!-- Header with Logo -->
            <div class="flex items-center mb-8 pt-2">
              <router-link to="/" class="flex items-center">
                <span class="text-2xl font-bold text-primary">Meetopia</span>
              </router-link>
            </div>

            <!-- Navigation Links -->
            <nav class="flex flex-col space-y-1">
              <button @click="scrollToSection('features')"
                class="flex items-center px-4 py-3 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors text-left">
                Features
              </button>
              <button @click="scrollToSection('pricing')"
                class="flex items-center px-4 py-3 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors text-left">
                Pricing
              </button>
              <button @click="scrollToSection('about')"
                class="flex items-center px-4 py-3 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors text-left">
                About
              </button>
            </nav>

            <!-- Sign In Button -->
            <div class="mt-8 pt-6 border-t border-border/20">
              <Button class="w-full h-11 text-base font-medium">
                Sign In
                <MoveRight class="ml-2 h-4 w-4" />
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <!-- Desktop Navigation -->
      <div class="hidden lg:flex lg:gap-x-12">
        <button @click="scrollToSection('features')"
          class="text-sm/6 font-semibold hover:text-primary transition-colors">
          Features
        </button>
        <button @click="scrollToSection('pricing')"
          class="text-sm/6 font-semibold hover:text-primary transition-colors">
          Pricing
        </button>
        <button @click="scrollToSection('about')" class="text-sm/6 font-semibold hover:text-primary transition-colors">
          About
        </button>
      </div>

      <!-- Desktop Sign In -->
      <div class="hidden lg:flex lg:flex-1 lg:justify-end">
        <router-link to="/login" class="text-sm/6 font-semibold ">
          <div>
            Sign In
            <MoveRight class="inline-block ml-1" :size="14" :stroke-width="3.3" />
          </div>
        </router-link>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { MoveRight } from 'lucide-vue-next';

// Smooth scroll to section function
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
}
</script>

<style scoped></style>