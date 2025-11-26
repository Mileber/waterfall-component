import Component from './src/WaterfallComponent.vue'
const install = function(Vue){ if (install.installed) return; Vue.component('WaterfallComponent', Component) }
export default Component
export { install }
