module.exports = {
  apps : [{
    script: 'bin/main.js',
    watch: '.'
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
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      env_production: {
        NODE_ENV: "production"
      },
    },
    staging : {
      user : '',
      key : '',
      host : '',
      ref  : 'origin/develop',
      repo : 'https://github.com/CAFECA-IO/TideBitSWAP',
      path : '/home/ubuntu/workspace/TideBitSWAP',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env staging',
      'pre-setup': '',
      env_staging: {
        NODE_ENV: "staging"
      }
    }
  }
};
