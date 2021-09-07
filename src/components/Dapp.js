import React from "react";

// We'll use ethers to interact with the Ethereum network and our contract
import { ethers, utils, BigNumber } from "ethers";

// We import the contract's artifacts and address here, as we are going to be
// using them with ethers
import TokenArtifact from "../contracts/Token.json";
import { NETWORK_ID, CONTRACT_ADDRESS} from "../config";
// import contractAddress from "../contracts/contract-address.json";

// All the logic of this dapp is contained in the Dapp component.
// These other components are just presentational ones: they don't have any
// logic. They just render HTML.
import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { Loading } from "./Loading";
import { Transfer } from "./Transfer";
import { Mint } from "./Mint";
import { TransactionErrorMessage } from "./TransactionErrorMessage";
import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";
import { NoTokensMessage } from "./NoTokensMessage";
import {NUMBERS} from "../numbers";

// This is the Hardhat Network id, you might change it in the hardhat.config.js
// Here's a list of network ids https://docs.metamask.io/guide/ethereum-provider.html#properties
// to use when deploying to other networks.

// This is an error code that indicates that the user canceled a transaction
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

// This component is in charge of doing these things:
//   1. It connects to the user's wallet
//   2. Initializes ethers and the Token contract
//   3. Polls the user balance to keep it updated.
//   4. Transfers tokens by sending transactions
//   5. Renders the whole application
//
// Note that (3) and (4) are specific of this sample application, but they show
// you how to keep your Dapp and contract's state in sync,  and how to send a
// transaction.
export class Dapp extends React.Component {
  constructor(props) {
    super(props);

    // We store multiple things in Dapp's state.
    // You don't need to follow this pattern, but it's an useful example.
    this.initialState = {
      // The info of the token (i.e. It's Name and symbol)
      tokenData: undefined,
      // The user's address and balance
      selectedAddress: undefined,
      balance: undefined,
      holdings: [],
      // The ID about transactions being sent, and any possible error with them
      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
      isMinting: false,
      mintingSucceeded: false,
      hoverValue: '',
      art: '',
      artActive: false,
      totalSupply: 50

    };

    this.state = this.initialState;
  }

