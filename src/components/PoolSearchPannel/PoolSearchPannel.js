import React, { useState, useRef } from "react";

import SearchInput from "../UI/SearchInput";
import classes from "./PoolSearchPannel.module.css";
import PoolTitle from "./PoolTitle";
import img from "../../resource/no-product-found.png";
import Button from "../UI/Button";
import PoolOptionDetail from "../PoolOptionDetail/PoolOptionDetail";
import PoolOption from "../PoolOption/PoolOption";

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
    <div
      className={classes.pannel + props.isDetail ? " " + classes.detail : ""}
    >
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
              <PoolOption
                id={option.id}
                key={option.id}
                name={option.name}
                iconSrcs={option.iconSrcs}
                onSelect={() => props.onSelect(option)}
              />
            )
          )}
      </div>
    </div>
  );
};

export default PoolSearchPannel;
