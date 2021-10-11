import React from "react";
import CoinInput from "../CoinInput/CoinInput";

const ProvideAmount = (props) => {
  return (
    <React.Fragment>
      <CoinInput
        label="Coin"
        selected={props.selectedCoin}
        onSelect={() => {}}
        options={props.coinOptions}
        value={props.selectedCoinAmount}
        onChange={props.onChange}
      />
      {+props.selectedCoinAmoun > 0 &&
        props.coinOptions
          .filter((coin) => coin.symbol !== props.selectedCoin.symbol)
          .map((coin) => (
            <CoinInput
              key={coin.id}
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