  render() {
    // Ethereum wallets inject the window.ethereum object. If it hasn't been
    // injected, we instruct the user to install MetaMask.

    // The next thing we need to do, is to ask the user to connect their wallet.
    // When the wallet gets connected, we are going to save the users's address
    // in the component's state. So, if it hasn't been saved yet, we have
    // to show the ConnectWallet component.
    //
    // Note that we pass it a callback that is going to be called when the user
    // clicks a button. This callback just calls the _connectWallet method.
    let actionSection;
      if (window.ethereum === undefined) {
          actionSection = <NoWalletDetected />;
      } else if (!this.state.selectedAddress) {
      actionSection = (
        <ConnectWallet
          connectWallet={() => this._connectWallet()}
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
        />
      );
    } else if (!this.state.tokenData || !this.state.balance) {
      actionSection = <Loading/>
    } else {
        actionSection = (
            <div className="container">
                <div className="container">
                    <div style={{margin: '0.2em'}}>
                        You have <b> {this.state.balance.toString()} </b> Numbers (click to view art):
                    </div>
                    <div style={{display: 'flex'}}>
                        {this.state.holdings.map(h =>
                            <div
                                onClick={() => this._handleNumberClicked(h)}
                                style={{margin: "0.4em", cursor: "pointer"}}
                            >
                                {h.toString()}
                            </div>)
                        }
                    </div>
                    <div
                        onClick={() => this.setState({artActive: false})}
                        className={this.state.artActive? "ArtModal" : "ArtModal ArtHidden"}>
                        <img src={this.state.art} style={{width: "350px"}} />
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <Mint mintTokens={() => this._mintTokens()} isMinting={this.state.isMinting}
                              mintingSucceeded={this.state.mintingSucceeded}/>
                        {/*
              Sending a transaction isn't an immidiate action. You have to wait
              for it to be mined.
              If we are waiting for one, we show a message here.
            */}
                        {/*{this.state.txBeingSent && (*/}
                        {/*<WaitingForTransactionMessage txHash={this.state.txBeingSent} />*/}
                        {/*)}*/}

                        {/*
              Sending a transaction can fail in multiple ways.
              If that happened, we show a message here.
            */}
                        {this.state.transactionError && (
                            <TransactionErrorMessage
                                message={this._getRpcErrorMessage(this.state.transactionError)}
                                dismiss={() => this._dismissTransactionError()}
                            />
                        )}
                    </div>
                </div>

                {/*<div className="row">*/}
                    {/*<div className="col-12">*/}
                        {/*/!**/}
              {/*If the user has no tokens, we don't show the Tranfer form*/}
            {/**!/*/}
                        {/*{this.state.balance.eq(0) && (*/}
                            {/*<NoTokensMessage selectedAddress={this.state.selectedAddress}/>*/}
                        {/*)}*/}

                        {/*/!**/}
              {/*This component displays a form that the user can use to send a */}
              {/*transaction and transfer some tokens.*/}
              {/*The component doesn't have logic, it just calls the transferTokens*/}
              {/*callback.*/}
            {/**!/*/}
                        {/*{this.state.balance.gt(0) && (*/}
                            {/*<Transfer*/}
                                {/*transferTokens={(to, amount) =>*/}
                                    {/*this._transferTokens(to, amount)*/}
                                {/*}*/}
                                {/*tokenSymbol={this.state.tokenData.symbol}*/}
                            {/*/>*/}
                        {/*)}*/}
                    {/*</div>*/}
                {/*</div>*/}
            </div>
        )
    }

    let MintedNumbers = NUMBERS.slice(0, this.state.totalSupply);

    let MintedNumbers_dict = {}
    MintedNumbers.map(h => {
        MintedNumbers_dict[h] = 1
    });

    let  HeldNumbers_dict = {}
    this.state.holdings.map(h => {
        HeldNumbers_dict[h] = 1
    });


    let all_numbers = [];

    for (let i = 0; i < 10000; i++) {
        all_numbers.push(i)
    }

    return (
        <div className="MainContainer">
          <h1>
            Numbers
          </h1>
          <div className="Explanation">
            Numbers is the natural conclusion of Hyper-Minimal NFTs.
            <div style={{marginTop: '1em'}}>
            The concept is simple:
            </div>
              <ul className="dashed">
                <li> There are 10,000 numbers available: 0 - 9999</li>
                <li> Rarity is native. Low Numbers? Primes? Dates? <br/> Make of it what you will. </li>
                <li> Mint order is pseudo-random. The order is deterministically generated from an initial seed, with a maximum of 1 mint per block. </li>
                <li> The artwork is the Number. Obviously.</li>
                <li> What can you do with them? <br/> Whatever can you do with numbers.</li>

              </ul>
          </div>
            <div className="container" style={{marginTop: '2em'}}>
                Numbers are free to mint - gas fees only.
            </div>
          <div className="Links">
            <a href="https://twitter.com/thenumbersnft">Twitter</a> <a href="https://github.com/enjeyw/NumbersNFT">Github</a> <a href="https://etherscan.io/address/0xc5ac2e26bfbc501640a4e17f2f8e04ba0f7d4490">Etherscan</a> <a href="https://discord.gg/4Ag7nUGs"> Discord</a>
          </div>
          <div style={{marginTop: '2.5em'}}>
            { actionSection }
          </div>
          <div className="HoverValue">
              { this.state.hoverValue }
          </div>
          <div className="GridContainer"
               onMouseOver={e => this.handleMouseOut()}
          >
              {all_numbers.map(n => {
                  let minted = MintedNumbers_dict[n];
                  let held = HeldNumbers_dict[n];

                  return (
                      <div
                          onMouseOver={e => this.handleMouseIn(n)}
                          className= {`${held? "HeldItem " : ''}${minted? "MintedItem " : ''}GridItem`}
                      ></div>
                  )
              })}
          </div>
        </div>
    )
  }

  componentWillUnmount() {
    // We poll the user's balance, so we have to stop doing that when Dapp
    // gets unmounted
    this._stopPollingData();
  }

