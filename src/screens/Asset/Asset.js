import React, { useContext, useState, useEffect } from "react";
import NetworkDetail from "../../components/UI/NetworkDetail";
import Histories from "./Histories";

import classes from "./Asset.module.css";
import ConnectorContext from "../../store/connector-context";
import { useHistory, useLocation } from "react-router";
import { addressFormatter, formateDecimal } from "../../Utils/utils";
import LoadingDialog from "../../components/UI/LoadingDialog";
import Chart from "react-apexcharts";
import { randomCandleStickData } from "../../Utils/utils";

const Asset = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const location = useLocation();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [investToken, setInvestToken] = useState(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    let id, contract;
    // if (location.pathname.includes("/asset/") && !id) {
    if (location.pathname.includes("/asset/") && !data.length) {
      contract = location.pathname.replace("/asset/", "");
      console.log(
        `getPriceData /^0x[a-fA-F0-9]{40}$/.test(contract)`,
        /^0x[a-fA-F0-9]{40}$/.test(contract)
      );

      if (/^0x[a-fA-F0-9]{40}$/.test(contract)) {
        connectorCtx
          .getPriceData(contract)
          .then((data) => {
            console.log(`getPriceData`, data);
            setData(data);
          })
          .catch((error) => {
            let data = randomCandleStickData();
            console.log(`getPriceData`, data);
            setData(data);
          });
        // id = setInterval(() => {
        //   console.log(`getPriceData`);
        //   connectorCtx.getPriceData(contract).then((data) => {
        //     console.log(`getPriceData`, data);
        //     setData(data);
        //   });
        // }, 15000);
        // console.log(id);
      }
    }
    return () => {
      clearInterval(id);
    };
  }, [connectorCtx, data.length, location.pathname]);

  useEffect(() => {
    if (
      location.pathname.includes("/asset/") &&
      token?.contract !== location.pathname.replace("/asset/", "")
    ) {
      setIsLoading(true);
      connectorCtx
        .searchToken(location.pathname.replace("/asset/", ""))
        .then((token) => {
          if (token) {
            setToken(token);
            console.log(`token:`, token);
          } else {
            history.push({ pathname: `/` });
          }
          setIsLoading(false);
          const investToken = connectorCtx.supportedPools.find(
            (pool) =>
              pool.token0.contract === token.contract ||
              pool.token1.contract === token.contract
          );
          console.log(`investToken:`, investToken);
          if (investToken) {
            setInvestToken(investToken);
          }
        });
    }
    return () => {};
  }, [
    connectorCtx,
    connectorCtx.supportedTokens,
    history,
    location.pathname,
    token?.contract,
  ]);

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
                    connectorCtx.fiat.dollarSign
                  } ${
                    formateDecimal(token.priceToEth.value, 12) || "--"
                  }`}</div>
                  <div
                    className={`${classes.data} ${
                      token.priceToEth.change.includes("+")
                        ? classes.increase
                        : classes.decrease
                    }`}
                  >
                    {`${token.priceToEth.change.slice(1) || "--"}`} %
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
                      href={`#/add-liquidity/${token.contract}`}
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
                          {`${connectorCtx.fiat.dollarSign} ${formateDecimal(
                            investToken.tvl.value,
                            8
                          )}`}
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
                        {`${connectorCtx.fiat.dollarSign} ${formateDecimal(
                          token.volume.value,
                          8
                        )}`}
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
                          {`${connectorCtx.fiat.dollarSign} ${formateDecimal(
                            investToken.tvl.value,
                            8
                          )}`}
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
                          {`${connectorCtx.fiat.dollarSign} ${formateDecimal(
                            investToken.interest24,
                            8
                          )}`}
                        </div>
                        <div className={classes["data-change"]}></div>
                      </div>
                    )}
                  </div>
                </div>
                <div className={classes.chart}>
                  <Chart
                    options={{
                      chart: {
                        type: "candlestick",
                        height: 350,
                        toolbar: {
                          show: false,
                        },
                      },
                      xaxis: {
                        type: "datetime",
                      },
                      yaxis: {
                        tooltip: {
                          enabled: true,
                        },
                      },
                    }}
                    series={[
                      {
                        data,
                      },
                    ]}
                    type="candlestick"
                    height={350}
                  />
                </div>
              </div>
            )}
            <Histories histories={connectorCtx.histories} />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Asset;
