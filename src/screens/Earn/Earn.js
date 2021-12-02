import React, { useContext, useState, useEffect, useCallback } from "react";
import AssetDetail from "../../components/UI/AssetDetail";
import NetworkDetail from "../../components/UI/NetworkDetail";
import ConnectorContext from "../../store/connector-context";
import SafeMath from "../../Utils/safe-math";
import Pairs from "./Pairs";
import classes from "./Earn.module.css";
import EarnPannel from "./EarnPannel";
import { useHistory, useLocation } from "react-router";
import {
  amountUpdateHandler,
  coinPairUpdateHandler,
  formateDecimal,
} from "../../Utils/utils";
import UserContext from "../../store/user-context";

export const getDetail = (pool) => {
  return pool
    ? [
        {
          title: `${pool?.token0?.symbol || "--"} per ${
            pool?.token1?.symbol || "--"
          }`,
          value: `${formateDecimal(
            SafeMath.div(pool?.poolBalanceOfToken1, pool?.poolBalanceOfToken0),
            8
          )}`,
        },
        {
          title: `${pool?.token1?.symbol || "--"} per ${
            pool?.token0?.symbol || "--"
          }`,
          value: `${formateDecimal(
            SafeMath.div(pool?.poolBalanceOfToken0, pool?.poolBalanceOfToken1),
            8
          )}`,
        },
        {
          title: `${
            pool?.share
              ? formateDecimal(SafeMath.mult(pool?.share, 100), 4)
              : "0"
          } %`,
          value: "Your pool share",
          explain:
            "The estimated percentage that the ultimate executed price of the swap deviates from current price due to trading amount.",
        },
      ]
    : [];
};

export const getSummary = (pool, seletedCoin, pairedCoin, fiat) =>
  !pool
    ? [
        {
          title: "Initial prices",
          value: `1 ${seletedCoin?.symbol || "--"} ≈ ${
            seletedCoin?.amount && pairedCoin?.amount
              ? SafeMath.div(seletedCoin?.amount, pairedCoin?.amount)
              : "--"
          } ${pairedCoin?.symbol || "--"}`,
          explain:
            "Estimated price of the swap, not the final price that the swap is executed.",
        },
        {
          title: "Initial prices",
          value: `1 ${pairedCoin?.symbol || "--"} ≈ ${
            seletedCoin?.amount && pairedCoin?.amount
              ? SafeMath.div(pairedCoin?.amount, seletedCoin?.amount)
              : "--"
          } ${seletedCoin?.symbol || "--"}`,
          explain:
            "Estimated price of the swap, not the final price that the swap is executed.",
        },
        {
          title: "Share of the pool",
          value: `100 %`,
          explain:
            "The estimated percentage that the ultimate executed price of the swap deviates from current price due to trading amount.",
        },
        {
          title: "Total yield",
          value: "--",
          explain: "Trade transaction fee collected by liquidity providers.",
        },
      ]
    : [
        {
          title: pool?.token0?.symbol,
          value: SafeMath.plus(
            pool?.poolBalanceOfToken0,
            seletedCoin?.amount || "0"
          ),
        },
        {
          title: pool?.token1?.symbol,
          value: SafeMath.plus(
            pool?.poolBalanceOfToken1,
            pairedCoin?.amount || "0"
          ),
        },
        {
          title: "Share of the pool",
          value: `${
            seletedCoin?.amount
              ? formateDecimal(
                  SafeMath.mult(
                    SafeMath.div(
                      seletedCoin?.amount,
                      SafeMath.plus(
                        pool?.poolBalanceOfToken0,
                        seletedCoin?.amount || "0"
                      )
                    ),
                    100
                  ),
                  4
                )
              : "0"
          } %`,
          explain:
            "The estimated percentage that the ultimate executed price of the swap deviates from current price due to trading amount.",
        },

        {
          title: "Total yield",
          value: "--",
          explain: "Trade transaction fee collected by liquidity providers.",
        },
      ];

