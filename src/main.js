
import { createApp } from 'vue'

import './assets/main.css'
import './stili/design-system.css'
import './stili/navigazione-campagna.css'
import './stili/sticky-battaglia.css'

import App from './App.vue'
import router from './router/index.js'

import { installaStickyBattaglia } from './stato/stickyBattaglia.js'

const app = createApp(App)

app.use(router)

app.mount('#app')

installaStickyBattaglia(router)
