import React from "react";

export function Mint({ mintTokens, isMinting, mintingSucceeded }) {
    return (
        <div className="container">
            {isMinting?
                <div style={{height: '50px', margin: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    Minting...
                </div>
                :
                <button onClick={() => {mintTokens();}} style={{height: '50px'}}>
                    Mint a number
                </button>
            }
            <div className="form-group" style={{height: "30px"}}>
                { mintingSucceeded && "Mint Success!"}
            </div>

        </div>
    );

    return (
        <div>
            <h4>Mint</h4>
            <form
                onSubmit={(event) => {
                    // This function just calls the transferTokens callback with the
                    // form's data.
                    event.preventDefault();
                    mintTokens();
                }}
            >
                <div className="form-group" style={{height: "30px"}}>
                    { isMinting?
                        (
                            <div className="spinner-border" role="status">
                                <span className="sr-only">Loading...</span>
                            </div>
                        ):
                        (
                            <input className="btn btn-primary" type="submit" value="Mint" />
                        )
                    }
                </div>
                <div className="form-group" style={{height: "30px"}}>
                    { mintingSucceeded && "Mint Success!"}
                </div>
            </form>
        </div>
    );
}
