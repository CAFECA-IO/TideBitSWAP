# TideBit SWAP

# prepare environment
- Setup SWAP
- Install library
- Install Node [latest version](https://nodejs.org/dist/latest/)
- Install pm2
- Install truffle
```shell
bash <(curl https://raw.githubusercontent.com/CAFECA-IO/TideBitSWAP/main/shell/env.sh -kL)
```

# Deploy Router Contract

```shell
mkdir private
echo 'module.exports = "your mnemonic phrase here ...";' > private/wallet.js
truffle migrate
```

# Local Deploy
## Initial Local Project
```shell
git clone https://github.com/CAFECA-IO/TideBitSWAP
cd TideBitSWAP
npm install
```

## generate a TideWallet api key
```shell
curl --location --request POST 'https://enterprise.tidewallet.io/api/v1/enterprise/apiKey' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "eth",
    "project": "eth"
}'
```

## copy and modify config
```shell
mkdir private
cp example.config.toml private/config.toml
vim private/config.toml
```

```toml
# private/config.toml

[TideWallet-Backend]
apiKey = "your apiKey Here"

# add your router detail set for each chain

# # router1
# [[TideBitSwapDatas]]
# router = ""               # address include 0x
# chainId = 3               # 1: eth mainnet, 3: ropsten
# factory = ""              # address include 0x, defined in router
# weth = ""                 # address include 0x, defined in router

# # router2
# [[TideBitSwapDatas]]
# router = ""               # address include 0x
# chainId = 3               # 1: eth mainnet, 3: ropsten
# factory = ""              # address include 0x, defined in router
# weth = ""                 # address include 0x, defined in router

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
