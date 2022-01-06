const Ecrequest = require('ecrequest');

const Blockchains = require('../constants/Blockchain');
const Eceth = require('./eceth');
const SafeMath = require('./SafeMath');
const DefaultIcon = require('../constants/DefaultIcon');

class StakeCrawler {
  constructor(stakeData, database, logger) {
    this.chainId = stakeData.chainId;
    this.database = database;
    this.logger = logger;
    this.syncInterval = 7500;
    this.BLOCKS_PER_YEAR = 31536000 /* one year sec */ / 15 /* sec per block */
    this.stakeData = stakeData;
    return this;
  }

  async init() {
    this.isSyncing = false;
    this.blockchain = Blockchains.findByChainId(this.chainId);
    this.router = this.stakeData.router.toLowerCase();
    this.weth = this.stakeData.weth.toLowerCase();
    this.factory = this.stakeData.factory.toLowerCase();

    // this._stakeIndex = await this.allPairsLength();
    // this._poolAddresses = []
    // this._poolAddresses = this._poolAddresses.concat(await this.poolAddresses(0, this._poolIndex));
    // const syncPoolJobs = this._poolAddresses.map((v,i) => {
    //   return this.syncStake(v,i);
    // });
    // await Promise.all(syncPoolJobs);
  }

  async start() {
    this._peerBlock = 0;
    try {
      this.oneCycle();
    } catch (error) {
      this.logger.log(`[${this.constructor.name}] ${error}`);
    }
    setInterval(async () => {
      try {
        this.oneCycle();
      } catch (error) {
        this.logger.log(`[${this.constructor.name}] ${error}`);
      }
    }, this.syncInterval);
  }

  async oneCycle() {
    try {
      if(this.isSyncing) {
        this.logger.debug(`[${this.constructor.name}] is syncing.`);
        return;
      }
      this.isSyncing = true;
      // step
      // 1. sync in db not end pool
      // 2. sync in db end but totalStake not 0 pool
      // 3. getLastIndexInDb
      // 4. getPoolLength (mock for now, ask factory like uniswap)
      // 5. sync new pool by index
      this._peerBlock = await this.blockNumberFromPeer();
      const stakesNeedUpdate = await this.findStakesNeedUpdate();

      const updateJobs = stakesNeedUpdate.map(stake => this.updateStake(stake));
      await Promise.all(updateJobs);

      const newStakeIndex = await this.allPairsLength();
      const oldStakeIndex = await this.findStakeIndexFromDb(this.chainId, this.factory);
      const newStakeAddresses = await this.stakeAddresses(oldStakeIndex + 1, newStakeIndex);
      const syncPoolJobs = newStakeAddresses.map((v,i) => {
        return this.syncStake(v,i);
      });
      await Promise.all(syncPoolJobs);
      this.isSyncing = false;
    } catch (error) {
      this.logger.error(error);
      this.isSyncing = false;
    }
  }

  async blockNumberFromPeer() {
    const res = await Eceth.getBlockNumber({ server: this.blockchain.rpcUrls[0] });
    this.logger.debug('blockNumberFromPeer res', res)
    return res;
  }

  async allPairsLength() {
    const allPairsLength = (await Eceth.getData({ contract: this.factory, func: 'allPairsLength()', params: [], dataType: ['uint8'], server: this.blockchain.rpcUrls[0] }))[0];
    return allPairsLength;
  }

