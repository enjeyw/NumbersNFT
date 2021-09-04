import React from "react";
// import '../custom.scss';

import { NetworkErrorMessage } from "./NetworkErrorMessage";

export function ConnectWallet({ connectWallet, networkError, dismiss }) {
  return (
    <div className="container">
        <div className="col-12 text-center">
          {/* Metamask network should be set to Localhost:8545. */}
          {networkError && (
            <NetworkErrorMessage 
              message={networkError} 
              dismiss={dismiss} 
            />
          )}
        </div>
        <div>
          Please connect to your metamask wallet to mint numbers.
        </div>
        <div>

        <button
          type="button"
          onClick={connectWallet}
        >
          Connect Wallet
        </button>
      </div>
    </div>
  );
}
