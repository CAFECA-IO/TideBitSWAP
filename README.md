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
> Notice: The address by your mnemonic phrase must have enough blockchain original crypto coin.

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

After the server start already, you will see like this:
```sh
HTTP   http://127.0.0.1:80
HTTPS  https://127.0.0.1:443
```

## Verify
```shell
curl --location --request GET 'http://127.0.0.1/verify'
```

If success, you will see like this:
```json
{
    "powerby": "TideBitSwap api 0.9.0",
    "success": true,
    "code": "00000000",
    "message": "Start up verify",
    "payload": {
        "chainId": 3,
        "router": "0xddbcb302a16f27d12ef1ca491b4791a7b3d67c04",
        "factory": "0x7aeda6b83824c4d8f02ad4601c9a7c56b7c50038",
        "weth": "0xca917878c84b3e1850479bba83aef77c2cf649cb",
        "blockNumberFromDB": "11749965",
        "blockNumberFromPeer": "11750446",
        "checkFactory": true
    }
}
```

If fail, it will show like this:
```json
{
    "powerby": "TideBitSwap api 0.9.0",
    "success": false,
    "code": "05000001",
    "message": "RPC ERROR",
    "payload": {}
}
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
