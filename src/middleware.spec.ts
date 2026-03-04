import supertest from 'supertest';
import express from 'express';
import assert from 'node:assert';
import { before, describe, it } from 'node:test';
import { cashu } from './middleware';
import { validateAmount } from './lib';

describe('Test middleware function', () => {

    let request: supertest.Agent;

    before(async () => {
        const app = express();

        app.get('/', cashu({
            amount: 5,
            paymentCallback: async () => { },
            unit: 'sat',
            debug: false,
            nut10: undefined,
            trustedMints: ['https://mint.lnserver.com']
        }));

        request = supertest(app);
    });

    it('should return 402 with payment request header', async () => {
        await request
            .get('/')
            .expect(402)
            .expect('x-cashu', 'creqApGFhBWF1Y3NhdGFtgXgZaHR0cHM6Ly9taW50Lmxuc2VydmVyLmNvbWFz9Q==');
    });

    it('should fail with invalid token', async () => {
        await request
            .get('/')
            .set('x-cashu', 'cashuBfake=')
            .expect(400);
    });

    it('should validate payment amount', async () => {
        const am1 = await validateAmount(10, 10, { exactAmount: true });
        const am2 = await validateAmount(9, 10, { exactAmount: true });
        const am3 = await validateAmount(10, 9, { exactAmount: true });
        const am4 = await validateAmount(10, 10, {});
        const am5 = await validateAmount(10, 10, { exactAmount: false });
        const am6 = await validateAmount(10, 11, { exactAmount: false });
        const am7 = await validateAmount(10, 9, { exactAmount: false });

        assert(am1 === undefined);
        assert(typeof am2 === 'object');
        assert(typeof am3 === 'object');
        assert(am4 === undefined);
        assert(am5 === undefined);
        assert(am6 === undefined);
        assert(typeof am7 === 'object');
    });
});
