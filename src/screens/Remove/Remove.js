import React, { useState, useContext, useEffect, useCallback } from "react";
import NetworkDetail from "../../components/UI/NetworkDetail";
import ConnectorContext from "../../store/connector-context";
import SafeMath from "../../Utils/safe-math";
import classes from "./Remove.module.css";
import RemovePannel from "./RemovePannel";
import { useHistory, useLocation } from "react-router";
import { amountUpdateHandler, formateDecimal } from "../../Utils/utils";
import Histories from "../../components/UI/Histories";
import ErrorDialog from "../../components/UI/ErrorDialog";
import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";

const getDetails = (pool, shareAmount) => [
  {
    title: pool?.token0?.symbol,
    value: pool?.poolBalanceOfToken0,
  },
  {
    title: pool?.token1?.symbol,
    value: pool?.poolBalanceOfToken1,
  },
  {
    title: "Take share",
    value: `${
      pool?.balanceOf
        ? formateDecimal(
            SafeMath.mult(SafeMath.div(shareAmount, pool?.balanceOf), 100),
            4
          )
        : "--"
    } %`,
  },
  {
    title: "Price",
    value: `1 ${pool?.token0?.symbol || "--"} ≈ ${
      pool
        ? formateDecimal(
            SafeMath.div(pool?.poolBalanceOfToken1, pool?.poolBalanceOfToken0),
            4
          )
        : "--"
    } ${pool?.token1?.symbol || "--"}`,
  },
  {
    title: "Price",
    value: `1 ${pool?.token1?.symbol || "--"} ≈ ${
      pool
        ? formateDecimal(
            SafeMath.div(pool?.poolBalanceOfToken0, pool?.poolBalanceOfToken1),
            4
          )
        : "--"
    } ${pool?.token0?.symbol || "--"}`,
  },
  {
    title: "Your pool share",
    value: `${
      pool?.share ? formateDecimal(SafeMath.mult(pool?.share, 100), 4) : "0"
    } %`,
    explain:
      "The estimated percentage that the ultimate executed price of the swap deviates from current price due to trading amount.",
  },
];

