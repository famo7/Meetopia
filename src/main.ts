import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Import Preline UI JavaScript
import 'preline/preline'

const app = createApp(App)
app.mount('#app')

// Initialize Preline components after Vue app is mounted
declare global {
  interface Window {
    HSStaticMethods: {
      autoInit(): void
    }
  }
}

// Wait for the next tick to ensure DOM is ready, then initialize Preline
app.config.globalProperties.$nextTick(() => {
  if (typeof window !== 'undefined' && window.HSStaticMethods) {
    window.HSStaticMethods.autoInit()
  }
})
