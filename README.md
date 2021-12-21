# TideBit SWAP

## Suggestion Environment
- ubuntu 20.04
- nodejs v16.13.0
- npm v8.1.0

# prepare environment
- Setup SWAP
- Install library
- Install Node [latest version](https://nodejs.org/dist/latest/)
- Install pm2
```shell
bash <(curl https://raw.githubusercontent.com/CAFECA-IO/TideBitSWAP/main/shell/env.sh -kL)
```

# Local Deploy
## Initial Local Project
```shell
git clone https://github.com/CAFECA-IO/TideBitSWAP
cd TideBitSWAP
npm install
```

## Build Frontend
```shell
npm run build
```

## Build Frontend and Run Service
```shell
npm start
```

# Remote Deploy
## Initial Local Project
```shell
git clone https://github.com/CAFECA-IO/TideBitSWAP
cd TideBitSWAP
npm i
```

## Copy Config
```shell
mkdir private
cp ecosystem.config.js private/
vi private/ecosystem.config.js
```
```javascript
module.exports = {
  ...
  deploy : {
    production : {
      user : `${ USER-NAME }`,
      key : `${ YOUR-SSH-KEY-PATH }`,
      host : `${ YOUR-HOST-NAME }`,
      ...
    },
    staging : {
      user : `${ USER-NAME }`,
      key : `${ YOUR-SSH-KEY-PATH }`,
      host : `${ YOUR-HOST-NAME }`,
      ...
    }
  }
}
```

## Initial Remote Environment
```shell
npm run deploy private/ecosystem.config.js staging setup
```

## Run Remote Service
```shell
npm run deploy private/ecosystem.config.js staging
```
