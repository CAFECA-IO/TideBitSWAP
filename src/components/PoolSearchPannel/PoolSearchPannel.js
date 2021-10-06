import React, { useState, useRef } from "react";

import { randomID } from "../../Utils/utils";
import SearchInput from "../UI/SearchInput";
import PoolOption from "./PoolOption";
import classes from "./PoolSearchPannel.module.css";

/**
 *
 * type? coin/pool
 * shrink size?
 * with filter?
 *
 */

const PoolSearchPannel = (props) => {
  const inputRef = useRef();
  const [entered, setEntered] = useState("");

  const filteredOptions = props.options.filter((option) => {
    return (
      !inputRef.current ||
      option.name.toLowerCase().includes(inputRef.current?.value.toLowerCase())
    );
  });

  const changeHandler = (event) => {
    setEntered(event.target.value.replace(/[^A-Za-z]/gi, ""));
  };

  return (
    <div className={classes.pannel}>
      <SearchInput
        inputRef={inputRef}
        entered={entered}
        onChange={changeHandler}
      />
      <div className={classes.select}>
        {filteredOptions.map((option) => (
          <PoolOption
            id={option.id}
            key={option.id}
            name={option.name}
            iconSrcs={option.iconSrcs}
            liquidity={option.liquidity}
            composition={option.composition}
            yield={option.yield}
            rewardIconSrc={option.rewardIconSrc}
            rewardCoinSymbol={option.rewardCoinSymbol}
            volume={option.volume}
            onSelect={() => props.onSelect(option)}
          />
        ))}
      </div>
    </div>
  );
};

export default PoolSearchPannel;
