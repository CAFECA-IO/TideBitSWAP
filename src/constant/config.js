// const env = 'production';
const env = "development";
const apiVersion = "/api/v1";
const apiKey = "";
const apiSecret = "";

const url =
  env === "production"
    ? "https://service.tidewallet.io"
    : "/";

const network_publish = true;
const debug_mode = env === "production" ? false : true;

export const Config = {
  isTestnet: true,
  env,
  apiVersion,
  apiKey,
  apiSecret,
  url,
  network_publish,
  debug_mode,
};

