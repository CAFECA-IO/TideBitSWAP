import viewController from "../controller/view";
import Asset from "../model/asset";
import Fiat from "../model/fiat";

export const randomHex = (n) => {
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

const pad = (n) => {
  return n < 10 ? "0" + n : n;
};

export const to = (promise) => {
  return promise
    .then((data) => {
      return [null, data];
    })
    .catch((err) => [err, null]);
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
export const dateFormatter = (timestamp) => {
  const dateTime = new Date(timestamp * 1000);
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
  return mmddyyyykkmm;
};

export const addressFormatter = (address, showLength = 6) => {
  if (address.length <= showLength * 2) return address;
  const prefix = address.slice(0, showLength);
  const suffix = address.slice(address.length - showLength, address.length);
  return prefix + "..." + suffix;
};

/**
 *
 * @param {string} amount
 * @param {number} decimalLength
 * @param {number} maxLength
 * @returns {string}
 */
export const formateDecimal = (amount, maxLength = 18, decimalLength = 8) => {
  const splitChunck = amount.split(".");
  if (splitChunck.length > 1) {
    // if (splitChunck[1].length > decimalLength ?? 8) {
    if (amount.length > maxLength)
      splitChunck[1] = splitChunck[1].substring(
        0,
        maxLength - splitChunck[0].length - 1
      );
    // else splitChunck[1] = splitChunck[1].substring(0, decimalLength ?? 8);
    // }
    return splitChunck[1].length > 0
      ? `${splitChunck[0]}.${splitChunck[1]}`
      : splitChunck[0];
  }
  return amount;
};

export const currentView = () => {
  const scaffold = document.querySelector("scaffold-widget");
  const view = scaffold?.attributes?.view?.value;
  return view;
};

export const getInstallID = () => {
  const key = "InstallID";
  let InstallID;
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([key], (result) => {
      console.log(result);
      if (result[key] === undefined) {
        InstallID = randomHex(32);
        chrome.storage.sync.set({ InstallID });
      } else {
        InstallID = result[key];
      }
      resolve(InstallID);
    });
  });
};

const getAuthToken = () =>
  new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (token) resolve(token);
      else reject(new Error("The user did not approve access"));
    });
  });

export const googleSignIn = async () => {
  // https://stackoverflow.com/questions/44968953/how-to-create-a-login-using-google-in-chrome-extension/44987478
  let token;
  try {
    token = await getAuthToken();
  } catch (e) {
    throw e;
  }

  if (!token) return;
  const init = {
    method: "GET",
    async: true,
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    contentType: "json",
  };
  const data = await fetch(
    "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
    init
  ).then((respose) => respose.json());
  console.log(data);
  return data.id;
};

export const getUserInfo = async (tidewallet) => {
  try {
    const dashboard = await tidewallet.overview();
    const balance = dashboard.balance;
    const fiat = new Fiat(dashboard.fiat);
    const assets = dashboard.currencies.map((currency) => new Asset(currency));
    console.log("getUserInfo assets", assets);
    console.log("getUserInfo fiat", fiat);
    console.log("getUserInfo dashboard.balance", dashboard.balance);

    viewController.updateAssets(assets, balance, fiat);
  } catch (error) {
    throw error;
  }
};

/**
 *
 * @param {Object} tidewallet
 * @param {Object} data
 * @param {Boolean} debugMode
 * @returns {Array} response[0] is Boolean, represent excution result
 * @returns {Array} if process got error, response[1] is Error Object, else is undefined.
 */
export const initUser = async ({ tidewallet, debugMode }) => {
  const api = {
    apiURL: "https://staging.tidewallet.io/api/v1",
    apiKey: "f2a76e8431b02f263a0e1a0c34a70466",
    apiSecret: "9e37d67450dc906042fde75113ecb78c",
  };

  const user = {};
  try {
    user.thirdPartyId = await googleSignIn();
  } catch (error) {
    console.log("error ", error);
    return [false, error];
  }
  try {
    user.installId = await getInstallID();
  } catch (error) {
    console.log("error ", error);
    return [false, error];
  }

  try {
    const result = await tidewallet.init({
      user,
      api,
      debugMode,
    });

    if (result) {
      return [true, result];
    }
    return [true];
  } catch (error) {
    console.log("error ", error);
    return [false, error];
  }
};

export const createUser = async ({ tidewallet, user }) => {
  console.log("createUser user: ", user);
  try {
    await tidewallet.createUser({
      user,
    });
    return [true];
  } catch (error) {
    console.log("error ", error);
    return [false, error];
  }
};
