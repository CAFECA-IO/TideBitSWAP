import React, { useState, useRef } from "react";
import QRCode from "qrcode.react";

import classes from "./Deposit.module.css";

import { dummyCoins } from "../../constant/dummy-data";
import Header from "../../components/UI/Header";
import CoinDialog from "../../components/CoinDialog/CoinDialog";
import { randomID } from "../../Utils/utils";
import Button from "../../components/UI/Button";

const getWarningText = (coin) => {
  // get warning text
  let warningText;
  switch (coin.symbol) {
    case "ETH":
      warningText = [
        `Please be aware that TideBit only accepts ${coin.symbol} direct transfers. Please do not use ${coin.symbol} smart contracts.`,
      ];
      break;
    case "USDT":
      warningText = [
        `${coin.symbol} deposits only support the "Simple Send" transaction`,
      ];
      break;
    default:
      warningText = [];
      break;
  }
  const mockup = (coin) => [
    `${coin.symbol} deposits from non-${coin.symbol} addresses are prohitbited. These deposits cannot be retrived.`,
    // `TEP2 and TEP20(TCS) deposits are not supported.`,
  ];
  return [...mockup(coin), ...warningText];
};

const Deposit = (props) => {
  const [selectedCoin, setSelectedCoin] = useState();
  const [warningText, setWarningText] = useState([]);
  const [selectedCoinAddress, setSelectedCoinAddress] = useState("");
  const [copySuccess, setCopySuccess] = useState("");
  const textRef = useRef(null);

  const selectHandler = (coin) => {
    setSelectedCoin(coin);
    // get coin address && warning text
    const address = "0x" + randomID(32);
    setSelectedCoinAddress(address);
    setWarningText(getWarningText(coin));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(selectedCoinAddress);
    setCopySuccess("Copied!");
  };
  return (
    <div className={classes.deposit}>
      <Header title="Deposit" onDisconnect={props.onDisconnect} />
      <div className={classes.content}>
        <main className={classes.main}>
          <CoinDialog
            options={dummyCoins}
            selectedCoin={selectedCoin}
            onSelect={selectHandler}
          />
          <div className={classes["address-container"]}>
            <div className={classes.title}>Wallet Address</div>
            <QRCode
              value={
                !!selectedCoinAddress
                  ? selectedCoinAddress
                  : "Address not found"
              }
            />
            <div className={classes.tooltip}>
              <div
                ref={textRef}
                value={selectedCoinAddress}
                onClick={copyToClipboard}
              >
                {selectedCoinAddress}
              </div>
              {!!copySuccess && (
                <div className={classes.tooltiptext}>{copySuccess}</div>
              )}
            </div>
          </div>
        </main>
        <div className={classes.sub}>
          <ul className={classes["warning-container"]}>
            <div className={classes.title}>Notic: </div>
            {warningText.map((t) => (
              <li className={classes.detail} key={randomID(6)}>
                {t}
              </li>
            ))}
          </ul>
          <div className={classes.button}>
            {/* <Button type="button">Save Picture</Button> */}
            <Button type="button" onClick={copyToClipboard}>
              Copy Address
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deposit;
