<template>
  <footer class="bg-muted/30 border-t border-border/50">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
        <!-- Logo and Tagline -->
        <div class="md:col-span-4">
          <div class="flex items-center mb-4">
            <span class="text-xl font-bold text-foreground">Meetopia</span>
          </div>
          <p class="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Better meetings, fewer headaches. Turn discussion into action.
          </p>
        </div>

        <!-- Links -->
        <div class="md:col-span-4">
          <div class="grid grid-cols-2 gap-8">
            <div>
              <h3 class="text-sm font-semibold text-foreground mb-4">Product</h3>
              <ul class="space-y-3">
                <li>
                  <Button variant="link" class="h-auto p-0 text-sm text-muted-foreground hover:text-foreground">
                    Features
                  </Button>
                </li>
                <li>
                  <Button variant="link" class="h-auto p-0 text-sm text-muted-foreground hover:text-foreground">
                    Pricing
                  </Button>
                </li>
                <li>
                  <Button variant="link" class="h-auto p-0 text-sm text-muted-foreground hover:text-foreground">
                    How it works
                  </Button>
                </li>
              </ul>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-foreground mb-4">Company</h3>
              <ul class="space-y-3">
                <li>
                  <Button variant="link" class="h-auto p-0 text-sm text-muted-foreground hover:text-foreground">
                    About
                  </Button>
                </li>
                <li>
                  <Button variant="link" class="h-auto p-0 text-sm text-muted-foreground hover:text-foreground">
                    Blog
                  </Button>
                </li>
                <li>
                  <Button variant="link" class="h-auto p-0 text-sm text-muted-foreground hover:text-foreground">
                    Contact
                  </Button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Legal & Social -->
        <div class="md:col-span-4">
          <h3 class="text-sm font-semibold text-foreground mb-4">Legal</h3>
          <ul class="space-y-3 mb-8">
            <li>
              <Button variant="link" class="h-auto p-0 text-sm text-muted-foreground hover:text-foreground">
                Terms of Service
              </Button>
            </li>
            <li>
              <RouterLink to="/privacy-policy"
                class="text-sm text-muted-foreground hover:text-foreground hover:underline">
                Privacy Policy
              </RouterLink>
            </li>
          </ul>
          <div class="flex space-x-4">
            <Button variant="ghost" size="sm" class="h-auto p-2 text-muted-foreground hover:text-foreground"
              aria-label="Twitter">
              <Twitter class="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" class="h-auto p-2 text-muted-foreground hover:text-foreground"
              aria-label="GitHub">
              <Github class="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" class="h-auto p-2 text-muted-foreground hover:text-foreground"
              aria-label="LinkedIn">
              <Linkedin class="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-border/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p class="text-sm text-muted-foreground">© {{ new Date().getFullYear() }} Meetopia Meetopia. All rights
          reserved.</p>
        <p class="text-sm text-muted-foreground mt-2 md:mt-0">Made with ♥ by Said</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Twitter, Github, Linkedin } from 'lucide-vue-next'
</script>
