import { liquidityType } from "../constant/constant";

export const randomID = (n) => {
  var ID = "";
  var text = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  n = parseInt(n);
  if (!(n > 0)) {
    n = 8;
  }
  while (ID.length < n) {
    ID = ID.concat(text.charAt(parseInt(Math.random() * text.length)));
  }
  return ID;
};

export const amountUpdateHandler = (amount, max) =>
  +amount === 0 ? amount : +amount > +max ? max : amount;

export const coinPairUpdateHandler = (
  active,
  activeAmount,
  passive,
  passiveAmount,
  options
) => {
  let _passive;
  if (!!passive && active.symbol === passive.symbol)
    _passive = options.find((coin) => coin.symbol !== active.symbol);
  else _passive = passive;
  return {
    active,
    passive: _passive,
    activeAmount: amountUpdateHandler(activeAmount, active?.max),
    passiveAmount: amountUpdateHandler(passiveAmount, _passive?.max),
  };
};

export const coinUpdateHandler = (selectedCoin, coinOptions, prevAmount) => {
  let selectedCoinAmount, isCoinValid, pairCoin;
  selectedCoinAmount = amountUpdateHandler(prevAmount, selectedCoin.max);

  isCoinValid = +selectedCoinAmount === 0 ? null : +selectedCoinAmount > 0;
  if (isCoinValid) {
    // HTTPREQUEST: get pairCoinAmount
    pairCoin = coinOptions
      .filter((coin) => coin.symbol !== selectedCoin.symbol)
      .map((coin) => {
        let amount = 0.1;
        isCoinValid = !amount > coin.max;
        return { ...coin, amount: amount };
      });
  } else {
    pairCoin = null;
  }
  return {
    selectedCoinAmount,
    isCoinValid,
    pairCoin,
  };
};


export const parseData = (option, type, options) => {
  if (!option) {
    return {
      details: getPoolDetail(option, type),
    }
  }
  const coins = option.name
    .split("/")
    .map((symbol) => options.find((coin) => coin.symbol === symbol));
  const combinations = [coins, [coins[0]], [coins[1]]];
  const details = getPoolDetail(option, type);
  // get selected pool max shareAmount
  return {
    selected: option,
    coins: coins,
    combinations: combinations,
    details: details,
    maxShareAmount: "1000",
  };
};

export const getPoolDetail = (option, type) => {
  switch (type) {
    case liquidityType.PROVIDE:
      return [
        {
          title: "Current pool size",
          value: option?.composition || "--",
        },
        {
          title: "Total yield",
          explain: "*Based on 24hr volume annualized.",
          value: option?.yield || "--",
        },
      ];
    case liquidityType.TAKE:
      return [
        {
          title: "Amount",
          value: "--",
        },
        {
          title: "Price",
          explain:
            "This price is an approximate value, and the final price depends on the amount of tokens in the liquid pool when you remove liquidity.",
          value: "--",
        },
        {
          title: "Portion of the pool",
          explain: "Removed portion/​current total pool portion",
          value: "--",
        },
        {
          title: "Current pool size",
          value: option?.composition|| "--",
        },
        {
          title: "Your Current Portion",
          value: "--",
        },
        {
          title: "Current portion composites",
          value: "--",
        },
      ];
    default:
      break;
  }
};

export const getNetworkOptions = (coin, networks) => {
  return [
    ...networks,
    {
      name: coin.name,
      symbol: coin.symbol,
      time: "3 mins",
      fee: {
        crypto: "0.000061",
        fiat: "32.1",
      },
    },
  ];
};


export const to = (promise) => {
  return promise
    .then((data) => {
      return [null, data];
    })
    .catch((err) => [err, null]);
};

export const request = (opts) => {
  const xhr = new XMLHttpRequest();
  // xhr.responseType = "arraybuffer";
  if (opts.responseType === "arraybuffer") {
    xhr.responseType = "arraybuffer";
  }
  return new Promise((resolve, reject) => {
    xhr.onreadystatechange = () => {
      // only run if the request is complete
      if (xhr.readyState !== 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        // If successful
        opts.responseType === "arraybuffer"
          ? resolve(new Uint8Array(xhr.response))
          : resolve(JSON.parse(xhr.responseText));
      } else {
        // If false
        reject(xhr.response);
      }
    };
    // Setup HTTP request
    xhr.open(opts.method || "GET", opts.url, true);
    if (opts.headers) {
      Object.keys(opts.headers).forEach((key) =>
        xhr.setRequestHeader(key, opts.headers[key])
      );
    }
    // Send the request
    if (opts.contentType === "application/json") {
      xhr.setRequestHeader("content-type", "application/json");
      xhr.send(JSON.stringify(opts.payload));
    } else {
      xhr.send(opts.payload);
    }
  });
};

export const toEther = (amount, unit) => {
  switch (unit) {
    case "wei":
      return amount / Math.pow(10, 18);
    case "gwei":
      return amount / Math.pow(10, 9);
    default:
      return amount;
  }
};

export const toWei = (amount, unit) => {
  switch (unit) {
    case "ether":
      return amount * Math.pow(10, 18);
    case "gwei":
      return amount * Math.pow(10, 9);
    default:
      return amount;
  }
};

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const pad = (n) => {
  return n < 10 ? "0" + n : n;
};
export const dateFormatter = (timestamp) => {
  const dateTime = new Date(timestamp);
  const date = dateTime.getDate();
  const month = dateTime.getMonth();
  const year = dateTime.getFullYear();
  let hours = dateTime.getHours();
  const minutes = dateTime.getMinutes();
  let suffix = "AM";
  if (hours - 12 > 0) {
    hours -= 12;
    suffix = "PM";
  }
  const mmddyyyykkmm =
    monthNames[month] +
    " " +
    pad(date) +
    ", " +
    year +
    " " +
    hours +
    ":" +
    pad(minutes) +
    " " +
    suffix;
  return {
    text: mmddyyyykkmm,
    date: monthNames[month] + " " + pad(date) + ", " + year,
    time: hours + ":" + pad(minutes) + " " + suffix,
    month: monthNames[month],
    dateTime: pad(date),
    year: year,
  };
};
