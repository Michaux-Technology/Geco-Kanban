if (typeof process === 'undefined') {
  window.process = {
    env: {
      NODE_ENV: 'development'
    },
    nextTick: function(callback) {
      setTimeout(callback, 0);
    },
    browser: true,
    version: '',
    platform: 'browser',
    title: 'browser'
  };
} 