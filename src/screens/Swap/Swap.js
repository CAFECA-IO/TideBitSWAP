import React, { useState, useEffect, useContext, useCallback } from "react";
import NetworkDetail from "../../components/UI/NetworkDetail";
import ConnectorContext from "../../store/connector-context";
import { formateDecimal, coinPairUpdateHandler } from "../../Utils/utils";
import classes from "./Swap.module.css";
import SwapPannel from "./SwapPannel";
import { useHistory, useLocation } from "react-router";
import SafeMath from "../../Utils/safe-math";
import Histories from "../../components/UI/Histories";
import PriceChart from "../../components/UI/PriceChart";
import ErrorDialog from "../../components/UI/ErrorDialog";
import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";

const Swap = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isApprove, setIsApprove] = useState(false);
  const [displayApproveSelectedCoin, setDisplayApproveSelectedCoin] =
    useState(false);
  const location = useLocation();
  const history = useHistory();
  const [data, setData] = useState([]);
  const [histories, setHistories] = useState([]);
  const [selectedPool, setSelectedPool] = useState(null);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [allowanceAmount, setAllowanceAmount] = useState("0");
  const [selectedCoinAmount, setSelectedCoinAmount] = useState("");
  const [pairedCoin, setPairedCoin] = useState(null);
  const [pairedCoinAmount, setPairedCoinAmount] = useState("");
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [error, setError] = useState(null);
  const [currentNetwork, setCurrentNetwork] = useState(
    connectorCtx.currentNetwork
  );
  const [slippage, setSlippage] = useState({
    value: "0.1",
    message: "",
  });
  const [deadline, setDeadline] = useState("30");
  const [poolInsufficient, setPoolInsufficient] = useState(false);
  const [details, setDetails] = useState([]);
  const [lastAmountChangeType, setLastAmountChangeType] = useState([]);
  // const [openExpertMode, setOpenExpertMode] = useState(false);
  const [open, setOpen] = useState(false);
  const [transaction, setTransaction] = useState(null);

  const action = (transactionHash) => (
    <React.Fragment>
      {(connectorCtx.currentNetwork?.chainId === `0x1` ||
        connectorCtx.currentNetwork?.chainId === `0x3`) && (
        <Button
          color="secondary"
          size="small"
          onClick={() =>
            window.open(
              connectorCtx.currentNetwork?.chainId === `0x3`
                ? `https://ropsten.etherscan.io/tx/${transactionHash}`
                : connectorCtx.currentNetwork?.chainId === `0x1`
                ? `https://etherscan.io/tx/${transactionHash}`
                : "",
              "_blank"
            )
          }
        >
          View on Explorer
        </Button>
      )}
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={() => setOpen(false)}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  const getDetails = useCallback(
    async (pool, active, passive, slippage, lastAmountChangeType) => {
      if (!!details?.length && (!pool || !active || !passive)) return;

      let _price, _updatePrice, _impact, _updateAmountOut;
      if (pool && active?.amount && passive?.amount) {
        _price = SafeMath.div(active?.amount, passive?.amount);
        // _updatePrice = SafeMath.div(active?.amount, _updateAmountOut);
        try {
          _updateAmountOut = !pool.reverse
            ? SafeMath.lte(
                SafeMath.minus(pool.poolBalanceOfToken1, passive.amount),
                "0"
              )
              ? "0"
              : await connectorCtx.getAmountOut(
                  active.amount,
                  [pool.token0, pool.token1],
                  SafeMath.plus(pool.poolBalanceOfToken0, active.amount),
                  SafeMath.minus(pool.poolBalanceOfToken1, passive.amount)
                )
            : pool.reverse
            ? SafeMath.lte(
                SafeMath.minus(pool.poolBalanceOfToken0, passive.amount),
                "0"
              )
              ? "0"
              : await connectorCtx.getAmountOut(
                  active.amount,
                  [pool.token1, pool.token0],
                  SafeMath.plus(pool.poolBalanceOfToken1, active.amount),
                  SafeMath.minus(pool.poolBalanceOfToken0, passive.amount)
                )
            : null;
        } catch (error) {
          console.log(`getDetails error`, error);
        }

        _impact = SafeMath.mult(
          // SafeMath.minus(
          SafeMath.div(
            SafeMath.minus(_updateAmountOut, passive.amount),
            passive.amount
          ), //   "1"
          // ),
          "100"
        );
      }

      return [
        {
          title: "Price",
          value: `1 ${passive?.symbol || "--"} ≈ ${
            _price ? formateDecimal(_price, 16) : "--"
          } ${active?.symbol || "--"}`,
          explain:
            "Estimated price of the swap, not the final price that the swap is executed.",
        },
        {
          title: "Swap Fee",
          value: "0%", // ++TODO
          explain: "Trade transaction fee collected by liquidity providers.",
        },
        {
          title: "Price Impact",
          value: `${_impact ? formateDecimal(_impact, 6) : "--"} %`,
          explain:
            "The estimated percentage that the ultimate executed price of the swap deviates from current price due to trading amount.",
        },
        {
          title: "Allowed Slippage",
          value: slippage?.value ? `${slippage?.value}%` : "0.50%",
          explain:
            "The ultimate price and output is determined by the amount of tokens in the pool at the time of your swap.",
        },
        {
          title:
            lastAmountChangeType === "paired"
              ? "Maximum sent"
              : "Minimun Received",
          value:
            lastAmountChangeType === "paired"
              ? `${
                  passive?.amount
                    ? formateDecimal(
                        SafeMath.mult(
                          passive?.amount,
                          SafeMath.plus(
                            "1",
                            SafeMath.div(slippage?.value || "0.5", "100")
                          )
                        ),
                        18
                      )
                    : "--"
                }`
              : `${
                  passive?.amount
                    ? formateDecimal(
                        SafeMath.mult(
                          passive?.amount,
                          SafeMath.minus(
                            "1",
                            SafeMath.div(slippage?.value || "0.5", "100")
                          )
                        ),
                        18
                      )
                    : "--"
                } ${passive?.symbol || "--"}`,
          explain:
            lastAmountChangeType === "paired"
              ? `Input is estimated. You will sell at most maximum amount or the transaction will revert.`
              : `Output is estimated. You will receive at least minumun amount or the transaction will revert.`,
        },
      ];
    },
    [connectorCtx, details?.length]
  );
  const changeAmountHandler = useCallback(
    async ({ active, passive, activeAmount, passiveAmount, type, pool }) => {
      console.log(`activeAmount`, activeAmount);
      console.log(`passiveAmount`, passiveAmount);

      console.log(`active?.contract`, active?.contract);
      console.log(`passive?.contract`, passive?.contract);
      setIsLoading(true);
      setLastAmountChangeType(type);
      let updateSelectedAmount, updatePairedAmount, _pool, _active, _passive;
      _active = active || selectedCoin;
      _passive = passive || pairedCoin;
      _pool = pool || selectedPool;

      if (!_pool) {
        switch (type) {
          case "selected":
            setSelectedCoinAmount(activeAmount);
            setPairedCoinAmount("0");
            break;
          case "paired":
            setPairedCoinAmount(passiveAmount);
            setSelectedCoinAmount("0");
            break;
          default:
            break;
        }
        setDetails([]);
        setHistories([]);
        setIsLoading(false);
        return;
      }
      switch (type) {
        case "selected":
          updateSelectedAmount = activeAmount;
          console.log(`updateSelectedAmount`, updateSelectedAmount);
          setSelectedCoinAmount(updateSelectedAmount);
          try {
            updatePairedAmount =
              _pool && SafeMath.gt(updateSelectedAmount, "0")
                ? await connectorCtx.getAmountsOut(updateSelectedAmount, [
                    _active,
                    _passive,
                  ])
                : "0";
            setPoolInsufficient(false);
          } catch (error) {
            updatePairedAmount = "0";
            setPoolInsufficient(true);
            if (!window.ethereum) {
              setOpenErrorDialog(true);
              return;
            }
          }
          console.log(`updatePairedAmount`, updatePairedAmount);
          setPairedCoinAmount(updatePairedAmount);
          break;
        case "paired":
          updatePairedAmount = passiveAmount;
          setPairedCoinAmount(updatePairedAmount);
          console.log(`updatePairedAmount`, updatePairedAmount);

          try {
            updateSelectedAmount =
              _pool && SafeMath.gt(updatePairedAmount, "0")
                ? await connectorCtx.getAmountsIn(updatePairedAmount, [
                    _active,
                    _passive,
                  ])
                : "0";
            setPoolInsufficient(false);
          } catch (error) {
            updateSelectedAmount = "0";
            setPoolInsufficient(true);
            if (!window.ethereum) {
              setOpenErrorDialog(true);
              return;
            }
          }
          console.log(`updateSelectedAmount`, updateSelectedAmount);
          setSelectedCoinAmount(updateSelectedAmount);
          break;
        default:
          break;
      }
      const details = await getDetails(
        _pool,
        {
          ..._active,
          amount: updateSelectedAmount,
        },
        { ..._passive, amount: updatePairedAmount },
        slippage,
        type
      );
      console.log(`getDetails details`, details);
      setDetails(details);
      setIsLoading(false);
    },
    [connectorCtx, getDetails, pairedCoin, selectedCoin, selectedPool, slippage]
  );

  const tokenExchangerHander = async () => {
    setIsLoading(true);
    const active = pairedCoin;
    const passive = selectedCoin;
    setSelectedCoin(active);
    setPairedCoin(passive);
    switch (lastAmountChangeType) {
      case "selected":
        await changeAmountHandler({
          active,
          passive,
          passiveAmount: selectedCoinAmount,
          type: "paired",
        });
        break;
      case "paired":
        await changeAmountHandler({
          active,
          passive,
          activeAmount: pairedCoinAmount,
          type: "selected",
        });
        break;
      default:
    }
    if (selectedPool) {
      const data = await connectorCtx.getPoolPriceData(
        selectedPool.poolContract
      );
      setData(data);
    }
    setIsLoading(false);
  };

  const coinUpdateHandler = useCallback(
    async (token, type) => {
      let update, _active, _passive;
      setIsLoading(true);
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
              SafeMath.eq(token.contract.toLowerCase(), 0)
                ? !SafeMath.eq(t.contract.toLowerCase(), 0)
                : SafeMath.eq(t.contract.toLowerCase(), 0)
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
        pathname: `/swap/${_active.contract}/${
          _passive?.contract ? _passive.contract : ""
        }`,
      });
      let pool;
      if (_active && _passive) {
        setIsLoading(true);
        try {
          pool = await connectorCtx.searchPoolByTokens({
            token0: _active,
            token1: _passive,
          });
          setSelectedPool(pool);
        } catch (error) {
          console.log(error);
          if (!window.ethereum) {
            setOpenErrorDialog(true);
          }
          setIsLoading(false);
        }
      }
      await changeAmountHandler({
        activeAmount: selectedCoinAmount,
        passiveAmount: pairedCoinAmount,
        type,
        active: _active,
        passive: _passive,
        pool,
      });
      if (pool) {
        const details = await getDetails(
          pool,
          _active,
          _passive,
          slippage,
          type
        );
        console.log(`getDetails details`, details);
        setDetails(details);
        const histories = await connectorCtx.getPoolHistory(pool.poolContract);
        setHistories(histories);
        const data = await connectorCtx.getPoolPriceData(pool.poolContract);
        setData(data);
      }
      setIsLoading(false);
    },
    [
      changeAmountHandler,
      connectorCtx,
      getDetails,
      history,
      pairedCoin,
      pairedCoinAmount,
      selectedCoin,
      selectedCoinAmount,
      slippage,
    ]
  );
  useEffect(() => {
    if (connectorCtx.isConnected && connectorCtx.connectedAccount) {
      if (selectedCoin && !selectedCoin?.balanceOf) {
        setSelectedCoin(
          (prev) =>
            connectorCtx.supportedTokens.find(
              (token) =>
                SafeMath.gt(token.balanceOf, "0") &&
                prev.contract.toLowerCase() === token.contract.toLowerCase()
            ) || prev
        );
      }
    }
    return () => {};
  }, [
    connectorCtx.connectedAccount,
    connectorCtx.isConnected,
    connectorCtx.supportedTokens,
    selectedCoin,
  ]);

  useEffect(() => {
    if (connectorCtx.isConnected && connectorCtx.connectedAccount) {
      if (pairedCoin && !pairedCoin?.balanceOf) {
        setPairedCoin(
          (prev) =>
            connectorCtx.supportedTokens.find(
              (token) =>
                SafeMath.gt(token.balanceOf, "0") &&
                prev.contract.toLowerCase() === token.contract.toLowerCase()
            ) || prev
        );
      }
    }
    return () => {};
  }, [
    connectorCtx.connectedAccount,
    connectorCtx.isConnected,
    connectorCtx.supportedTokens,
    pairedCoin,
  ]);

  const setupCoins = useCallback(
    async (tokensContract) => {
      if (!connectorCtx.supportedTokens) return;
      if (tokensContract.length > 0) {
        let active, passive;
        if (
          /^0x[a-fA-F0-9]{40}$/.test(tokensContract[0]) &&
          tokensContract[0]?.toLowerCase() !==
            selectedCoin?.contract?.toLowerCase()
        ) {
          active = await connectorCtx.searchToken(tokensContract[0]);
          setSelectedCoin(active);
        }
        if (
          !!tokensContract[1] &&
          /^0x[a-fA-F0-9]{40}$/.test(tokensContract[1]) &&
          tokensContract[1]?.toLowerCase() !==
            pairedCoin?.contract?.toLowerCase()
        ) {
          passive = await connectorCtx.searchToken(tokensContract[1]);
          await coinUpdateHandler(passive, "paired");
        }
      }
    },
    [
      coinUpdateHandler,
      connectorCtx,
      pairedCoin?.contract,
      selectedCoin?.contract,
    ]
  );

  useEffect(() => {
    if (
      !location.pathname.includes("/swap/") ||
      !connectorCtx.supportedTokens > 0 ||
      !connectorCtx.supportedPools > 0 ||
      isLoading
    )
      return;
    console.log(`setupCoins isLoading`, isLoading);
    const tokensContract = location.pathname.replace("/swap/", "").split("/");
    setIsLoading(true);
    setupCoins(tokensContract).then((_) => {
      history.push({
        pathname: `/swap`,
      });
      setIsLoading(false);
    });
    return () => {};
  }, [
    connectorCtx.supportedPools,
    connectorCtx.supportedTokens,
    history,
    isLoading,
    location.pathname,
    setupCoins,
  ]);

  const getAllowanceAmount = async () => {
    const result = await connectorCtx.isAllowanceEnough(
      selectedCoin.contract,
      selectedCoinAmount,
      selectedCoin.decimals
    );
    console.log(`swap allowance`, result);
    if (result?.isEnough) setAllowanceAmount(result?.allowanceAmount);
    if (!isApprove) setDisplayApproveSelectedCoin(!result?.isEnough);
    return result?.isEnough;
  };

  const approveHandler = async () => {
    const result = await connectorCtx.approve(selectedCoin.contract);
    if (result) {
      setIsApprove(!!result);
      setDisplayApproveSelectedCoin(!result);
      let id = setInterval(async () => {
        let isEngouh = await getAllowanceAmount();
        if (isEngouh) clearInterval(id);
      }, 2500);
    }
  };

  useEffect(() => {
    console.log(`swap displayApproveSelectedCoin`, displayApproveSelectedCoin);
    if (
      selectedPool &&
      SafeMath.gt(selectedCoinAmount, "0") &&
      SafeMath.gt(selectedCoin?.balanceOf || "0", selectedCoinAmount) &&
      SafeMath.gt(selectedCoinAmount, allowanceAmount || "0") &&
      !displayApproveSelectedCoin
    ) {
      if (SafeMath.eq(selectedCoin?.contract, "0")) {
        setDisplayApproveSelectedCoin(false);
        setIsApprove(true);
        setAllowanceAmount(
          0xfffffffffffffffffffffffffffffffffffffffffffffff41837d86eeb3dd741
        );
      } else {
        connectorCtx
          .isAllowanceEnough(
            selectedCoin.contract,
            selectedCoinAmount,
            selectedCoin.decimals
          )
          .then((result) => {
            console.log(`swap allowance`, result);
            if (SafeMath.gt(result?.allowanceAmount, "0")) {
              setAllowanceAmount(result?.allowanceAmount);
              setIsApprove(true);
            }
            if (!isApprove) setDisplayApproveSelectedCoin(!result?.isEnough);
          });
      }
    }

    return () => {
      // console.log("CLEANUP");
    };
  }, [
    isApprove,
    connectorCtx,
    selectedPool,
    selectedCoin,
    selectedCoinAmount,
    allowanceAmount,
    displayApproveSelectedCoin,
  ]);

  useEffect(() => {
    if (currentNetwork?.chainId !== connectorCtx.currentNetwork?.chainId)
      setCurrentNetwork((prevState) => {
        console.log(`connectorCtx.currentNetwork`, connectorCtx.currentNetwork);
        if (prevState.chainId !== connectorCtx.currentNetwork?.chainId) {
          setSelectedCoin(null);
          setSelectedPool(null);
          setPairedCoin(null);
          setSelectedCoinAmount("");
          setPairedCoinAmount("");
          setHistories([]);
          setSlippage({
            value: "0.5",
            message: "",
          });
          setDetails([]);
          setData([]);
          history.push({
            pathname: `/swap`,
          });
          return connectorCtx.currentNetwork;
        } else return prevState;
      });
    return () => {};
  }, [connectorCtx.currentNetwork, currentNetwork?.chainId, history]);

  const swapHandler = async (event) => {
    event.preventDefault();
    if (isApprove) {
      setIsApprove(false);
      try {
        const result = await connectorCtx.swap(
          selectedCoinAmount,
          pairedCoinAmount,
          [selectedCoin, pairedCoin],
          slippage?.value,
          deadline,
          lastAmountChangeType
        );
        console.log(`result`, result);
        // ++ TODO snaker bar
        setTransaction(result);
        setOpen(true);
        setSelectedCoinAmount("0");
        setPairedCoinAmount("0");
        let id = setTimeout(() => {
          setOpen(false);
          clearTimeout(id);
        }, 5000);
      } catch (error) {
        setError(error);
        setOpenErrorDialog(true);
      }
      setIsApprove(true);
    }
  };

  const slippageChangeHander = async (event) => {
    let value = +event.target.value < 0 ? "0" : event.target.value;

    setSlippage({
      value,
      message: `${
        SafeMath.gt(value, 1) ? "Your transaction may be frontrun" : ""
      }`,
    });
    const details = await getDetails(
      selectedPool,
      {
        ...selectedCoin,
        amount: selectedCoinAmount,
      },
      { ...pairedCoin, amount: pairedCoinAmount },
      {
        value,
        message: `${
          SafeMath.gt(value, 1) ? "Your transaction may be frontrun" : ""
        }`,
        lastAmountChangeType,
      }
    );
    setDetails(details);
  };

  const slippageAutoHander = async () => {
    setSlippage({
      value: "0.1",
      message: "",
    });
    const details = await getDetails(
      selectedPool,
      {
        ...selectedCoin,
        amount: selectedCoinAmount,
      },
      { ...pairedCoin, amount: pairedCoinAmount },
      {
        value: "0.1",
        message: "",
      },
      lastAmountChangeType
    );
    setDetails(details);
  };

  const deadlineChangeHander = (event) => {
    let value = +event.target.value < 0 ? "0" : event.target.value;

    setDeadline(value);
  };
  // const expertModeChangeHandler = () => {};

  return (
    <React.Fragment>
      {open && (
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={open}
          autoHideDuration={6000}
          onClose={() => setOpen(false)}
          message={`Swap ${
            lastAmountChangeType === "selected" ? "exact" : ""
          } ${transaction?.token0AmountChange} ${
            transaction?.token0.symbol
          } for ${lastAmountChangeType === "paired" ? "exact" : ""} ${
            transaction?.token1AmountChange
          } ${transaction?.token1.symbol}`}
          action={action(transaction?.transactionHash)}
        />
      )}
      {openErrorDialog && (
        <ErrorDialog
          message={`From Swap.js ${error?.message || error?.toString()}`}
          onConfirm={() => setOpenErrorDialog(false)}
        />
      )}
      <form className="page" onSubmit={swapHandler}>
        <div className="header-bar">
          <div className="header">Swap</div>
          <NetworkDetail shrink={true} />
        </div>
        <div className={classes.container}>
          <div className={classes.main}>
            <SwapPannel
              selectedPool={selectedPool}
              selectedCoin={selectedCoin}
              selectedCoinAmount={selectedCoinAmount}
              pairedCoin={pairedCoin}
              pairedCoinAmount={pairedCoinAmount}
              coinUpdateHandler={coinUpdateHandler}
              changeAmountHandler={changeAmountHandler}
              tokenExchangerHander={tokenExchangerHander}
              slippage={slippage}
              slippageChangeHander={slippageChangeHander}
              slippageAutoHander={slippageAutoHander}
              deadline={deadline}
              deadlineChangeHander={deadlineChangeHander}
              // openExpertMode={openExpertMode}
              // expertModeChangeHandler={expertModeChangeHandler}
              approveHandler={approveHandler}
              isApprove={isApprove}
              displayApproveSelectedCoin={displayApproveSelectedCoin}
              details={details}
              isLoading={isLoading}
              poolInsufficient={poolInsufficient}
              allowanceAmount={allowanceAmount}
            />
          </div>
          <div className={classes.sub}>
            {selectedPool && <PriceChart data={data} />}
            <Histories
              histories={histories}
              isLoading={selectedPool && isLoading}
            />
          </div>
        </div>
      </form>
    </React.Fragment>
  );
};

export default Swap;
