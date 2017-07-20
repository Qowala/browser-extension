module.exports = {
    extends: 'standard',
    plugins: [
      'html',
      'standard',
      'promise'
    ],
    env: {
      browser: true
    },
    globals: {
      chrome: false
    },
    settings: {
      'html/html-extensions': [ '.html', '.vue' ]
    }
};
