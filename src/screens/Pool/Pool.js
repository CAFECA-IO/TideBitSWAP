import React, { useContext, useState, useEffect, useCallback } from "react";
import NetworkDetail from "../../components/UI/NetworkDetail";

import classes from "./Pool.module.css";
import ConnectorContext from "../../store/connector-context";
import { useHistory, useLocation } from "react-router";
import { formateDecimal } from "../../Utils/utils";
import LoadingDialog from "../../components/UI/LoadingDialog";
import Chart from "react-apexcharts";
import TraderContext from "../../store/trader-context";
import SafeMath from "../../Utils/safe-math";
import HistoryTable from "../../components/Table/HistoryTable";

const Pool = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const traderCtx = useContext(TraderContext);
  const location = useLocation();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(true);
  const [pool, setPool] = useState(null);
  const [price, setPrice] = useState("--");
  const [reversePrice, setReversePrice] = useState("--");
  const [data, setData] = useState([]);
  const [histories, setHistories] = useState([]);

  const getPoolInfo = useCallback(
    async (contract) => {
      if (!/^0x[a-fA-F0-9]{40}$/.test(contract))
        history.push({ pathname: `/` });
      // setIsLoading(true);
      const pool = await connectorCtx.searchPoolByPoolContract(contract);
      if (pool) {
        setPool(pool);
        let price, reversePrice;
        try {
          price = await connectorCtx.getAmountsOut("1", [
            pool.token0,
            pool.token1,
          ]);
        } catch (error) {
          console.log(`getPoolInfo error`, error);
          price = "--";
        }
        setPrice(price);
        try {
          reversePrice = await connectorCtx.getAmountsOut("1", [
            pool.token1,
            pool.token0,
          ]);
        } catch (error) {
          console.log(`getPoolInfo error`, error);
          reversePrice = "--";
        }
        setReversePrice(reversePrice);
        setIsLoading(false);
        const data = await connectorCtx.getPriceData(contract);
        setData(data);
        const histories = await connectorCtx.getPoolHistory(contract);
        console.log(`getPoolHistory histories`, histories);
        setHistories(histories);
      }
      // console.log(`isLoading`, isLoading);
    },
    [connectorCtx, history]
  );

  useEffect(() => {
    // console.log(`isLoading`, isLoading);
    console.log(
      `location.pathname.includes("/pool/")`,
      location.pathname.includes("/pool/")
    );
    console.log(
      `location.pathname.replace("/pool/", "")`,
      location.pathname.replace("/pool/", "")
    );
    console.log(
      `pool?.poolContract !== location.pathname.replace("/pool/", "")`,
      pool?.poolContract !== location.pathname.replace("/pool/", "")
    );
    if (
      location.pathname.includes("/pool/") &&
      pool?.poolContract !== location.pathname.replace("/pool/", "") &&
      connectorCtx.supportedPools.length > 0
    ) {
      getPoolInfo(location.pathname.replace("/pool/", "")).then((_) => {
        // console.log(`isLoading`, isLoading);
      });
    }
    return () => {};
  }, [
    connectorCtx.supportedPools.length,
    getPoolInfo,
    location.pathname,
    pool?.poolContract,
  ]);

  return (
    <React.Fragment>
      {isLoading && <LoadingDialog />}
      <div className={classes.pool}>
        <div className={classes.header}>Pool</div>
        <div className={classes.leading}>
          <div className={classes.group}>
            <div className={classes.icons}>
              <div className={classes.icon}>
                <img src={pool?.token0?.iconSrc} alt={pool?.token0?.symbol} />
              </div>
              <div className={classes.icon}>
                <img src={pool?.token1?.iconSrc} alt={pool?.token1?.symbol} />
              </div>
            </div>
            <div className={classes.title}>{pool?.name || "--"}</div>
            <div
              className={`${classes.tag} ${
                !pool?.irr?.includes("-") ? classes.increase : classes.decrease
              }`}
            >
              {pool?.irr
                ? formateDecimal(SafeMath.mult(pool?.irr, "100"), 2)
                : "--"}
              %
            </div>
          </div>
          <NetworkDetail shrink={true} />
        </div>
        <div className={classes.leading}>
          <div className={classes.group}>
            <div className={`${classes.tag}`}>
              <div className={classes.icon}>
                <img src={pool?.token0?.iconSrc} alt={pool?.token0?.symbol} />
              </div>
              <div>{`1 ${pool?.token0?.symbol || ""} = ${formateDecimal(
                price,
                8
              )} ${pool?.token1?.symbol || ""}`}</div>
            </div>
            <div className={`${classes.tag}`}>
              <div className={classes.icon}>
                <img src={pool?.token1?.iconSrc} alt={pool?.token1?.symbol} />
              </div>
              <div>{`1 ${pool?.token1?.symbol || ""} = ${formateDecimal(
                reversePrice,
                8
              )} ${pool?.token0?.symbol || ""}`}</div>
            </div>
          </div>
          <div className={classes.action}>
            <a
              className={classes.tag}
              href={`#/add-liquidity/${pool?.token0?.contract}/${pool?.token1?.contract}`}
            >
              Add Liquidity
            </a>
            <a
              className={classes.tag}
              href={`#/swap/${pool?.token0?.contract}/${pool?.token1?.contract}`}
            >
              Swap
            </a>
          </div>
        </div>
        <div className={classes.main}>
          <div className={classes.container}>
            <div className={classes.info}>
              <div className={classes["info-title"]}>Total Tokens Locked</div>
              <div className={classes["info-tile"]}>
                <div className={classes.group}>
                  <div className={classes.icon}>
                    <img
                      src={pool?.token0?.iconSrc}
                      alt={pool?.token0?.symbol}
                    />
                  </div>
                  <div className={classes.title}>{pool?.token0?.symbol}</div>
                </div>
                <div className={classes["info-value"]}>
                  {pool?.poolBalanceOfToken0
                    ? formateDecimal(pool?.poolBalanceOfToken0, 6)
                    : "--"}
                </div>
              </div>
              <div className={classes["info-tile"]}>
                <div className={classes.group}>
                  <div className={classes.icon}>
                    <img
                      src={pool?.token1?.iconSrc}
                      alt={pool?.token1?.symbol}
                    />
                  </div>
                  <div className={classes.title}>{pool?.token1?.symbol}</div>
                </div>
                <div className={classes["info-value"]}>
                  {pool?.poolBalanceOfToken1
                    ? formateDecimal(pool?.poolBalanceOfToken1, 6)
                    : "--"}
                </div>
              </div>
            </div>
            <div className={classes["data-detail"]}>
              <div className={classes["data-title"]}>TVL</div>
              <div className={classes["data-value"]}>
                {`${traderCtx.fiat.dollarSign} ${
                  pool?.tvl?.value ? formateDecimal(pool?.tvl.value, 8) : "--"
                }`}
              </div>
              <div
                className={`${classes["data-change"]} ${
                  pool?.tvl?.change.includes("-")
                    ? classes.decrease
                    : classes.increase
                }`}
              >
                {pool?.tvl?.change
                  ? formateDecimal(
                      SafeMath.mult(
                        pool?.tvl?.change.includes("+") ||
                          pool?.tvl?.change.includes("-")
                          ? pool?.tvl?.change.slice(1)
                          : pool?.tvl?.change,
                        "100"
                      ),
                      3
                    )
                  : "--"}
                %
              </div>
            </div>
            <div className={classes["data-detail"]}>
              <div className={classes["data-title"]}>Volume 24h</div>
              <div className={classes["data-value"]}>
                {`${traderCtx.fiat.dollarSign} ${
                  pool?.volume?.value
                    ? formateDecimal(pool?.volume.value, 8)
                    : "--"
                }`}
              </div>
              <div
                className={`${classes["data-change"]} ${
                  pool?.volume?.change.includes("-")
                    ? classes.decrease
                    : classes.increase
                }`}
              >
                {pool?.volume?.change
                  ? formateDecimal(
                      SafeMath.mult(
                        pool?.volume?.change.includes("+") ||
                          pool?.volume?.change.includes("-")
                          ? pool?.volume?.change.slice(1)
                          : pool?.volume?.change,
                        "100"
                      ),
                      3
                    )
                  : "--"}
                %
              </div>
            </div>
            <div className={classes["data-detail"]}>
              <div className={classes["data-title"]}>24h Fees</div>
              <div className={classes["data-value"]}>
                ${pool?.fee24?.value ? formateDecimal(pool?.fee24?.value, 4) : "--"}
              </div>
              <div className={classes["data-change"]}></div>
            </div>
          </div>
          <div className={classes.container}>
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
        </div>
        <HistoryTable
          histories={histories}
          isLoading={(pool && isLoading) || connectorCtx.isLoading}
        />
      </div>
    </React.Fragment>
  );
};

export default Pool;