  async syncStake(stakeContract, factoryIndex) {
    try {
      const [
        [rewardToken], [stakedToken], [rewardPerBlock], [hasUserLimit], [poolLimitPerUser],
        [startBlock], [endBlock], /* [projectSite] */
      ] = await Promise.all([
        Eceth.getData({ contract: stakeContract, func: 'rewardToken()', params: [], dataType: ['address'], server: this.blockchain.rpcUrls[0] }),
        Eceth.getData({ contract: stakeContract, func: 'stakedToken()', params: [], dataType: ['address'], server: this.blockchain.rpcUrls[0] }),
        Eceth.getData({ contract: stakeContract, func: 'rewardPerBlock()', params: [], dataType: ['uint256'], server: this.blockchain.rpcUrls[0] }),
        Eceth.getData({ contract: stakeContract, func: 'hasUserLimit()', params: [], dataType: ['boolean'], server: this.blockchain.rpcUrls[0] }),
        Eceth.getData({ contract: stakeContract, func: 'poolLimitPerUser()', params: [], dataType: ['address'], server: this.blockchain.rpcUrls[0] }),
        Eceth.getData({ contract: stakeContract, func: 'startBlock()', params: [], dataType: ['uint256'], server: this.blockchain.rpcUrls[0] }),
        Eceth.getData({ contract: stakeContract, func: 'bonusEndBlock()', params: [], dataType: ['uint256'], server: this.blockchain.rpcUrls[0] }),
        // Eceth.getData({ contract: poolContract, func: 'projectSite()', params: [], dataType: ['string'], server: this.blockchain.rpcUrls[0] }),
      ]);

      const totalStaked = await Eceth.getData({ contract: stakedToken, func: 'balanceOf()', params: [stakeContract], dataType: ['uint256'], server: this.blockchain.rpcUrls[0] });
      const APY = SafeMath.mult(SafeMath.div(rewardPerBlock, totalStaked), this.BLOCKS_PER_YEAR);
      let state = 0;
      if (SafeMath.gte(this._peerBlock, endBlock)) {
        if (SafeMath.gt(totalStaked, 0)) {
          state = 1;
        } else {
          state = 2;
        }
      }

      // mock projectSite
      const projectSite = 'https://swap.tidebit.network/';

      const entity = this.database.stakeDao.entity({
        chainId: this.chainId.toString(),
        contract: stakeContract,
        factoryContract: this.factory,
        factoryIndex,
        rewardToken,
        stakedToken,
        rewardPerBlock,
        totalStaked,
        hasUserLimit,
        poolLimitPerUser,
        APY,
        start: startBlock,
        end: endBlock,
        projectSite,
        state,
      });
      await this.database.stakeDao.insertStake(entity);
      await this._findToken(this.chainId, rewardToken);
      await this._findToken(this.chainId, stakedToken);
    } catch (error) {
      this.logger.trace(error);
    }
    return;
  }

  async stakeAddresses(startIndex, endIndex){
    this.logger.debug('stakeAddresses', startIndex, typeof startIndex, endIndex, typeof endIndex);
    const getAddress = async (i) => {
      const pairAddress = (await Eceth.getData({ contract: this.factory, func: 'allPairs(uint256)', params: [i], dataType: ['address'], server: this.blockchain.rpcUrls[0] }))[0];
      return pairAddress;
    }
    let result = [];
    for (let i = startIndex, step = 10; i < endIndex; i+= step) {
      const request = [];
      if (step > endIndex - i) step = endIndex - i;
      for (let j = i; j < i + step; j++) {
        request.push(getAddress(j));
      }
      try {
        const res = await Promise.all(request);
        result = result.concat(res);
      } catch (error) {
        this.logger.error(error);
      }
    }
    return result;
  }

  async insertTokenPrice({ contract, priceToEth, timestamp }) {
    const entity = this.database.tokenPriceDao.entity({
      chainId: this.chainId.toString(),
      contract,
      priceToEth,
      timestamp, 
    })

    return this.database.tokenPriceDao.insertTokenPrice(entity);
  }

  async findStakeIndexFromDb(chainId, facotryContract) {
    const stake = await this.database.stakeDao.findLastStakeInFactory(chainId, facotryContract);
    return stake.factoryIndex;
  }

  async _findToken(chainId, tokenAddress) {
    let findToken;
    tokenAddress = tokenAddress.toLowerCase();
    try {
      findToken = await this.database.tokenDao.findToken(chainId.toString(), tokenAddress);
    } catch (error) {
      console.trace(error);
    }

    if(!findToken) {
      const tokenDetailByContract = await this.getErc20Detail({ erc20: tokenAddress , server: this.blockchain.rpcUrls[0] });
      if (!tokenDetailByContract.name || !tokenDetailByContract.symbol
        || !tokenDetailByContract.decimals || !tokenDetailByContract.totalSupply) {
          throw new Error(`contract: ${tokenAddress} is not erc20 token`);
        }
      
      const icon = await this.getIconBySymbol(tokenDetailByContract.symbol);
      const tokenEnt = this.database.tokenDao.entity({
        chainId: chainId.toString(),
        contract: tokenAddress,
        name: tokenDetailByContract.name,
        symbol: tokenDetailByContract.symbol,
        decimals: tokenDetailByContract.decimals,
        totalSupply: tokenDetailByContract.totalSupply,
        icon
      });
      await this.database.tokenDao.insertToken(tokenEnt);
      findToken = await this.database.tokenDao.findToken(chainId.toString(), tokenAddress);
      if(!findToken) throw new Error('still not found token');
    }
    return findToken;
  }

