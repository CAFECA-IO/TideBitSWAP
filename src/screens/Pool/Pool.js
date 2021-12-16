import React, { useContext, useState, useEffect } from "react";
import NetworkDetail from "../../components/UI/NetworkDetail";
import Histories from "./Histories";

import classes from "./Pool.module.css";
import ConnectorContext from "../../store/connector-context";
import { useHistory, useLocation } from "react-router";
import { addressFormatter, formateDecimal } from "../../Utils/utils";
import LoadingDialog from "../../components/UI/LoadingDialog";
import Chart from "react-apexcharts";
import TraderContext from "../../store/trader-context";

const Pool = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const traderCtx = useContext(TraderContext);
  const location = useLocation();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(true);
  const [pool, setPool] = useState(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (
      location.pathname.includes("/pool/") &&
      pool?.contract !== location.pathname.replace("/pool/", "")
    ) {
      setIsLoading(true);
      connectorCtx
        .searchPoolByPoolContract(location.pathname.replace("/pool/", ""))
        .then((pool) => {
          if (pool) {
            setPool(pool);
            console.log(`pool:`, pool);
            console.log(`pool?.contract:`, pool?.contract);
            if (pool?.contract) {
              connectorCtx.getPriceData(pool.contract).then((data) => {
                console.log(`getPriceData`, data);
                setData(data);
              });
            }
          } else {
            history.push({ pathname: `/` });
          }
          setIsLoading(false);
        });
    }
    return () => {};
  }, [
    connectorCtx,
    connectorCtx.supportedPools,
    history,
    location.pathname,
    pool?.contract,
  ]);

  return (
    <React.Fragment>
      {isLoading && <LoadingDialog />}
      <div className={classes.asset}>
        <div className={classes.header}>Pool</div>
        <div className={classes.container}>
          <div className={classes.main}>
            {!isLoading && (
              <div className={classes.info}>
                <div className={classes.leading}>
                  <div className={classes.group}>
                    <div className={classes.icons}>
                      <div className={classes.icon}>
                        <img
                          src={pool.token0.iconSrc}
                          alt={`${pool.token0.symbol}`}
                        />
                      </div>
                      <div className={classes.icon}>
                        <img
                          src={pool.token1.iconSrc}
                          alt={`${pool.token1.symbol}`}
                        />
                      </div>
                    </div>
                    <div className={classes.title}>{`${pool.name})`}</div>
                  </div>
                  <div className={classes.tag}>{`${addressFormatter(
                    pool.contract
                  )}`}</div>
                </div>
                <div className={classes.leading}>
                  <div className={`${classes.data} ${classes.bold}`}>{`${
                    traderCtx.fiat.dollarSign
                  } ${
                    formateDecimal(
                      traderCtx.getPrice(pool.priceToEth.value),
                      12
                    ) || "--"
                  }`}</div>
                  <div
                    className={`${classes.data} ${
                      pool.priceToEth.change.includes("+")
                        ? classes.increase
                        : classes.decrease
                    }`}
                  >
                    {`${pool.priceToEth.change.slice(1) || "--"}`} %
                  </div>
                  <div className={classes.action}>
                    <a className={classes.tag} href={`#/swap/${pool.contract}`}>
                      Swap
                    </a>
                    <a
                      className={classes.tag}
                      href={`#/add-liquidity/${pool.contract}`}
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
            <div className={classes.container}>
              <div className={classes.details}>
                {pool && (
                  <div className={classes["data-row"]}>
                    <div className={classes["data-detail"]}>
                      <div className={classes["data-title"]}>TVL</div>
                      <div className={classes["data-value"]}>
                        {`${traderCtx.fiat.dollarSign} ${formateDecimal(
                          pool.tvl.value,
                          8
                        )}`}
                      </div>
                      <div
                        className={`${classes["data-change"]} ${
                          pool.tvl.change.includes("+")
                            ? classes.increase
                            : classes.decrease
                        }`}
                      >
                        {`${pool.tvl.change.slice(1) || "--"}`} %
                      </div>
                    </div>
                    <div className={classes["data-detail"]}>
                      <div className={classes["data-title"]}>IRR</div>
                      <div className={classes["data-value"]}>
                        {`${formateDecimal(pool.irr, 4)} %`}
                      </div>
                      <div className={classes["data-change"]}></div>
                    </div>
                  </div>
                )}
                <div className={classes["data-row"]}>
                  <div className={classes["data-detail"]}>
                    <div className={classes["data-title"]}>24h Trading Vol</div>
                    <div className={classes["data-value"]}>
                      {`${traderCtx.fiat.dollarSign} ${formateDecimal(
                        pool.volume.value,
                        8
                      )}`}
                    </div>
                    <div
                      className={`${classes["data-change"]} ${
                        pool.volume.change.includes("+")
                          ? classes.increase
                          : classes.decrease
                      }`}
                    >
                      {`${pool.volume.change.slice(1) || "--"}`} %
                    </div>
                  </div>
                  {pool && (
                    <div className={classes["data-detail"]}>
                      <div className={classes["data-title"]}>
                        24h Investing Vol
                      </div>
                      <div className={classes["data-value"]}>
                        {`${traderCtx.fiat.dollarSign} ${formateDecimal(
                          pool.tvl.value,
                          8
                        )}`}
                      </div>
                      <div
                        className={`${classes["data-change"]} ${
                          pool.volume.change.includes("+")
                            ? classes.increase
                            : classes.decrease
                        }`}
                      >
                        {`${pool.volume.change.slice(1) || "--"}`} %
                      </div>
                    </div>
                  )}
                </div>
                <div className={classes["data-row"]}>
                  {pool && (
                    <div className={classes["data-detail"]}>
                      <div className={classes["data-title"]}>
                        24h Investment Interest
                      </div>
                      <div className={classes["data-value"]}>
                        {" "}
                        {`${traderCtx.fiat.dollarSign} ${formateDecimal(
                          pool.interest24,
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
            )
            <Histories histories={connectorCtx.histories} />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Pool;
