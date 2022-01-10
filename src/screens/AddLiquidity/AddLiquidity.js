import React, { useContext, useState, useEffect, useCallback } from "react";
import NetworkDetail from "../../components/UI/NetworkDetail";
import ConnectorContext from "../../store/connector-context";
import SafeMath from "../../Utils/safe-math";
import classes from "./AddLiquidity.module.css";
import AddLiquidityPannel from "./AddLiquidityPannel";
import { useHistory, useLocation } from "react-router";
import { coinPairUpdateHandler, formateDecimal } from "../../Utils/utils";
import Histories from "../../components/UI/Histories";
import ErrorDialog from "../../components/UI/ErrorDialog";
import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";

const AddLiquidity = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const [slippage, setSlippage] = useState({
    value: "0.5",
    message: "",
  });
  const [histories, setHistories] = useState([]);
  const [deadline, setDeadline] = useState("30");
  const [selectedPool, setSelectedPool] = useState(null);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [selectedCoinAmount, setSelectedCoinAmount] = useState("");
  const [selectedCoinAllowance, setSelectedCoinAllowance] = useState("0");
  const [selectedCoinIsApprove, setSelectedCoinIsApprove] = useState(false);
  const [displayApproveSelectedCoin, setDisplayApproveSelectedCoin] =
    useState(false);
  const [pairedCoin, setPairedCoin] = useState(null);
  const [pairedCoinAmount, setPairedCoinAmount] = useState("");
  const [pairedCoinAllowance, setPairedCoinAllowance] = useState("0");
  const [pairedCoinIsApprove, setPairedCoinIsApprove] = useState(false);
  const [displayApprovePairedCoin, setDisplayApprovePairedCoin] =
    useState(false);
  const history = useHistory();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [detail, setDetail] = useState([]);
  const [summary, setSummary] = useState([]);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [error, setError] = useState(null);
  const [currentNetwork, setCurrentNetwork] = useState(
    connectorCtx.currentNetwork
  );
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

  const dataUpdateHandler = useCallback(
    async ({ pool, selectedCoin, pairedCoin, slippage }) => {
      console.log(`dataUpdateHandler selectedCoin`, selectedCoin);
      console.log(`dataUpdateHandler pairedCoin`, pairedCoin);
      setDetail(
        pool
          ? [
              {
                title: `${pool?.token0?.symbol || "--"} per ${
                  pool?.token1?.symbol || "--"
                }`,
                value: `${formateDecimal(
                  SafeMath.div(
                    pool?.poolBalanceOfToken1,
                    pool?.poolBalanceOfToken0
                  ),
                  8
                )}`,
              },
              {
                title: `${pool?.token1?.symbol || "--"} per ${
                  pool?.token0?.symbol || "--"
                }`,
                value: `${formateDecimal(
                  SafeMath.div(
                    pool?.poolBalanceOfToken0,
                    pool?.poolBalanceOfToken1
                  ),
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
          : []
      );
      setSummary(
        !pool
          ? [
              {
                title: "Initial prices",
                value: `1 ${selectedCoin?.symbol || "--"} ≈ ${
                  !!selectedCoin?.amount && !!pairedCoin?.amount
                    ? SafeMath.div(selectedCoin?.amount, pairedCoin?.amount)
                    : "--"
                } ${pairedCoin?.symbol || "--"}`,
                explain:
                  "Estimated price of the swap, not the final price that the swap is executed.",
              },
              {
                title: "Initial prices",
                value: `1 ${pairedCoin?.symbol || "--"} ≈ ${
                  !!selectedCoin?.amount && !!pairedCoin?.amount
                    ? SafeMath.div(pairedCoin?.amount, selectedCoin?.amount)
                    : "--"
                } ${selectedCoin?.symbol || "--"}`,
                explain:
                  "Estimated price of the swap, not the final price that the swap is executed.",
              },
              {
                title: "Share of the pool",
                value: `${
                  !!selectedCoin?.amount && !!pairedCoin?.amount ? "100" : "0"
                } %`,
                explain:
                  "The estimated percentage that the ultimate executed price of the swap deviates from current price due to trading amount.",
              },
              {
                title: "Total yield",
                value: "--",
                explain:
                  "Trade transaction fee collected by liquidity providers.",
              },
            ]
          : [
              {
                title: pool?.token0?.symbol,
                value: SafeMath.plus(
                  pool?.poolBalanceOfToken0,
                  !pool.reverse
                    ? selectedCoin?.amount || "0"
                    : pairedCoin?.amount || "0"
                ),
              },
              {
                title: pool?.token1?.symbol,
                value: SafeMath.plus(
                  pool?.poolBalanceOfToken1,
                  !pool.reverse
                    ? pairedCoin?.amount || "0"
                    : selectedCoin?.amount || "0"
                ),
              },
              {
                title: "Share of the pool",
                value: `${
                  selectedCoin?.amount
                    ? formateDecimal(
                        SafeMath.mult(
                          SafeMath.div(
                            selectedCoin?.amount,
                            SafeMath.plus(
                              pool?.poolBalanceOfToken0,
                              selectedCoin?.contract === pool?.token0.contract
                                ? selectedCoin?.amount || "0"
                                : pairedCoin?.amount || "0"
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
                explain:
                  "Trade transaction fee collected by liquidity providers.",
              },
            ]
      );
      if (pool) {
        const histories = await connectorCtx.getPoolHistory(pool.poolContract);
        setHistories(histories);
      }
    },
    [connectorCtx]
  );

  const changeAmountHandler = useCallback(
    async ({ activeAmount, passiveAmount, type, active, passive, pool }) => {
      let _active, _passive, result;
      _active = active || selectedCoin;
      _passive = passive || pairedCoin;
      switch (type) {
        case "selected":
          setSelectedCoinAmount(activeAmount);
          console.log(`formateAddLiquidity updateSelectedAmount`, activeAmount);
          result = connectorCtx.formateAddLiquidity({
            pool,
            tokenA: _active,
            tokenB: _passive,
            amountADesired: activeAmount,
            amountBDesired: pairedCoinAmount,
            type,
          });
          console.log(`formateAddLiquidity result`, result);

          setPairedCoinAmount(result.amountBDesired);

          break;
        case "paired":
          console.log(`formateAddLiquidity type`, type);
          console.log(`formateAddLiquidity passiveAmount`, passiveAmount);
          console.log(
            `formateAddLiquidity _passive.balanceOf`,
            _passive.balanceOf
          );
          setPairedCoinAmount(passiveAmount);
          result = connectorCtx.formateAddLiquidity({
            pool,
            tokenA: _active,
            tokenB: _passive,
            amountADesired: selectedCoinAmount,
            amountBDesired: passiveAmount,
            type,
          });
          console.log(`formateAddLiquidity result`, result);
          setSelectedCoinAmount(result.amountADesired);
          break;
        default:
          break;
      }
      await dataUpdateHandler({
        pool,
        selectedCoin: { ..._active, amount: result.amountADesired },
        pairedCoin: { ..._passive, amount: result.amountBDesired },
        slippage,
      });
    },
    [
      connectorCtx,
      dataUpdateHandler,
      pairedCoin,
      pairedCoinAmount,
      selectedCoin,
      selectedCoinAmount,
      slippage,
    ]
  );

  const coinUpdateHandler = useCallback(
    async ({ active, passive, type }) => {
      let update, _active, _passive;
      _active = active || selectedCoin;
      _passive = passive || pairedCoin;
      setSelectedPool(null);
      setDetail([]);
      setSummary([]);
      setHistories([]);
      switch (type) {
        case "selected":
          update = coinPairUpdateHandler(
            active,
            pairedCoin,
            connectorCtx.supportedTokens
          );
          ({ active: _active, passive: _passive } = update);
          break;
        case "paired":
          if (!_active) {
            _active = connectorCtx.supportedTokens.find((t) =>
              SafeMath.gt(passive.contract, 0)
                ? SafeMath.gt(t.contract, 0)
                : !SafeMath.gt(t.contract, 0) &&
                  t.contract !== connectorCtx.nativeCurrency?.contract
            );
            _passive = passive;
          } else {
            update = coinPairUpdateHandler(
              passive,
              _active,
              connectorCtx.supportedTokens
            );
            ({ active: _passive, passive: _active } = update);
          }
          break;
        default:
          break;
      }
      setSelectedCoin(_active);
      setPairedCoin(_passive);
      let pool;
      if (_active && _passive) {
        setIsLoading(true);
        try {
          pool = await connectorCtx.searchPoolByTokens({
            token0: _active,
            token1: _passive,
          });
          console.log(`%%% coinUpdateHandler pool`, pool);
          setSelectedPool(pool);
        } catch (error) {
          console.log(error);
          if (!window.ethereum) {
            setOpenErrorDialog(true);
          }
          setIsLoading(false);
        }
      }
      await dataUpdateHandler({
        pool,
        selectedCoin: { ..._active, amount: selectedCoinAmount },
        pairedCoin: { ..._passive, amount: pairedCoinAmount },
        slippage,
      });
      await changeAmountHandler({
        pool,
        activeAmount: selectedCoinAmount,
        passiveAmount: pairedCoinAmount,
        type,
        active: _active,
        passive: _passive,
      });
      setIsLoading(false);
    },
    [
      changeAmountHandler,
      connectorCtx,
      dataUpdateHandler,
      pairedCoin,
      pairedCoinAmount,
      selectedCoin,
      selectedCoinAmount,
      slippage,
    ]
  );

  const slippageAutoHander = async () => {
    setSlippage({
      value: "0.5",
      message: "",
    });
    await dataUpdateHandler({
      pool: selectedPool,
      selectedCoin: { ...selectedCoin, amount: selectedCoinAmount },
      pairedCoin: { ...pairedCoin, amount: pairedCoinAmount },
      slippage: {
        value: "0.5",
        message: "",
      },
    });
  };

  const slippageChangeHander = async (event) => {
    let value = +event.target.value < 0 ? "0" : event.target.value;

    setSlippage({
      value,
      message: `${
        SafeMath.gt(value, 1) ? "Your transaction may be frontrun" : ""
      }`,
    });

    await dataUpdateHandler({
      pool: selectedPool,
      selectedCoin: { ...selectedCoin, amount: selectedCoinAmount },
      pairedCoin: { ...pairedCoin, amount: pairedCoinAmount },
      slippage: {
        value,
        message: "",
      },
    });
  };

  const deadlineChangeHander = (event) => {
    let value = +event.target.value < 0 ? "0" : event.target.value;

    setDeadline(value);
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    if (selectedCoinIsApprove) {
      setSelectedCoinIsApprove(false);
      let provideLiquidityResut;
      try {
        provideLiquidityResut = await connectorCtx.provideLiquidity({
          tokenA: selectedCoin,
          tokenB: pairedCoin,
          amountADesired: selectedCoinAmount,
          amountBDesired: pairedCoinAmount,
          slippage: slippage?.value,
          deadline,
          create: !selectedPool,
          reverse: selectedPool ? selectedPool.reverse : false,
        });
        console.log(`provideLiquidityResut`, provideLiquidityResut);
        // ++ TODO snaker bar
        setTransaction(provideLiquidityResut);
        setSelectedCoinAmount("0");
        setPairedCoinAmount("0");
        setSelectedCoinIsApprove(false);
        setPairedCoinIsApprove(false);
        setOpen(true);
        let id = setTimeout(() => {
          setOpen(false);
          clearTimeout(id);
        }, 5000);
      } catch (error) {
        console.log(`error`, error);
        setError(error);
        setOpenErrorDialog(true);
      }
      setSelectedCoinIsApprove(true);
    }
  };

  const getSelectedCoinAllowanceAmount = useCallback(async () => {
    const result = await connectorCtx.isAllowanceEnough(
      selectedCoin.contract,
      selectedCoinAmount,
      selectedCoin.decimals
    );
    console.log(`swap allowance`, result);
    if (result?.isEnough) {
      setSelectedCoinAllowance(result?.allowanceAmount);
      setSelectedCoinIsApprove(true);
    }
    if (!selectedCoinIsApprove)
      setDisplayApproveSelectedCoin(!result?.isEnough);
    return result?.isEnough;
  }, [
    connectorCtx,
    selectedCoin?.contract,
    selectedCoin?.decimals,
    selectedCoinAmount,
    selectedCoinIsApprove,
  ]);

  const getPairedCoinAllowanceAmount = useCallback(async () => {
    const result = await connectorCtx.isAllowanceEnough(
      pairedCoin.contract,
      pairedCoinAmount,
      pairedCoin.decimals
    );
    console.log(`swap allowance`, result);
    if (result?.isEnough) {
      setPairedCoinAllowance(result?.allowanceAmount);
      setPairedCoinIsApprove(true);
    }
    if (!pairedCoinIsApprove) setDisplayApprovePairedCoin(!result?.isEnough);
    return result?.isEnough;
  }, [
    connectorCtx,
    pairedCoin?.contract,
    pairedCoin?.decimals,
    pairedCoinAmount,
    pairedCoinIsApprove,
  ]);

  const approveHandler = async (contract, type) => {
    const coinApproved = await connectorCtx.approve(contract);
    let id, isEngouh;
    if (coinApproved) {
      switch (type) {
        case "selected":
          setSelectedCoinIsApprove(!!coinApproved);
          setDisplayApproveSelectedCoin(!coinApproved);
          id = setInterval(async () => {
            isEngouh = await getSelectedCoinAllowanceAmount();
            if (isEngouh) clearInterval(id);
          }, 2500);

          break;
        case "paired":
          setPairedCoinIsApprove(!!coinApproved);
          setDisplayApprovePairedCoin(!coinApproved);
          id = setInterval(async () => {
            isEngouh = await getPairedCoinAllowanceAmount();
            if (isEngouh) clearInterval(id);
          }, 2500);

          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    if (
      selectedCoin?.balanceOf &&
      SafeMath.gt(selectedCoinAmount || "0", "0") &&
      SafeMath.gt(selectedCoin.balanceOf, selectedCoinAmount) &&
      SafeMath.gt(selectedCoinAmount, selectedCoinAllowance || "0") &&
      !displayApproveSelectedCoin
    ) {
      if (!SafeMath.gt(selectedCoin?.contract, "0")) {
        setDisplayApproveSelectedCoin(false);
        setSelectedCoinIsApprove(true);
        setSelectedCoinAllowance(
          0xfffffffffffffffffffffffffffffffffffffffffffffff41837d86eeb3dd741
        );
      } else {
        getSelectedCoinAllowanceAmount();
      }
    }
    return () => {};
  }, [
    displayApproveSelectedCoin,
    getSelectedCoinAllowanceAmount,
    selectedCoin?.balanceOf,
    selectedCoin?.contract,
    selectedCoinAllowance,
    selectedCoinAmount,
  ]);

  useEffect(() => {
    if (
      pairedCoin?.balanceOf &&
      SafeMath.gt(pairedCoinAmount || "0", "0") &&
      SafeMath.gt(pairedCoin.balanceOf, pairedCoinAmount) &&
      SafeMath.gt(pairedCoinAmount, pairedCoinAllowance || "0") &&
      !displayApprovePairedCoin
    ) {
      if (!SafeMath.gt(pairedCoin?.contract, "0")) {
        setDisplayApprovePairedCoin(false);
        setPairedCoinIsApprove(true);
        setPairedCoinAllowance(
          0xfffffffffffffffffffffffffffffffffffffffffffffff41837d86eeb3dd741
        );
      } else {
        getPairedCoinAllowanceAmount();
      }
    }
    return () => {};
  }, [
    displayApprovePairedCoin,
    getPairedCoinAllowanceAmount,
    pairedCoin?.balanceOf,
    pairedCoin?.contract,
    pairedCoinAllowance,
    pairedCoinAmount,
  ]);

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
      let active, passive;
      if (
        /^0x[a-fA-F0-9]{40}$/.test(tokensContract[0]) &&
        tokensContract[0]?.toLowerCase() !==
          selectedCoin?.contract?.toLowerCase()
      ) {
        active = await connectorCtx.searchToken(tokensContract[0]);
        console.log(`setupCoins active`, active);
        setSelectedCoin(active);
      }
      if (
        !!tokensContract[1] &&
        /^0x[a-fA-F0-9]{40}$/.test(tokensContract[1]) &&
        tokensContract[1]?.toLowerCase() !== pairedCoin?.contract?.toLowerCase()
      ) {
        passive = await connectorCtx.searchToken(tokensContract[1]);
        await coinUpdateHandler({ active, passive, type: "paired" });
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
      !location.pathname.includes("/add-liquidity/") ||
      !connectorCtx.supportedTokens > 0 ||
      !connectorCtx.supportedPools > 0 ||
      isLoading
    )
      return;
    console.log(`setupCoins isLoading`, isLoading);
    const tokensContract = location.pathname
      .replace("/add-liquidity/", "")
      .split("/");
    setIsLoading(true);
    setupCoins(tokensContract).then((_) => {
      history.push({
        pathname: `/add-liquidity`,
      });
      setIsLoading(false);
    });
    return () => {};
  }, [
    connectorCtx.supportedPools,
    connectorCtx.supportedTokens,
    isLoading,
    history,
    location.pathname,
    setupCoins,
  ]);

  useEffect(() => {
    if (currentNetwork?.chainId !== connectorCtx.currentNetwork?.chainId)
      setCurrentNetwork((prevState) => {
        console.log(`prevState`, prevState);
        console.log(`connectorCtx.currentNetwork`, connectorCtx.currentNetwork);
        if (
          !prevState ||
          prevState.chainId !== connectorCtx.currentNetwork?.chainId
        ) {
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
          dataUpdateHandler({
            pool: null,
            selectedCoin: null,
            pairedCoin: null,
          });
          return connectorCtx.currentNetwork;
        } else return prevState;
      });
    return () => {};
  }, [connectorCtx.currentNetwork, currentNetwork?.chainId, dataUpdateHandler]);

  return (
    <React.Fragment>
      {open && (
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={open}
          autoHideDuration={6000}
          onClose={() => setOpen(false)}
          message={`Add ${transaction?.token0AmountChange} ${transaction?.token0.symbol} &  ${transaction?.token1AmountChange} ${transaction?.token1.symbol} to pool.`}
          action={action(transaction?.transactionHash)}
        />
      )}
      {openErrorDialog && (
        <ErrorDialog
          message={`From AddLiquidity.js ${
            error?.message || error?.toString()
          }`}
          onConfirm={() => setOpenErrorDialog(false)}
        />
      )}
      <form className="page" onSubmit={submitHandler}>
        <div className="header-bar">
          <div className="header">Add</div>
          <NetworkDetail shrink={true} />
        </div>
        <div className={classes.container}>
          <div className={classes.main}>
            <AddLiquidityPannel
              selectedPool={selectedPool}
              selectedCoin={selectedCoin}
              selectedCoinAmount={selectedCoinAmount}
              selectedCoinAllowance={selectedCoinAllowance}
              pairedCoin={pairedCoin}
              pairedCoinAmount={pairedCoinAmount}
              pairedCoinAllowance={pairedCoinAllowance}
              coinUpdateHandler={coinUpdateHandler}
              changeAmountHandler={changeAmountHandler}
              approveHandler={approveHandler}
              selectedCoinIsApprove={selectedCoinIsApprove}
              displayApproveSelectedCoin={displayApproveSelectedCoin}
              pairedCoinIsApprove={pairedCoinIsApprove}
              displayApprovePairedCoin={displayApprovePairedCoin}
              slippage={slippage}
              slippageChangeHander={slippageChangeHander}
              slippageAutoHander={slippageAutoHander}
              deadline={deadline}
              deadlineChangeHander={deadlineChangeHander}
              details={detail}
              summary={summary}
              isLoading={isLoading}
            />
          </div>
          <div className={classes.sub}>
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

export default AddLiquidity;
