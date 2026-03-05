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

app.use('/', cashu({
    paymentCallback: async (token: string, _req: express.Request) => {
        console.log('Received payment', token);
    },
    trustedMints: ['https://mint.lnserver.com'],
    amount: 10,
    unit: 'sat',
    debug: true
}));

app.get('/', (_req, res) => {
    res.send('Payment received!');
});
```

Server responds with http 402 status code and `X-Cashu` header, containing the payment request `creqA...`

```http
X-Cashu: creqAo2FhBWF1Y3NhdGFt...
```

The client sends a cashu token with the requested amount to pay for the service

```http
X-Cashu: cashuBo2FteBlodHRwczovL...
```

Payment Example:

```ts
import { decodePaymentRequest, getEncodedTokenV4, Proof, Wallet, } from '@cashu/cashu-ts';

const protectedApiUrl = 'http://localhost:3000';
const mintUrl = 'https://mint.lnserver.com';

// Internal proof storage
const storage: { remainingProofs: Proof[], sentProof: Proof[] } = {
    remainingProofs: [],
    sentProof: []
};

payToServer();

async function payToServer() {
    // try access the resource
    const req = await fetch(protectedApiUrl);

    // decode the received payment request from the resource
    const paymentRequest = req.headers.get('x-cashu');
    const decodedPaymentRequest = decodePaymentRequest(paymentRequest);

    // check if used mint is accepted by the resource
    if (!decodedPaymentRequest.mints.includes(mintUrl)) {
        throw new Error('Mint not accepted: ' + mintUrl);
    }

    // Init wallet
    const wallet = new Wallet(mintUrl);
    await wallet.loadMint();

    // Example: get list of proofs from cashu token..
    const storedToken = 'cashuBo2FteBlo....';
    const decodedToken = wallet.decodeToken(storedToken);
    storage.remainingProofs = decodedToken.proofs;

    // Send proofs to mint
    const { keep, send } = await wallet.send(decodedPaymentRequest.amount, storage.remainingProofs);

    // update remaining proof list
    storage.remainingProofs = keep;

    // store sent proofs to redeem them back later, if the receiver does not claim them
    storage.sentProof = send;

    // encode the token as a cashu string
    const cashuString = getEncodedTokenV4({
        mint: mintUrl,
        proofs: send
    });

    // pay the requested amount with encoded token
    await fetch(protectedApiUrl, {
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