const Remove = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const [selectedPool, setSelectedPool] = useState(null);
  const [coinOptions, setCoinOptions] = useState([]);
  const [shareAmount, setShareAmount] = useState("");
  const [poolAllowance, setPoolAllowance] = useState("0");

  const history = useHistory();
  const location = useLocation();
  const [displayApprovePoolContract, setDisplayApprovePoolContract] =
    useState(false);
  const [poolContractIsApprove, setPoolContractIsApprove] = useState(false);
  const [isValid, setIsValid] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [takePoolOptions, setTakePoolOptions] = useState([]);
  const [histories, setHistories] = useState([]);
  const [slippage, setSlippage] = useState({
    value: "5",
    message: "",
  });
  const [deadline, setDeadline] = useState("30");
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [error, setError] = useState(null);
  const [timer, setTimer] = useState(null);
  const [open, setOpen] = useState(false);
  const [transaction, setTransaction] = useState(null);
  const action = (transactionHash) => (
    <React.Fragment>
      {(connectorCtx.currentNetwork.chainId === `0x1` ||
        connectorCtx.currentNetwork.chainId === `0x3`) && (
        <Button
          color="secondary"
          size="small"
          onClick={() =>
            window.open(
              connectorCtx.currentNetwork.chainId === `0x3`
                ? `https://ropsten.etherscan.io/tx/${transactionHash}`
                : connectorCtx.currentNetwork.chainId === `0x1`
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

  useEffect(() => {
    const matchedAssetPools = connectorCtx.supportedPools?.filter((pool) =>
      SafeMath.gt(pool.share, "0")
    );
    setTakePoolOptions(matchedAssetPools);
    return () => {};
  }, [connectorCtx.supportedPools]);

  const approveHandler = async () => {
    if (selectedPool?.poolContract) {
      const coinApproved = await connectorCtx.approve(
        selectedPool.poolContract
      );
      setPoolContractIsApprove(coinApproved);
      setDisplayApprovePoolContract(!coinApproved);
    } else {
      console.log(`approveHandler selectedPool`, selectedPool);
    }
  };

  const selectHandler = async (pool) => {
    setSelectedPool(pool);
    history.push({ pathname: `/redeem-liquidity/${pool.poolContract}` });
    const histories = await connectorCtx.getPoolHistory(pool.poolContract);
    setHistories(histories);
    if (shareAmount) {
      shareAmountChangedHandler(shareAmount);
    }
  };

  const shareAmountChangedHandler = (amount) => {
    const shareAmount = amountUpdateHandler(
      amount,
      selectedPool?.balanceOf || "0"
    );
    setShareAmount(shareAmount);
    let isShareValid = +shareAmount === 0 ? null : +shareAmount > 0;
    if (isShareValid) {
      setIsValid(isShareValid);
      const coinOptions = [
        {
          ...selectedPool.token0,
          amount: SafeMath.mult(
            SafeMath.div(shareAmount, selectedPool.totalSupply),
            selectedPool.poolBalanceOfToken0
          ),
        },
        {
          ...selectedPool.token1,
          amount: SafeMath.mult(
            SafeMath.div(shareAmount, selectedPool.totalSupply),
            selectedPool.poolBalanceOfToken1
          ),
        },
      ];
      setCoinOptions(coinOptions);
    }
  };

  const slippageAutoHander = () => {
    setSlippage({
      value: "5",
      message: "",
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
  };

  const deadlineChangeHander = (event) => {
    let value = +event.target.value < 0 ? "0" : event.target.value;

    setDeadline(value);
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    console.log(`submitHandler`);
    if (poolContractIsApprove) {
      setPoolContractIsApprove(false);
      try {
        const takeLiquidityResult = !SafeMath.gt(
          selectedPool.token0.contract,
          0
        )
          ? await connectorCtx.removeLiquidityETH(
              selectedPool,
              selectedPool.token1,
              shareAmount,
              SafeMath.mult(
                SafeMath.div(shareAmount, selectedPool.totalSupply),
                selectedPool.poolBalanceOfToken1
              ),
              SafeMath.mult(
                SafeMath.div(shareAmount, selectedPool.totalSupply),
                selectedPool.poolBalanceOfToken0
              ),
              slippage?.value,
              deadline
            )
          : !SafeMath.gt(selectedPool.token1.contract, 0)
          ? await connectorCtx.removeLiquidityETH(
              selectedPool,
              selectedPool.token0,
              shareAmount,
              SafeMath.mult(
                SafeMath.div(shareAmount, selectedPool.totalSupply),
                selectedPool.poolBalanceOfToken0
              ),
              SafeMath.mult(
                SafeMath.div(shareAmount, selectedPool.totalSupply),
                selectedPool.poolBalanceOfToken1
              ),
              slippage?.value,
              deadline
            )
          : await connectorCtx.takeLiquidity(
              selectedPool,
              shareAmount,
              SafeMath.mult(
                SafeMath.div(shareAmount, selectedPool.totalSupply),
                selectedPool.poolBalanceOfToken0
              ),
              SafeMath.mult(
                SafeMath.div(shareAmount, selectedPool.totalSupply),
                selectedPool.poolBalanceOfToken1
              ),
              slippage?.value,
              deadline
            );
        console.log(`takeLiquidityResult`, takeLiquidityResult);
        setTransaction(takeLiquidityResult);
        setOpen(true);
        let id = setTimeout(() => {
          setOpen(false);
          clearTimeout(id);
        }, 5000);
      } catch (error) {
        setError(error);
        setOpenErrorDialog(true);
      }
      setPoolContractIsApprove(true);
    }
  };

  useEffect(() => {
    let id;
    if (timer) clearTimeout(timer);
    if (
      isValid &&
      SafeMath.gt(shareAmount, poolAllowance) &&
      !displayApprovePoolContract
    ) {
      setIsLoading(true);
      id = setTimeout(
        connectorCtx
          .isAllowanceEnough(
            selectedPool.poolContract,
            shareAmount,
            selectedPool.decimals
          )
          .then((result) => {
            setPoolAllowance(result?.allowanceAmount);
            setDisplayApprovePoolContract(!result?.isEnough);
            setPoolContractIsApprove(result?.isEnough);
            setIsLoading(false);
          })
      );
      setTimer(id);
    }
    return () => {};
  }, [
    connectorCtx,
    isValid,
    selectedPool?.poolContract,
    selectedPool?.decimals,
    shareAmount,
    poolAllowance,
    timer,
    displayApprovePoolContract,
  ]);

  const getPoolInfo = useCallback(
    async (contract) => {
      let pool;
      pool = connectorCtx.supportedPools.find(
        (pool) => contract.toLowerCase() === pool.poolContract.toLowerCase()
      );
      setSelectedPool(pool);
      if (pool) {
        const histories = await connectorCtx.getPoolHistory(pool.poolContract);
        setHistories(histories);
      }
    },
    [connectorCtx]
  );

  useEffect(() => {
    if (
      !location.pathname.includes("/redeem-liquidity/") ||
      selectedPool?.poolContract.toLowerCase() ===
        location.pathname.replace("/redeem-liquidity/", "").toLowerCase()
    )
      return;
    const poolContract = location.pathname.replace("/redeem-liquidity/", "");
    console.log(`getPoolInfo poolContract`, poolContract);
    if (!/^0x[a-fA-F0-9]{40}$/.test(poolContract))
      history.push({ pathname: `/` });
    else getPoolInfo(poolContract);
    return () => {};
  }, [
    connectorCtx.supportedPools,
    getPoolInfo,
    history,
    location.pathname,
    selectedPool?.poolContract,
  ]);

  return (
    <React.Fragment>
      {open && (
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={open}
          autoHideDuration={6000}
          onClose={() => setOpen(false)}
          message={`Take ${transaction?.token0AmountChange} ${transaction?.token0.symbol} &  ${transaction?.token1AmountChange} ${transaction?.token1.symbol} from pool.`}
          action={action(transaction?.transactionHash)}
        />
      )}
      {openErrorDialog && (
        <ErrorDialog
          message={error.message}
          onConfirm={() => setOpenErrorDialog(false)}
        />
      )}
      <form className="page" onSubmit={submitHandler}>
        <div className="header-bar">
          <div className="header">Remove</div>
          <NetworkDetail shrink={true} />
        </div>
        <div className={classes.container}>
          <div className={classes.main}>
            <RemovePannel
              selectedPool={selectedPool}
              coinOptions={coinOptions}
              pools={takePoolOptions}
              onSelect={selectHandler}
              isLoading={isLoading}
              approveHandler={approveHandler}
              shareAmount={shareAmount}
              changeAmountHandler={shareAmountChangedHandler}
              displayApprovePoolContract={displayApprovePoolContract}
              poolContractIsApprove={poolContractIsApprove}
              details={getDetails(selectedPool, shareAmount)}
              slippage={slippage}
              slippageChangeHander={slippageChangeHander}
              slippageAutoHander={slippageAutoHander}
              deadline={deadline}
              deadlineChangeHander={deadlineChangeHander}
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

export default Remove;
