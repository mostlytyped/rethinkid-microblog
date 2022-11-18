import RethinkID from "@mostlytyped/rethinkid-js-sdk";
import type { Options } from "@mostlytyped/rethinkid-js-sdk/dist/types/types";

// e.g., https://mostlytyped.github.io/rethinkid-battleship/
const baseURL = window.location.origin + window.location.pathname;

console.log("app id", import.meta.env.VITE_APP_ID);

const config: Options = {
  appId: import.meta.env.VITE_APP_ID,
  loginRedirectUri: `${baseURL}`,
  dataAPIConnectErrorCallback: function () {
    // this = RethinkID
    // @ts-ignore
    this.logOut();
  },
};

if (import.meta.env.DEV) {
  config.oAuthUri = "http://localhost:4444";
  config.dataApiUri = "http://localhost:4000";
}

export const rid = new RethinkID(config);
