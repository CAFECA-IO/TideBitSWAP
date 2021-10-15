class Endpoint {
  env = "development";
  _SUSANOO = "https://service.tidewallet.io";
  _AMATERASU = "https://staging.tidewallet.io";
  _version = "/api/v1";

  SUSANOO = this._SUSANOO + this._version;
  AMATERASU = this._AMATERASU + this._version;

  EMAIL = "info@tidewallet.io";

  init = async () => {
    // switch (info.packageName) {
    //   case "com.tideisun.tidewallet3":
    //     Endpoint.env = "production";
    //     break;
    //   case "com.tideisun.tidewallet3.dev":
    //     Endpoint.env = "development";
    //     break;
    //   default:
    // }
  };

  url = Endpoint.env === "production" ? this.SUSANOO : this.AMATERASU;
}
