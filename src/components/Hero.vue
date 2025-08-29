<template>
  <div class="bg-background">
    <div class="relative isolate px-6 pt-14 lg:px-8">
      <!-- Background gradients -->
      <div aria-hidden="true"
        class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div
          style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
          class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary/30 to-blue-600/30 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]">
        </div>

      </div>

      <div class="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
        <!-- Beta announcement -->
        <div class="hidden sm:mb-8 sm:flex sm:justify-center">
          <div
            class="relative rounded-full px-3 py-1 text-sm text-muted-foreground ring-1 ring-border hover:ring-primary/50 transition-colors">
            Now in Beta • Join Early Access
            <span class="text-primary ml-2">Request Demo</span>
            <MoveRight class="inline-block ml-1 text-primary" size="14" :stroke-width="3.3" />
          </div>
        </div>

        <!-- Main content -->
        <div class="text-center">

          <h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Transform Your <span>Meetings</span>
            <br>
            Into Action
          </h1>

          <p class="mt-8 text-lg font-medium text-pretty text-muted-foreground sm:text-xl/8">
            The only platform you need to collaborate in real-time, track action items, and turn every meeting into
            measurable results.
          </p>

          <div class="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" class="rounded-md px-6 py-3 text-sm font-semibold shadow-sm">
              Get Started
            </Button>

            <span variant="link" class="text-sm/6 font-semibold hover:cursor-pointer">
              Request Demo
              <MoveRight class="inline-block ml-1" size="14" :stroke-width="3.3" />
            </span>
          </div>
        </div>
      </div>

      <!-- Bottom background gradient -->
      <div aria-hidden="true"
        class="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <div
          style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
          class="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary/20 to-blue-600/20 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { MoveRight } from 'lucide-vue-next'
</script>

<style scoped></style>