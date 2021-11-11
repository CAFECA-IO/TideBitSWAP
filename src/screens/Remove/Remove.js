import React, { useState, useContext, useEffect } from "react";
import AssetDetail from "../../components/UI/AssetDetail";
import NetworkDetail from "../../components/UI/NetworkDetail";
import ConnectorContext from "../../store/connector-context";
import UserContext from "../../store/user-context";
import SafeMath from "../../Utils/safe-math";
import Pairs from "./Pairs";
import classes from "./Remove.module.css";
import RemovePannel from "./RemovePannel";
import { useHistory } from "react-router";

const Remove = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const userCtx = useContext(UserContext);
  const [selectedPool, setSelectedPool] = useState(null);
  const history = useHistory();
  const [displayApprovePoolContract, setDisplayApprovePoolContract] =
    useState(false);
  const [poolContractIsApprove, setPoolContractIsApprove] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const approveHandler = async (contract, callback) => {
    const coinApproved = await connectorCtx.approve(contract);
    callback(coinApproved);
  };

  const selectHandler = (pool) => {
    setSelectedPool(pool);
    history.push({ pathname: `/earn/${pool.contract}` });
  };

  useEffect(() => {
    setSelectedPool(
      userCtx.supportedPools.find((pool) =>
        history.location.pathname.includes(pool.contract)
      )
    );
    return () => {};
  }, [history.location.pathname, userCtx.supportedPools]);

  return (
    <div className={classes.earn}>
      <div className={classes.header}>Remove</div>
      <div className={classes.container}>
        <div className={classes.main}>
          <RemovePannel
            selectedPool={selectedPool}
            pools={userCtx.supportedPools.filter((pool) =>
              SafeMath.gt(pool.share, "0")
            )}
            onSelect={selectHandler}
            isLoading={isLoading}
            approveHandler={approveHandler}
            displayApprovePoolContract={displayApprovePoolContract}
            setDisplayApprovePoolContract={setDisplayApprovePoolContract}
            poolContractIsApprove={poolContractIsApprove}
            setPoolContractIsApprove={setPoolContractIsApprove}
          />
        </div>
        <div className={classes.sub}>
          <div className={classes.details}>
            <AssetDetail
              account={connectorCtx.connectedAccount}
              balance={`${userCtx.totalBalance} ETH`}
              balanceInFiat={`${userCtx.fiat.dollarSign} ${SafeMath.mult(
                userCtx.totalBalance,
                userCtx.fiat.exchangeRate
              )}`}
            />
            <NetworkDetail chainName={connectorCtx.currentNetwork.chainName} />
          </div>
          <Pairs pools={userCtx.supportedPools} onSelect={selectHandler} />
          {/* <Pairs pools={dummyPools} /> */}
        </div>
      </div>
    </div>
  );
};

export default Remove;
