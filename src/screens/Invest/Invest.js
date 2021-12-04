import React from "react";
import { useContext } from "react";
import { InvestsTitle, InvestTile } from "../../components/Table/InvestTable";
import FilterList from "../../components/UI/FilterList";
import NetworkDetail from "../../components/UI/NetworkDetail";
import ConnectorContext from "../../store/connector-context";
import classes from "./Invest.module.css";

const Invest = (props) => {
  const connectorCtx = useContext(ConnectorContext);

  const importHandler = async (contract) => {
    const index = props.pools.findIndex(
      (pool) =>
        pool.token0.contract.toLowerCase() === contract.toLowerCase() || pool.token1.contract.toLowerCase() === contract.toLowerCase()
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
    <div className={classes.invest}>
      <div className={classes["header-bar"]}>
        <div className={classes.header}>Invest</div>
        <NetworkDetail shrink={true} />
      </div>
      <FilterList
        className="page"
        header="All Tokens"
        filterProperty="name"
        data={connectorCtx.supportedPools}
        onSelect={() => {}}
        onImport={importHandler}
        titleBar={InvestsTitle}
        // displayFilterButton={true}
        isLoading={connectorCtx.isLoading}
      >
        {(data) =>
          InvestTile({
            pool: data,
            index: data.index,
            fiat: connectorCtx.fiat,
            id: data.contract,
          })
        }
      </FilterList>
    </div>
  );
};

export default Invest;
