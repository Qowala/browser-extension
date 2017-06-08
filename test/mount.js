import Vue from 'vue'

export default function mount (vue) {
  require('jsdom-global')(`<!DOCTYPE html>
    <html>
      <head></head>
      <body>
        <div id="app"></div>
      </body>
    </html>`)

  const Component = Vue.extend(vue)
  return new Component().$mount()
}
