import assert from 'node:assert';
import { Response, Request } from 'express';
import { CashuOptions } from '../types';
import { parseAmount } from './parse-amount';
import { PaymentRequest } from '@cashu/cashu-ts';

/**
 * Sends payment http request to client
 */
export async function sendPaymentRequest(
    options: Pick<CashuOptions, 'unit' | 'trustedMints' | 'nut10' | 'amount'>,
    req: Request,
    res: Response
): Promise<void> {
    const { unit, nut10, trustedMints } = options;

    const amount = await parseAmount(options, req);

    assert(Number.isInteger(amount), 'Received invalid value for `amount`');

    const nut24Request = new PaymentRequest(
        undefined,
        undefined,
        amount,
        unit,
        trustedMints,
        undefined,
        true,
        nut10
    );

    // add cashu payment request in header
    res.header('X-Cashu', nut24Request.toEncodedCreqA());
    res.sendStatus(402);
}
