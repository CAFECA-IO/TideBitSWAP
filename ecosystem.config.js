module.exports = {
  apps : [{
    script: 'bin/main.js',
    watch: '.'
  }, {
    script: './service-worker/',
    watch: ['./service-worker']
  }],

  deploy : {
    production : {
      user : '',
      key : '',
      host : '',
      ref  : 'origin/main',
      repo : 'https://github.com/CAFECA-IO/TideBitSWAP',
      path : '/home/ubuntu/workspace/TideBitSWAP',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    },
    staging : {
      user : '',
      key : '',
      host : '',
      ref  : 'origin/develop',
      repo : 'https://github.com/CAFECA-IO/TideBitSWAP',
      path : '/home/ubuntu/workspace/TideBitSWAP',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
