import React, { useContext, useState, useEffect, useCallback } from "react";
import NetworkDetail from "../../components/UI/NetworkDetail";
import Histories from "./Histories";

import classes from "./Asset.module.css";
import ConnectorContext from "../../store/connector-context";
import { useHistory, useLocation } from "react-router";
import { addressFormatter, formateDecimal } from "../../Utils/utils";
import LoadingDialog from "../../components/UI/LoadingDialog";
import Chart from "react-apexcharts";
import TraderContext from "../../store/trader-context";
import SafeMath from "../../Utils/safe-math";
import InvestTable from "../../components/Table/InvestTable";

const Asset = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const traderCtx = useContext(TraderContext);
  const location = useLocation();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [data, setData] = useState([]);
  const [histories, setHistories] = useState([]);
  const [pools, setPools] = useState([]);

  useEffect(() => {
    if (token) {
      const histories = connectorCtx.histories.filter(
        (history) =>
          history.tokenA.id === token.id || history.tokenB.id === token.id
      );
      setHistories(histories);
      const pools = connectorCtx.supportedPools.filter(
        (pool) =>
          pool.token0.id === token.id ||
          pool.token1.id === token.id ||
          pool.token0Contract === token.contract ||
          pool.token1Contract === token.contract
      );
      setPools(pools);
    }
    return () => {};
  }, [connectorCtx.histories, connectorCtx.supportedPools, token]);

  const getTokenInfo = useCallback(
    async (contract) => {
      if (!/^0x[a-fA-F0-9]{40}$/.test(contract))
        history.push({ pathname: `/` });
      const token = await connectorCtx.searchToken(contract);
      console.log(`token:`, token);
      console.log(`token?.contract:`, token?.contract);
      if (token) {
        setToken(token);
        const data = await connectorCtx.getPriceData(contract);
        setData(data);
        setIsLoading(false);
      }
    },
    [connectorCtx, history]
  );

  useEffect(() => {
    if (
      location.pathname.includes("/asset/") &&
      token?.contract !== location.pathname.replace("/asset/", "")
    ) {
      getTokenInfo(location.pathname.replace("/asset/", ""));
    }
    return () => {};
  }, [getTokenInfo, location.pathname, token?.contract]);

  return (
    <React.Fragment>
      {isLoading && <LoadingDialog />}
      <div className={classes.asset}>
        <div className={classes.header}>Token</div>
        <div className={classes.leading}>
          <div className={classes.group}>
            <div className={classes.icon}>
              <img src={token?.iconSrc} alt={token?.symbol} />
            </div>
            <div
              className={classes.title}
            >{`${token?.name} (${token?.symbol})`}</div>
          </div>
          <NetworkDetail shrink={true} />
        </div>
        <div className={classes.leading}>
          <div className={`${classes.data} ${classes.bold}`}>{`${
            traderCtx.fiat.dollarSign
          } ${
            token?.price?.value ? formateDecimal(token?.price.value, 12) : "--"
          }`}</div>
          <div
            className={`${classes.data} ${
              token?.price.change.includes("+")
                ? classes.increase
                : classes.decrease
            }`}
          >
            {token?.price?.change
              ? formateDecimal(
                  SafeMath.mult(token?.price?.change.slice(1), "100"),
                  3
                )
              : "--"}
            %
          </div>
          <div className={classes.action}>
            <a
              className={classes.tag}
              href={`#/add-liquidity/${token?.contract}`}
            >
              Add Liquidity
            </a>
            <a className={classes.tag} href={`#/swap/${token?.contract}`}>
              Swap
            </a>
          </div>
        </div>
        <div className={classes.main}>
          <div className={classes.container}>
            <div className={classes["data-detail"]}>
              <div className={classes["data-title"]}>TVL</div>
              <div className={classes["data-value"]}>
                {`${traderCtx.fiat.dollarSign} ${
                  token?.tvl?.value ? formateDecimal(token?.tvl.value, 8) : "--"
                }`}
              </div>
              <div
                className={`${classes["data-change"]} ${
                  token?.tvl?.change.includes("+")
                    ? classes.increase
                    : classes.decrease
                }`}
              >
                $
                {token?.tvl?.change
                  ? formateDecimal(
                      SafeMath.mult(token?.tvl.change.slice(1), "100"),
                      3
                    )
                  : "--"}
                %
              </div>
            </div>
            <div className={classes["data-detail"]}>
              <div className={classes["data-title"]}>24h Trading Vol</div>
              <div className={classes["data-value"]}>
                {`${traderCtx.fiat.dollarSign} ${
                  token?.volume?.value
                    ? formateDecimal(token?.volume.value, 8)
                    : "--"
                }`}
              </div>
              <div
                className={`${classes["data-change"]} ${
                  token?.volume?.change.includes("+")
                    ? classes.increase
                    : classes.decrease
                }`}
              >
                $
                {token?.volume?.change
                  ? formateDecimal(
                      SafeMath.mult(token?.volume?.change.slice(1), "100"),
                      3
                    )
                  : "--"}
                %
              </div>
            </div>
            <div className={classes["data-detail"]}>
              <div className={classes["data-title"]}>7d Trading Vol</div>
              <div className={classes["data-value"]}>
                {`${traderCtx.fiat.dollarSign} ${
                  token?.swap7Day ? formateDecimal(token?.swap7Day, 8) : "--"
                }`}
              </div>
              <div className={`${classes["data-change"]}`}></div>
            </div>
            <div className={classes["data-detail"]}>
              <div className={classes["data-title"]}>24h Fees</div>
              <div className={classes["data-value"]}>
                ${token?.fee24 ? formateDecimal(token?.fee24, 4) : "--"}
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
        <InvestTable pools={pools} isLoading={!pools.length > 0 || isLoading} />
        <Histories
          histories={histories}
          isLoading={(token && isLoading) || connectorCtx.isLoading}
        />
      </div>
    </React.Fragment>
  );
};

export default Asset;
