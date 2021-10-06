import React, { useState, useRef } from "react";

import SearchInput from "../UI/SearchInput";
// import PoolOption from "./PoolOption";
import classes from "./PoolSearchPannel.module.css";
import PoolTitle from "./PoolTitle";
import img from "../../resource/no-product-found.png";
import Button from "../UI/Button";
import PoolOptionDetail from "../PoolOptionDetail/PoolOptionDetail";
import PoolDropDown from "../PoolDropDown/PoolDropDown";

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
      {!!props.displayTitle && <PoolTitle />}
      <div className={classes.select}>
        {!filteredOptions.length && !!props.onCreate && (
          <div className={classes.container}>
            <div className={classes.hint}>No product found. Create one!</div>
            <div className={classes.image}>
              <img src={img} alt="" />
            </div>
            <div className={classes.button}>
              <Button type="button" onClick={props.onCreate}>
                Create
              </Button>
            </div>
          </div>
        )}
        {!filteredOptions.length && !props.onCreate && (
          <div className={classes.container}>
            <div className={classes.hint}>No product found.</div>
          </div>
        )}
        {!!filteredOptions.length &&
          filteredOptions.map((option) =>
            props.isDetail ? (
              <PoolOptionDetail
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
            ) : (
              <PoolDropDown
                id={option.id}
                key={option.id}
                name={option.name}
                iconSrcs={option.iconSrcs}
              />
            )
          )}
      </div>
    </div>
  );
};

export default PoolSearchPannel;
