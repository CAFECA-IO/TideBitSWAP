import React, { useState, useRef, useContext, useEffect } from "react";
import ConnectorContext from "../../store/connector-context";
import { addToken } from "../../Utils/utils";

import List from "../UI/List";
import SearchInput from "../UI/SearchInput";

import classes from "./FilterList.module.css";

const FilterList = (props) => {
  const [entered, setEntered] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(props.data);

  useEffect(() => {
    setFilteredOptions(props.data);
    return () => {};
  }, [props.data]);

  const inputRef = useRef();
  const connectorCtx = useContext(ConnectorContext);

  const changeHandler = async (event) => {
    setEntered(event.target.value.replace(/[^0-9A-Za-z]/gi, ""));
    if (/^0x[a-fA-F0-9]{40}$/.test(event.target.value)) {
      const index = props.data.findIndex(
        (d) => d.contract === event.target.value
      );
      let token;
      if (index === -1) {
        token = await addToken(
          event.target.value,
          connectorCtx.connectedAccount
        );
      } else {
        token = props.data[index];
      }
      if (token) {
        setFilteredOptions([token]);
      }
    } else {
      setFilteredOptions(
        props.data.filter(
          (option) =>
            !inputRef.current ||
            option[props.filterProperty]
              .toLowerCase()
              .includes(inputRef.current.value.toLowerCase())
        )
      );
    }
  };

  return (
    <div className={classes.pannel}>
      <div className={classes["search-bar"]}>
        <SearchInput
          inputRef={inputRef}
          value={entered}
          onChange={changeHandler}
          placeholder="Search"
        />
      </div>
      {!filteredOptions?.length && !!props.hint && (
        <div className={classes.container}>
          <div className={classes.hint}>{props.hint}</div>
        </div>
      )}
      {!!filteredOptions?.length && (
        <List
          className={classes.select}
          data={filteredOptions}
          onClick={props.onSelect}
        >
          {(option) => props.children(option, !!props.isShrink)}
        </List>
      )}
    </div>
  );
};

export default FilterList;
