import React, { useContext, useState, useEffect } from "react";
import NetworkDetail from "../../components/UI/NetworkDetail";
import UserContext from "../../store/user-context";
import Histories from "./Histories";

import classes from "./Asset.module.css";
import ConnectorContext from "../../store/connector-context";
import { useHistory, useLocation } from "react-router";
import { addressFormatter } from "../../Utils/utils";
import LoadingDialog from "../../components/UI/LoadingDialog";
import Chart from "react-apexcharts";
import {
  getDummyCandleStickData,
  randomCandleStickData,
} from "../../Utils/utils";

const Asset = (props) => {
  const userCtx = useContext(UserContext);
  const connectorCtx = useContext(ConnectorContext);
  const location = useLocation();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [investToken, setInvestToken] = useState(null);
  const [data, setData] = useState(getDummyCandleStickData());

  useEffect(() => {
    console.log(`connectorCtx.supportedTokens:`, connectorCtx.supportedTokens);
    setIsLoading(true);
    let token = connectorCtx.supportedTokens.find((asset) =>
      location.pathname.includes(asset.contract)
    );
    console.log(`token:`, token);
    if (!token) {
      connectorCtx
        .addToken(location.pathname.replace("/asset/", ""))
        .then((token) => {
          if (token) {
            setToken(token);
            setData(getDummyCandleStickData(randomCandleStickData()));
            console.log(`token:`, token);
          } else {
            history.push({ pathname: `/` });
          }
          setIsLoading(false);
        });
    } else {
      setToken(token);
      const investToken = connectorCtx.supportedPools.find(
        (pool) =>
          pool.token0.contract === token.contract ||
          pool.token1.contract === token.contract
      );
      console.log(`investToken:`, investToken);
      if (investToken) {
        setInvestToken(investToken);
      }
      setIsLoading(false);
    }
    return () => {};
  }, [connectorCtx, connectorCtx.supportedTokens, history, location.pathname]);

  return (
    <React.Fragment>
      {isLoading && <LoadingDialog />}
      <div className={classes.asset}>
        <div className={classes.header}>My Assets</div>
        <div className={classes.container}>
          <div className={classes.main}>
            {!isLoading && (
              <div className={classes.info}>
                <div className={classes.leading}>
                  <div className={classes.group}>
                    <div className={classes.icon}>
                      <img src={token.iconSrc} alt={`${token.symbol}`} />
                    </div>
                    <div
                      className={classes.title}
                    >{`${token.name} (${token.symbol})`}</div>
                  </div>
                  <div className={classes.tag}>{`${addressFormatter(
                    token.contract
                  )}`}</div>
                </div>
                <div className={classes.leading}>
                  <div className={`${classes.data} ${classes.bold}`}>{`${
                    userCtx.fiat.dollarSign
                  } ${token.price.value || "--"}`}</div>
                  <div
                    className={`${classes.data} ${
                      token.price.change.includes("+")
                        ? classes.increase
                        : classes.decrease
                    }`}
                  >
                    {`${token.price.change.slice(1) || "--"}`} %
                  </div>
                  <div className={classes.action}>
                    <a
                      className={classes.tag}
                      href={`#/swap/${token.contract}`}
                    >
                      Swap
                    </a>
                    <a
                      className={classes.tag}
                      href={`#/earn/${token.contract}`}
                    >
                      Invest
                    </a>
                  </div>
                </div>
              </div>
            )}
            <NetworkDetail />
          </div>
          <div className={classes.sub}>
            {token?.contract && (
              <div className={classes.container}>
                <div className={classes.details}>
                  {investToken && (
                    <div className={classes["data-row"]}>
                      <div className={classes["data-detail"]}>
                        <div className={classes["data-title"]}>TVL</div>
                        <div className={classes["data-value"]}>
                          {`${userCtx.fiat.dollarSign} ${investToken.tvl.value}`}
                        </div>
                        <div
                          className={`${classes["data-change"]} ${
                            investToken.tvl.change.includes("+")
                              ? classes.increase
                              : classes.decrease
                          }`}
                        >
                          {`${investToken.tvl.change.slice(1) || "--"}`} %
                        </div>
                      </div>
                      <div className={classes["data-detail"]}>
                        <div className={classes["data-title"]}>IRR</div>
                        <div className={classes["data-value"]}>
                          {`${investToken.irr} %`}
                        </div>
                        <div className={classes["data-change"]}></div>
                      </div>
                    </div>
                  )}
                  <div className={classes["data-row"]}>
                    <div className={classes["data-detail"]}>
                      <div className={classes["data-title"]}>
                        24h Trading Vol
                      </div>
                      <div className={classes["data-value"]}>
                        {`${userCtx.fiat.dollarSign} ${token.volume.value}`}
                      </div>
                      <div
                        className={`${classes["data-change"]} ${
                          token.volume.change.includes("+")
                            ? classes.increase
                            : classes.decrease
                        }`}
                      >
                        {`${token.volume.change.slice(1) || "--"}`} %
                      </div>
                    </div>
                    {investToken && (
                      <div className={classes["data-detail"]}>
                        <div className={classes["data-title"]}>
                          24h Investing Vol
                        </div>
                        <div className={classes["data-value"]}>
                          {`${userCtx.fiat.dollarSign} ${investToken.tvl.value}`}
                        </div>
                        <div
                          className={`${classes["data-change"]} ${
                            investToken.volume.change.includes("+")
                              ? classes.increase
                              : classes.decrease
                          }`}
                        >
                          {`${investToken.volume.change.slice(1) || "--"}`} %
                        </div>
                      </div>
                    )}
                  </div>
                  <div className={classes["data-row"]}>
                    {investToken && (
                      <div className={classes["data-detail"]}>
                        <div className={classes["data-title"]}>
                          24h Investment Interest
                        </div>
                        <div className={classes["data-value"]}>
                          {" "}
                          {`${userCtx.fiat.dollarSign} ${investToken.interest24}`}
                        </div>
                        <div className={classes["data-change"]}></div>
                      </div>
                    )}
                  </div>
                </div>
                <div className={classes.chart}>
                  <Chart
                    options={data.options}
                    series={data.series}
                    type="candlestick"
                    height={350}
                  />
                </div>
              </div>
            )}
            <Histories histories={userCtx.histories} />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Asset;
