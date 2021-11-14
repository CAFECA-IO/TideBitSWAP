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

const ImportToken = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const userCtx = useContext(UserContext);
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(null);

  const approveHandler = async (contract, callback) => {
    const coinApproved = await connectorCtx.approve(contract);
    callback(coinApproved);
  };

  const changeAmountHandler = (v, pool) => {};
  const changePriceHandler = (v, pool) => {};

  const submitHandler = async (event) => {
    event.preventDefault();
    console.log(`submitHandler`);
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

  return (
    <React.Fragment>
      {isLoading && <LoadingDialog />}
      <form className={classes["import-token"]} onSubmit={submitHandler}>
        <div className={classes.header}>Import Token</div>
        <div className={classes.container}>
          <div className={classes.main}>
            <ImportTokenPannel token={token}/>
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
