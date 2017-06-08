import Vue from 'vue'
import options from './options.vue'
import './options.html'
import '../assets/favicon.png'

export default new Vue({
  el: '#app',
  render: h => h(options)
})
