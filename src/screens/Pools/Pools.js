import React from "react";
import { useContext } from "react";
import { PoolsTitle, PoolTile } from "../../components/Table/PoolTable";
import FilterList from "../../components/UI/FilterList";
import NetworkDetail from "../../components/UI/NetworkDetail";
import ConnectorContext from "../../store/connector-context";
import TraderContext from "../../store/trader-context";

const Pools = (props) => {
  const connectorCtx = useContext(ConnectorContext);
  const traderCtx = useContext(TraderContext);

  const importHandler = async (contract) => {
    const index = props.pools.findIndex(
      (pool) =>
        pool.token0.contract.toLowerCase() === contract.toLowerCase() ||
        pool.token1.contract.toLowerCase() === contract.toLowerCase()
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
      <div className="header-bar">
        <div className="header">Pools</div>
        <NetworkDetail shrink={true} />
      </div>
      <FilterList
        className="page"
        header="All Pools"
        filterProperty="name"
        data={connectorCtx.supportedPools}
        onSelect={() => {}}
        onImport={importHandler}
        titleBar={PoolsTitle}
        // displayFilterButton={true}
        isLoading={connectorCtx.isLoading || traderCtx.isLoading}
        hint="No pool found."
      >
        {(data) =>
          PoolTile({
            pool: data,
            index: data.index,
            fiat: traderCtx.fiat,
            id: data.contract,
          })
        }
      </FilterList>
    </div>
  );
};

export default Pools;
