import React, { useContext, useState, useEffect } from "react";
import AssetDetail from "../../components/UI/AssetDetail";
import NetworkDetail from "../../components/UI/NetworkDetail";
import ConnectorContext from "../../store/connector-context";
import UserContext from "../../store/user-context";
import SafeMath from "../../Utils/safe-math";
import classes from "./ImportToken.module.css";
import ImportTokenPannel from "./ImportTokenPannel";
import { useLocation } from "react-router";
import LoadingDialog from "../../components/UI/LoadingDialog";
import { amountUpdateHandler } from "../../Utils/utils";

const ImportToken = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const userCtx = useContext(UserContext);
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [importTokenIsApprove, setImportTokenIsApprove] = useState(false);
  const [displayApproveImportToken, setDisplayApproveImportToken] =
    useState(false);
  const [isValid, setIsValid] = useState(false);

  const approveHandler = async (contract, callback) => {
    const coinApproved = await connectorCtx.approve(contract);
    callback(coinApproved);
  };

  const changeAmountHandler = (v) => {
    const amount = amountUpdateHandler(v, token.balanceOf);
    setAmount(amount);
    setIsValid(+amount === 0 ? null : +amount > 0);
  };
  const changePriceHandler = (price) => {
    setPrice(price);
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    console.log(`submitHandler`);
    if (importTokenIsApprove) {
      setImportTokenIsApprove(false);
      let result;
      try {
        result = await connectorCtx.createPair(
          token.contract,
          userCtx.assets[0].contract
        );
        console.log(`result`, result);
      } catch (error) {
        setImportTokenIsApprove(true);
      }
      if (result) {
        setImportTokenIsApprove(false);
        // setSubCoinIsApprove(false);
        try {
          const provideLiquidityResut = await connectorCtx.provideLiquidity(
            token,
            userCtx.assets[0].contract,
            amount,
            "1"
          );
          console.log(`provideLiquidityResut`, provideLiquidityResut);
          props.onClose();
        } catch (error) {}
        setImportTokenIsApprove(true);
      }
    }
  };

  useEffect(() => {
    let token = userCtx.assets.find((asset) =>
      location.pathname.includes(asset.contract)
    );
    if (!token) {
      setIsLoading(true);
      connectorCtx
        .addToken(location.pathname.replace("/import-token/", ""))
        .then((token) => {
          setToken(token);
          setIsLoading(false);
        });
    }
  }, [connectorCtx, location, userCtx.assets]);

  useEffect(() => {
    console.log("Checking mainCoinAllowanceIsEnough!");
    if (isValid) {
      setIsLoading(true);
      connectorCtx
        .isAllowanceEnough(token.contract, amount, token.decimals)
        .then((tokenAllowanceIsEnough) => {
          setDisplayApproveImportToken(!tokenAllowanceIsEnough);
          setImportTokenIsApprove(tokenAllowanceIsEnough);
          setIsLoading(false);
        });
    }
    return () => {
      console.log("CLEANUP");
    };
  }, [amount, connectorCtx, isValid, token.contract, token.decimals]);

  return (
    <React.Fragment>
      {isLoading && <LoadingDialog />}
      <form className={classes["import-token"]} onSubmit={submitHandler}>
        <div className={classes.header}>Import Token</div>
        <div className={classes.container}>
          <div className={classes.main}>
            <ImportTokenPannel
              token={token}
              changeAmountHandler={changeAmountHandler}
              amount={amount}
              changePriceHandler={changePriceHandler}
              price={price}
              setDisplayApproveImportToken={setDisplayApproveImportToken}
              displayApproveImportToken={displayApproveImportToken}
              approveHandler={approveHandler}
              setImportTokenIsApprove={setImportTokenIsApprove}
              importTokenIsApprove={importTokenIsApprove}
              isLoading={isLoading}
            />
          </div>
          <div className={classes.sub}>
            <div className={classes.details}>
              <AssetDetail />
              <NetworkDetail />
            </div>
          </div>
        </div>
      </form>
    </React.Fragment>
  );
};

export default ImportToken;
