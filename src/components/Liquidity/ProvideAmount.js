import React from "react";
import { randomID } from "../../Utils/utils";
import CoinInput from "../CoinInput/CoinInput";

const ProvideAmount = (props) => {
  return (
    <React.Fragment>
      <CoinInput
        label="Coin"
        options={props.coinOptions}
        selected={props.selectedCoin}
        value={props.selectedCoinAmount}
        onSelect={props.onSelectedCoinChange}
        onChange={props.onSelectedCoinAmountChange}
      />
      {props.pairCoin?.map((coin) => (
        <CoinInput
          key={coin.id || randomID(6)}
          label="Coin"
          selected={coin}
          value={coin.amount}
          readOnly={true}
        />
      ))}
      <div className="hint">
        The final amount is determined by the price at the time of order.
      </div>
    </React.Fragment>
  );
};

export default ProvideAmount;
