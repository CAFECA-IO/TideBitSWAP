import React from "react";
import { useContext } from "react";
import { TokensTitle, TokenTile } from "../../components/Table/TokenTable";
import FilterList from "../../components/UI/FilterList";
import NetworkDetail from "../../components/UI/NetworkDetail";
import ConnectorContext from "../../store/connector-context";
import TraderContext from "../../store/trader-context";
import classes from "./Market.module.css";

const Market = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const traderCtx = useContext(TraderContext);

  const importHandler = async (contract) => {
    const index = props.pools.findIndex(
      (pool) =>
        pool.token0.contract === contract || pool.token1.contract === contract
    );
    let pool;

    if (index === -1) {
      const token = await connectorCtx.searchToken(contract);
      console.log(token);
      pool = {
        token0: token,
      };
    } else {
      pool = props.options[index];
    }
    return pool;
  };
  return (
    <div className="page">
      <div className={classes["header-bar"]}>
        <div className={classes.header}>Tokens</div>
        <NetworkDetail shrink={true} />
      </div>
      <FilterList
        className="page"
        header="All Tokens"
        filterProperty="name"
        data={connectorCtx.supportedTokens}
        onSelect={() => {}}
        onImport={importHandler}
        titleBar={TokensTitle}
        // displayFilterButton={true}
        isLoading={connectorCtx.isLoading}
      >
        {(data) =>
          TokenTile({
            token: data,
            index: data.index,
            fiat: traderCtx.fiat,
            id: data.contract,
          })
        }
      </FilterList>
    </div>
  );
};

export default Market;
