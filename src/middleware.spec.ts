import supertest from 'supertest';
import express from 'express';
import { before, describe, it } from 'node:test';
import { cashu } from './middleware';

describe('Test middleware function', () => {

    let request: supertest.Agent;

    before(async () => {
        const app = express();

        app.get('/', cashu({
            amount: 5,
            paymentCallback: async () => { },
            unit: 'sat',
            debug: false,
            lockedPubkeys: [],
            trustedMints: ['https://mint.lnserver.com']
        }));

        request = supertest(app);
    });

    it('should return 402 with payment request header', async () => {
        await request
            .get('/')
            .expect(402)
            .expect('x-cashu', 'creqAo2FhBWF1Y3NhdGFtgXgZaHR0cHM6Ly9taW50Lmxuc2VydmVyLmNvbQ==');
    });

    it('should fail with invalid token', async () => {
        await request
            .get('/')
            .set('x-cashu', 'cashuBfake=')
            .expect(400);
    });
});
