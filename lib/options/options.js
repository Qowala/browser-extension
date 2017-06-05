import Vue from 'vue'
import options from './options.vue'
import {} from './options.html'
import {} from '../assets/favicon.png'

export default new Vue({
  el: '#app',
  render: h => h(options)
})