const Earn = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const userCtx = useContext(UserContext);

  const [selectedPool, setSelectedPool] = useState(null);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [selectedCoinAmount, setSelectedCoinAmount] = useState("");
  const [pairedCoin, setPairedCoin] = useState(null);
  const [pairedCoinAmount, setPairedCoinAmount] = useState("");
  const history = useHistory();
  const location = useLocation();
  const [displayApproveSelectedCoin, setDisplayApproveSelectedCoin] =
    useState(false);
  const [selectedCoinIsApprove, setSelectedCoinIsApprove] = useState(false);

  const [displayApprovePairedCoin, setDisplayApprovePairedCoin] =
    useState(false);
  const [pairedCoinIsApprove, setPairedCoinIsApprove] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [providePoolOptions, setProvidePoolOptions] = useState([]);
  // const [takePoolOptions, setTakePoolOptions] = useState([]);

  useEffect(() => {
    const matchedAssetPools = [];
    const unMatchedAssetPools = [];
    connectorCtx.supportedPools?.forEach((pool) => {
      +pool.share > 0
        ? matchedAssetPools.push(pool)
        : unMatchedAssetPools.push(pool);
    });
    const sortingPools = matchedAssetPools.concat(unMatchedAssetPools);
    setProvidePoolOptions(sortingPools);
    // setTakePoolOptions(matchedAssetPools);
    return () => {};
  }, [connectorCtx.supportedPools, connectorCtx.supportedPools.length]);

  useEffect(() => {
    if (connectorCtx.isConnected && connectorCtx.connectedAccount) {
      if (selectedCoin && !SafeMath.gt(selectedCoin?.contract, "0")) {
        setDisplayApproveSelectedCoin(false);
        setSelectedCoinIsApprove(true);
        setIsLoading(false);
      } else if (
        selectedCoin?.balanceOf &&
        SafeMath.gt(selectedCoinAmount, "0") &&
        SafeMath.gt(selectedCoin.balanceOf, selectedCoinAmount)
      ) {
        setIsLoading(true);
        connectorCtx
          .isAllowanceEnough(
            selectedCoin.contract,
            selectedCoinAmount,
            selectedCoin.decimals
          )
          .then((selectedCoinAllowanceIsEnough) => {
            setDisplayApproveSelectedCoin(!selectedCoinAllowanceIsEnough);
            setSelectedCoinIsApprove(selectedCoinAllowanceIsEnough);
            setIsLoading(false);
          });
        setIsLoading(true);
      }
    } else setSelectedCoinIsApprove(false);
    return () => {};
  }, [connectorCtx, selectedCoin, selectedCoinAmount]);

  useEffect(() => {
    if (connectorCtx.isConnected && connectorCtx.connectedAccount) {
      if (pairedCoin && !SafeMath.gt(pairedCoin?.contract, "0")) {
        setDisplayApprovePairedCoin(false);
        setPairedCoinIsApprove(true);
        setIsLoading(false);
      } else if (
        pairedCoin?.balanceOf &&
        SafeMath.gt(pairedCoinAmount, "0") &&
        SafeMath.gt(pairedCoin.balanceOf, pairedCoinAmount)
      ) {
        setIsLoading(true);
        connectorCtx
          .isAllowanceEnough(
            pairedCoin.contract,
            pairedCoinAmount,
            pairedCoin.decimals
          )
          .then((pairedCoinAllowanceIsEnough) => {
            setDisplayApprovePairedCoin(!pairedCoinAllowanceIsEnough);
            setPairedCoinIsApprove(pairedCoinAllowanceIsEnough);
            setIsLoading(false);
          });
        setIsLoading(true);
      }
    } else setPairedCoinIsApprove(false);
    return () => {};
  }, [connectorCtx, pairedCoin, pairedCoinAmount]);

  const approveHandler = async (contract, type) => {
    const coinApproved = await connectorCtx.approve(contract);
    switch (type) {
      case "selected":
        setSelectedCoinIsApprove(coinApproved);
        setDisplayApproveSelectedCoin(!coinApproved);
        break;
      case "paired":
        setPairedCoinIsApprove(coinApproved);
        setDisplayApprovePairedCoin(!coinApproved);
        break;
      default:
        break;
    }
  };

  const changeAmountHandler = useCallback(
    (value, type, pool, active, passive) => {
      let updateSelectedAmount, updatePairedAmount, _pool, _active, _passive;
      _pool = pool || selectedPool;
      _active = active || selectedCoin;
      _passive = passive || pairedCoin;
      switch (type) {
        case "selected":
          updateSelectedAmount = _active
            ? amountUpdateHandler(value, _active.balanceOf)
            : value;
          if (_pool) {
            updatePairedAmount =
              _pool.token0.contract.toLowerCase() ===
              _active.contract.toLowerCase()
                ? SafeMath.mult(
                    SafeMath.div(
                      _pool.poolBalanceOfToken1,
                      _pool.poolBalanceOfToken0
                    ),
                    updateSelectedAmount
                  )
                : SafeMath.mult(
                    SafeMath.div(
                      _pool.poolBalanceOfToken0,
                      _pool.poolBalanceOfToken1
                    ),
                    updateSelectedAmount
                  );
            setPairedCoinAmount(updatePairedAmount);
          }
          setSelectedCoinAmount(updateSelectedAmount);
          break;
        case "paired":
          updatePairedAmount = _passive
            ? amountUpdateHandler(value, _passive.balanceOf)
            : value;
          if (_pool) {
            updateSelectedAmount =
              _pool.token0.contract.toLowerCase() ===
              _active.contract.toLowerCase()
                ? SafeMath.mult(
                    SafeMath.div(
                      _pool.poolBalanceOfToken0,
                      _pool.poolBalanceOfToken1
                    ),
                    updatePairedAmount
                  )
                : SafeMath.mult(
                    SafeMath.div(
                      _pool.poolBalanceOfToken1,
                      _pool.poolBalanceOfToken0
                    ),
                    updatePairedAmount
                  );
            setSelectedCoinAmount(updateSelectedAmount);
          }
          setPairedCoinAmount(updatePairedAmount);
          break;
        default:
          break;
      }
    },
    [pairedCoin, selectedCoin, selectedPool]
  );

  const coinUpdateHandler = async (token, type) => {
    let update, _active, _passive;
    switch (type) {
      case "selected":
        update = coinPairUpdateHandler(
          token,
          pairedCoin,
          connectorCtx.supportedTokens
        );
        ({ active: _active, passive: _passive } = update);
        break;
      case "paired":
        if (!selectedCoin) {
          _active = connectorCtx.supportedTokens.find((t) =>
            SafeMath.gt(token.contrac, 0)
              ? SafeMath.gt(t.contract, 0)
              : !SafeMath.gt(t.contract, 0)
          );
          _passive = token;
        } else {
          update = coinPairUpdateHandler(
            selectedCoin,
            token,
            connectorCtx.supportedTokens
          );
          ({ active: _active, passive: _passive } = update);
        }
        break;
      default:
        break;
    }
    setSelectedCoin(_active);
    setPairedCoin(_passive);
    history.push({
      pathname: `/earn/${_active.contract}/${
        _passive?.contract ? _passive.contract : ""
      }`,
    });
    if (_active && _passive) {
      setIsLoading(true);
      const pool = await connectorCtx.getSelectedPool(_active, _passive);
      setSelectedPool(pool);
      console.log(`pool`, pool);
      if (pool) {
        console.log(`type`, type);
        switch (type) {
          case "selected":
            changeAmountHandler(
              selectedCoinAmount,
              type,
              pool,
              _active,
              _passive
            );
            break;
          case "paired":
            console.log(`type`, type);
            changeAmountHandler(
              pairedCoinAmount,
              type,
              pool,
              _active,
              _passive
            );
            break;
          default:
            break;
        }
      }
      setIsLoading(false);
    } else {
      setSelectedPool(null);
    }
  };

  const selectHandler = (pool) => {
    console.log(`pool`, pool);

    let active = connectorCtx.supportedTokens.find(
      (token) =>
        token.contract.toLowerCase() === pool.token0.contract.toLowerCase()
    );

    let passive = connectorCtx.supportedTokens.find(
      (token) =>
        token.contract.toLowerCase() === pool.token1.contract.toLowerCase()
    );
    setSelectedPool(pool);
    setSelectedCoin(active);
    setPairedCoin(passive);
    history.push({
      pathname: `/earn/${active.contract}/${passive.contract}`,
    });
    changeAmountHandler(selectedCoinAmount, "selected", pool, active, passive);
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    console.log(
      `submitHandler`,
      `selectedCoin`,
      selectedCoin.symbol,
      `pairedCoin`,
      pairedCoin.symbol
    );
    if (selectedCoinIsApprove) {
      setSelectedCoinIsApprove(false);
      let provideLiquidityResut;
      if (selectedPool) {
        try {
          provideLiquidityResut = !SafeMath.gt(selectedCoin.contract, 0)
            ? await connectorCtx.addLiquidityETH(
                pairedCoin,
                selectedCoinAmount,
                pairedCoinAmount
              )
            : !SafeMath.gt(pairedCoin.contract, 0)
            ? await connectorCtx.addLiquidityETH(
                selectedCoin,
                selectedCoinAmount,
                pairedCoinAmount
              )
            : selectedPool.token0.contract.toLowerCase() ===
              selectedCoin.contract.toLowerCase()
            ? await connectorCtx.provideLiquidity(
                selectedCoin,
                pairedCoin,
                selectedCoinAmount,
                pairedCoinAmount
              )
            : await connectorCtx.provideLiquidity(
                pairedCoin,
                selectedCoin,
                pairedCoinAmount,
                selectedCoinAmount
              );
          console.log(
            `provideLiquidityResut selectedPool`,
            provideLiquidityResut
          );
        } catch (error) {}
      } else {
        try {
          provideLiquidityResut = !SafeMath.gt(selectedCoin.contract, 0)
            ? await connectorCtx.addLiquidityETH(
                pairedCoin,
                selectedCoinAmount,
                pairedCoinAmount
              )
            : !SafeMath.gt(pairedCoin.contract, 0)
            ? await connectorCtx.addLiquidityETH(
                selectedCoin,
                selectedCoinAmount,
                pairedCoinAmount
              )
            : await connectorCtx.provideLiquidity(
                selectedCoin,
                pairedCoin,
                selectedCoinAmount,
                pairedCoinAmount
              );
          console.log(`provideLiquidityResut`, provideLiquidityResut);
        } catch (error) {}
      }
      history.push({ pathname: `/assets/` });
      setSelectedCoinIsApprove(true);
    }
  };

  useEffect(() => {
    if (
      !location.pathname.includes("/earn/") ||
      !connectorCtx.supportedTokens > 0
    )
      return;
    let active, passive;
    const tokensContract = location.pathname.replace("/earn/", "").split("/");
    console.log(`tokensContract`, tokensContract);
    if (tokensContract.length > 0) {
      if (tokensContract[0] !== selectedCoin?.contract) {
        active = connectorCtx.supportedTokens.find(
          (token) =>
            token.contract.toLowerCase() === tokensContract[0].toLowerCase()
        );
        setSelectedCoin(active);
      } else active = selectedCoin;
      if (!!tokensContract[1]) {
        if (tokensContract[1] !== pairedCoin?.contract) {
          passive = connectorCtx.supportedTokens.find(
            (token) =>
              token.contract.toLowerCase() === tokensContract[1].toLowerCase()
          );
        } else passive = pairedCoin;
        setPairedCoin(passive);
        console.log(`active`, active);
        console.log(`passive`, passive);
        connectorCtx.getSelectedPool(active, passive).then((pool) => {
          console.log(`pool`, pool);

          setSelectedPool(pool);
          // if (selectedCoinAmount)
          //   changeAmountHandler(
          //     selectedCoinAmount,
          //     "selected",
          //     pool,
          //     active,
          //     passive
          //   );
        });
      }
    }
    return () => {};
  }, [
    // changeAmountHandler,
    connectorCtx,
    connectorCtx.supportedTokens,
    location.pathname,
    pairedCoin,
    selectedCoin,
    selectedCoinAmount,
  ]);

  return (
    <form className={classes.earn} onSubmit={submitHandler}>
      <div className={classes.header}>Earn</div>
      <div className={classes.container}>
        <div className={classes.main}>
          <EarnPannel
            selectedPool={selectedPool}
            selectedCoin={selectedCoin}
            selectedCoinAmount={selectedCoinAmount}
            pairedCoin={pairedCoin}
            pairedCoinAmount={pairedCoinAmount}
            coinUpdateHandler={coinUpdateHandler}
            amountUpdateHandler={changeAmountHandler}
            approveHandler={approveHandler}
            selectedCoinIsApprove={selectedCoinIsApprove}
            displayApproveSelectedCoin={displayApproveSelectedCoin}
            pairedCoinIsApprove={pairedCoinIsApprove}
            displayApprovePairedCoin={displayApprovePairedCoin}
            details={getDetail(selectedPool)}
            summary={getSummary(
              selectedPool,
              {
                ...selectedCoin,
                amount: selectedCoinAmount,
              },
              { ...pairedCoin, amount: pairedCoinAmount },
              userCtx.fiat
            )}
            isLoading={isLoading}
          />
        </div>
        <div className={classes.sub}>
          <div className={classes.details}>
            <AssetDetail />
            <NetworkDetail />
          </div>
          <Pairs pools={providePoolOptions} onSelect={selectHandler} />
        </div>
      </div>
    </form>
  );
};

export default Earn;
