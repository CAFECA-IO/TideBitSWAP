# TideBit SWAP

# deploy

## clone
```shell
git clone https://github.com/CAFECA-IO/TideBitSWAP
```

## install library
```shell
npm install
```

## build frontend
```shell
npm run build
```

## start
```shell
npm start
```

# Remote Deploy
## clone
```shell
git clone https://github.com/CAFECA-IO/TideBitSWAP
```

## copy config
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

## Deploy Remote Service
```shell
npm run deploy private/ecosystem.config.js staging
```
