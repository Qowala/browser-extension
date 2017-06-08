import Vue from 'vue'
import popup from './popup.vue'
import './popup.html'

export default new Vue({
  el: '#app',
  render: h => h(popup)
})
