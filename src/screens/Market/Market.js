import React from "react";
import { useContext } from "react";
import { useHistory } from "react-router";
import { TokensTitle, TokenTile } from "../../components/Table/TokenTable";
import FilterList from "../../components/UI/FilterList";
import NetworkDetail from "../../components/UI/NetworkDetail";
import ConnectorContext from "../../store/connector-context";
import UserContext from "../../store/user-context";
import classes from "./Market.module.css";

const Market = (props) => {
  const history = useHistory();
  const connectorCtx = useContext(ConnectorContext);
  const userCtx = useContext(UserContext);

  const selectHandler = (option) => {
    console.log(`option`, option);
    if (!option.contract) {
      history.push({
        pathname: `/import-token/${option.contract}`,
      });
    } else {
      history.push({
        pathname: `/asset/${option.contract}`,
      });
    }
  };

  const importHandler = async (contract) => {
    const index = props.pools.findIndex(
      (pool) =>
        pool.token0.contract === contract || pool.token1.contract === contract
    );
    let pool;

    if (index === -1) {
      const token = await connectorCtx.addToken(contract);
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
    <div className={classes.market}>
      <div className={classes["header-bar"]}>
        <div className={classes.header}>Market</div>
        <NetworkDetail shrink={true} />
      </div>
      <FilterList
        header="All Tokens"
        filterProperty="name"
        data={connectorCtx.supportedTokens}
        onSelect={selectHandler}
        onImport={importHandler}
        titleBar={TokensTitle}
        // displayFilterButton={true}
      >
        {(data) =>
          TokenTile({
            token: data,
            index: data.index,
            fiat: userCtx.fiat,
            id: data.id,
          })
        }
      </FilterList>
    </div>
  );
};

export default Market;
