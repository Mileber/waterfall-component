import Component from './src/WaterfallComponent.vue'
export default Component
export function install(app){ if (install.installed) return; app.component('WaterfallComponent', Component) }
