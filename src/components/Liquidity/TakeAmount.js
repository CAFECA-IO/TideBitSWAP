import React from "react";
import CoinInput from "../CoinInput/CoinInput";
import InputAmount from "../UI/InputAmount";

const TakeAmount = (props) => {
  return (
    <React.Fragment>
      <InputAmount
        label="ShareAmount"
        max={props.maxShareAmount}
        symbol=""
        value={props.shareAmount}
        onChange={props.onChange}
      />
      {+props.shareAmount > 0 &&
        props.coinOptions.map((coin) => (
          <CoinInput
            key={coin.id}
            label="Coin"
            selected={coin}
            value={coin.amount}
            readOnly={true}
            removeDetail={true}
          />
        ))}
    </React.Fragment>
  );
};

export default TakeAmount;
