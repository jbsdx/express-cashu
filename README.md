# Express cashu middleware

[![npm version](https://badge.fury.io/js/express-cashu.svg)](https://badge.fury.io/js/express-cashu)

Express middleware for cashu payments using [NUT-24](https://github.com/cashubtc/nuts/blob/main/24.md)

## Installation

```sh
npm install -s express-cashu
```

## Usage

Add middleware function to express http routes

```ts
import express from 'express';
import { cashu } from 'express-cashu';

const app = express();

const paymentCallback = async (token: string) => {
    console.log('Received payment', token);
};

app.use('/', cashu({
    amount: () => {
        // expected payment amount in satoshi
        return Promise.resolve(5);
    },
    paymentCallback,
    unit: 'sat',
    debug: true,
    lockedPubkeys: [],
    trustedMints: ['https://mint.lnserver.com']
}));

app.get('/', (_req, res) => {
    res.send('Payday!');
});
```

Server responds with http 402 status code and `X-Cashu` header, containing the payment request `creqA...`

```http
X-Cashu: creqAo2FhBWF1Y3NhdGFt...==
```

The client sends a cashu token with the requested amount to pay for the service

```http
X-Cashu: cashuBo2FteBlodHRwczovL...
```

Payment Example:

```ts
import { decodePaymentRequest, getEncodedTokenV4, Proof, Token, Wallet, } from '@cashu/cashu-ts';

payToServer();

async function payToServer() {
    const protectedApiUrl = 'http://localhost:3000';

    // try access the API resource
    const req = await fetch(protectedApiUrl);

    // decode the received payment request from the API resource
    const paymentRequest = req.headers.get('x-cashu');
    const decodedPaymentRequest = decodePaymentRequest(paymentRequest);
    const mintUrl = decodedPaymentRequest.mints[0];

    // Internal stored proofs
    let proofs: Proof[];
    let sentProofs: Proof[];

    // Init wallet
    const wallet = new Wallet(mintUrl);
    await wallet.loadMint();

    // Example: get proofs from cashu token
    const storedToken = 'cashuBo2FteBlo....';
    const decodedToken = wallet.decodeToken(storedToken);
    proofs = decodedToken.proofs;

    // now use your proofs and send the requested amount back to the resource
    const { keep, send } = await wallet.send(decodedPaymentRequest.amount, proofs);

    // update remaining proof list
    proofs = keep;

    // store sent proofs to redeem them back later, if the receiver does not claim them
    sentProofs = send;

    // create a token with proof list
    const token: Token = {
        mint: mintUrl,
        proofs: send
    };

    // encode the token as a cashu string
    const cashuString = getEncodedTokenV4(token);

    // finally pay the requested amount with encoded token
    await fetch('http://localhost:3000', {
        headers: {
            'x-cashu': cashuString
        }
    });
};
```

# Test

Run test suite

```sh
npm test
```