  async getErc20Detail({ erc20, server }) {
    let result;
    try {
      const [[name], [symbol], [decimals], [totalSupply]] = await Promise.all([
        Eceth.getData({ contract: erc20, func: 'name()', params:[], dataType: ['string'], server }),
        Eceth.getData({ contract: erc20, func: 'symbol()', params:[], dataType: ['string'], server }),
        Eceth.getData({ contract: erc20, func: 'decimals()', params:[], dataType: ['uint8'], server }),
        Eceth.getData({ contract: erc20, func: 'totalSupply()', params: [], dataType: ['uint256'], server }),
      ]);
      result = { contract: erc20, name, symbol, decimals, totalSupply };
    }
    catch(e) {
      result = { contract: erc20, symbol: '?', decimals: 18 };
      // console.trace(e);
    }
    return result;
  }

  async getIconBySymbol(symbol) {
    let icon = `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@9ab8d6934b83a4aa8ae5e8711609a70ca0ab1b2b/32/icon/${symbol.toLocaleLowerCase()}.png`;
    try {
      const checkIcon = await Ecrequest.get({
        protocol: 'https:',
        hostname: 'cdn.jsdelivr.net',
        port: '',
        path: `/gh/atomiclabs/cryptocurrency-icons@9ab8d6934b83a4aa8ae5e8711609a70ca0ab1b2b/32/icon/${symbol.toLocaleLowerCase()}.png`,
        timeout: 1000,
      });
      if (checkIcon.data.toString().indexOf('Couldn\'t find') !== -1) throw Error('Couldn\'t find');
    } catch (e) {
      icon = DefaultIcon.erc20;
    }
    return icon;
  }

  async findStakesNeedUpdate() {
    let list = [];
    try {
      list = list.concat(await this.database.stakeDao.listStakeByState(this.chainId.toString(), this.factory, 0));
      list = list.concat(await this.database.stakeDao.listStakeByState(this.chainId.toString(), this.factory, 1));
    } catch (error) {
      console.trace(error);
    }
    return list;
  }

  async updateStake(stakeEntity) {
    try {
      const [
        [rewardPerBlock], [hasUserLimit], [poolLimitPerUser], [startBlock], [endBlock], [totalStaked],
      ] = await Promise.all([
        Eceth.getData({ contract: stakeEntity.stakeContract, func: 'rewardPerBlock()', params: [], dataType: ['uint256'], server: this.blockchain.rpcUrls[0] }),
        Eceth.getData({ contract: stakeEntity.stakeContract, func: 'hasUserLimit()', params: [], dataType: ['boolean'], server: this.blockchain.rpcUrls[0] }),
        Eceth.getData({ contract: stakeEntity.stakeContract, func: 'poolLimitPerUser()', params: [], dataType: ['address'], server: this.blockchain.rpcUrls[0] }),
        Eceth.getData({ contract: stakeEntity.stakeContract, func: 'startBlock()', params: [], dataType: ['uint256'], server: this.blockchain.rpcUrls[0] }),
        Eceth.getData({ contract: stakeEntity.stakeContract, func: 'bonusEndBlock()', params: [], dataType: ['uint256'], server: this.blockchain.rpcUrls[0] }),
        Eceth.getData({ contract: stakeEntity.stakedToken, func: 'balanceOf()', params: [stakeEntity.contract], dataType: ['uint256'], server: this.blockchain.rpcUrls[0] }),
      ]);
      const APY = SafeMath.mult(SafeMath.div(stakeEntity.rewardPerBlock, totalStaked), this.BLOCKS_PER_YEAR);
      let state = 0;
      if (SafeMath.gte(this._peerBlock, endBlock)) {
        if (SafeMath.gt(totalStaked, 0)) {
          state = 1;
        } else {
          state = 2;
        }
      }

      stakeEntity.rewardPerBlock = rewardPerBlock;
      stakeEntity.hasUserLimit = hasUserLimit;
      stakeEntity.poolLimitPerUser = poolLimitPerUser;
      stakeEntity.startBlock = startBlock;
      stakeEntity.endBlock = endBlock;
      stakeEntity.totalStaked = totalStaked;
      stakeEntity.APY = APY;
      stakeEntity.state = state;
      await this.database.stakeDao.insertStake(stakeEntity);
    } catch (error) {
      this.logger.trace(error);
    }
    return;
  }
}

module.exports = StakeCrawler;