  async _connectWallet() {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.

    // To connect to the user's wallet, we have to run this method.
    // It returns a promise that will resolve to the user's address.
    const [selectedAddress] = await window.ethereum.enable();

    // Once we have the address, we can initialize the application.

    // First we check the network
    if (!this._checkNetwork()) {
      return;
    }

    this._initialize(selectedAddress);

    // We reinitialize it whenever the user changes their account.
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      this._stopPollingData();
      // `accountsChanged` event can be triggered with an undefined newAddress.
      // This happens when the user removes the Dapp from the "Connected
      // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
      // To avoid errors, we reset the dapp state
      if (newAddress === undefined) {
        return this._resetState();
      }

      this._initialize(newAddress);
    });

    // We reset the dapp state if the network is changed
    window.ethereum.on("networkChanged", ([networkId]) => {
      this._stopPollingData();
      this._resetState();
    });
  }

  _initialize(userAddress) {
    // This method initializes the dapp

    // We first store the user's address in the component's state
    this.setState({
      selectedAddress: userAddress,
    });

    // Then, we initialize ethers, fetch the token's data, and start polling
    // for the user's balance.

    // Fetching the token data and the user's balance are specific to this
    // sample project, but you can reuse the same initialization pattern.
    this._intializeEthers();
    this._getTokenData();
    this._startPollingData();
  }

  async _intializeEthers() {
    // We first initialize ethers by creating a provider using window.ethereum
    this._provider = new ethers.providers.Web3Provider(window.ethereum);

    // When, we initialize the contract using that provider and the token's
    // artifact. You can do this same thing with your contracts.
    this._token = new ethers.Contract(
      CONTRACT_ADDRESS,
      TokenArtifact.abi,
      this._provider.getSigner(0)
    );
  }

  // The next two methods are needed to start and stop polling data. While
  // the data being polled here is specific to this example, you can use this
  // pattern to read any data from your contracts.
  //
  // Note that if you don't need it to update in near real time, you probably
  // don't need to poll it. If that's the case, you can just fetch it when you
  // initialize the app, as we do with the token data.
  _startPollingData() {
    this._pollDataInterval = setInterval(() => this._updateHoldings(), 1000);

    // We run it once immediately so we don't have to wait for it
    this._updateHoldings();
  }

  _stopPollingData() {
    clearInterval(this._pollDataInterval);
    this._pollDataInterval = undefined;
  }

  // The next two methods just read from the contract and store the results
  // in the component state.
  async _getTokenData() {
    const name = await this._token.name();
    const symbol = await this._token.symbol();

    this.setState({ tokenData: { name, symbol } });
  }

  async _updateHoldings() {
      const totalSupply = await this._token.totalSupply();
      this.setState({totalSupply})


      let prev_balance = this.state.balance;
      const balance = await this._token.balanceOf(this.state.selectedAddress);

      if (balance == undefined || prev_balance == undefined || balance.toString() != prev_balance.toString()) {
          this.setState({ balance });

          let holdings = [];

          for (let i = 0; i < balance; i++) {
              let next_holding = await this._token.tokenOfOwnerByIndex(this.state.selectedAddress, i );
              holdings.push(next_holding);
              this.setState({ holdings })
          }
      }
  }

  async _handleNumberClicked(id) {
      let art = await this._getArt(id);
      this.setState({art})
      this.setState({artActive: true})
  }


  async _getArt(id) {
      let uri = await this._token.tokenURI(id);
      const URI_f = await fetch(uri);
      const URI_data = await URI_f.json();

      return URI_data.image
  }

  // This method sends an ethereum transaction to transfer tokens.
  // While this action is specific to this application, it illustrates how to
  // send a transaction.
  async _transferTokens(to, amount) {
    // Sending a transaction is a complex operation:
    //   - The user can reject it
    //   - It can fail before reaching the ethereum network (i.e. if the user
    //     doesn't have ETH for paying for the tx's gas)
    //   - It has to be mined, so it isn't immediately confirmed.
    //     Note that some testing networks, like Hardhat Network, do mine
    //     transactions immediately, but your dapp should be prepared for
    //     other networks.
    //   - It can fail once mined.
    //
    // This method handles all of those things, so keep reading to learn how to
    // do it.

    try {
      // If a transaction fails, we save that error in the component's state.
      // We only save one such error, so before sending a second transaction, we
      // clear it.
      this._dismissTransactionError();

      // We send the transaction, and save its hash in the Dapp's state. This
      // way we can indicate that we are waiting for it to be mined.
      const tx = await this._token.transfer(to, amount);
      this.setState({ txBeingSent: tx.hash });

      // We use .wait() to wait for the transaction to be mined. This method
      // returns the transaction's receipt.
      const receipt = await tx.wait();

      // The receipt, contains a status flag, which is 0 to indicate an error.
      if (receipt.status === 0) {
        // We can't know the exact error that made the transaction fail when it
        // was mined, so we throw this generic one.
        throw new Error("Transaction failed");
      }

      // If we got here, the transaction was successful, so you may want to
      // update your state. Here, we update the user's balance.
      await this._updateHoldings();
    } catch (error) {
      // We check the error code to see if this error was produced because the
      // user rejected a tx. If that's the case, we do nothing.
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }

      // Other errors are logged and stored in the Dapp's state. This is used to
      // show them to the user, and for debugging.
      console.error(error);
      this.setState({ transactionError: error });
    } finally {
      // If we leave the try/catch, we aren't sending a tx anymore, so we clear
      // this part of the state.
      this.setState({ txBeingSent: undefined });
    }
  }

  // This method sends an ethereum transaction to transfer tokens.
  // While this action is specific to this application, it illustrates how to
  // send a transaction.
  async _mintTokens() {
      // Sending a transaction is a complex operation:
      //   - The user can reject it
      //   - It can fail before reaching the ethereum network (i.e. if the user
      //     doesn't have ETH for paying for the tx's gas)
      //   - It has to be mined, so it isn't immediately confirmed.
      //     Note that some testing networks, like Hardhat Network, do mine
      //     transactions immediately, but your dapp should be prepared for
      //     other networks.
      //   - It can fail once mined.
      //
      // This method handles all of those things, so keep reading to learn how to
      // do it.

      try {
          // If a transaction fails, we save that error in the component's state.
          // We only save one such error, so before sending a second transaction, we
          // clear it.
          this._dismissTransactionError();

          // We send the transaction, and save its hash in the Dapp's state. This
          // way we can indicate that we are waiting for it to be mined.
          const tx = await this._token.mint();
          this.setState({ txBeingSent: tx.hash, isMinting: true, mintingSucceeded: false });

          // We use .wait() to wait for the transaction to be mined. This method
          // returns the transaction's receipt.
          const receipt = await tx.wait();

          // The receipt, contains a status flag, which is 0 to indicate an error.
          if (receipt.status === 0) {
              // We can't know the exact error that made the transaction fail when it
              // was mined, so we throw this generic one.
              throw new Error("Transaction failed");
          }

          // If we got here, the transaction was successful, so you may want to
          // update your state. Here, we update the user's balance.
          this.setState({ isMinting: false, mintingSucceeded: true });

          await this._updateHoldings();
      } catch (error) {
          // We check the error code to see if this error was produced because the
          // user rejected a tx. If that's the case, we do nothing.
          if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
              return;
          }

          // Other errors are logged and stored in the Dapp's state. This is used to
          // show them to the user, and for debugging.
          console.error(error);
          this.setState({ transactionError: error });
      } finally {
          // If we leave the try/catch, we aren't sending a tx anymore, so we clear
          // this part of the state.
          this.setState({ txBeingSent: undefined });
      }
  }


    // This method just clears part of the state.
  _dismissTransactionError() {
    this.setState({ transactionError: undefined });
  }

  // This method just clears part of the state.
  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  // This is an utility method that turns an RPC error into a human readable
  // message.
  _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  }

  // This method resets the state
  _resetState() {
    this.setState(this.initialState);
  }

  // This method checks if Metamask selected network is Localhost:8545
  _checkNetwork() {
    if (window.ethereum.networkVersion == NETWORK_ID) {
      return true;
    }

    this.setState({
      networkError: `Please connect Metamask to the correct network (ID: ${NETWORK_ID})`
    });

    return false;
  }

  handleMouseIn(hoverValue) {
    this.setState({hoverValue})
  }

  handleMouseOut() {
      // this.setState({hoverValue: ''})
  }
}
