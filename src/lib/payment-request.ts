import assert from 'node:assert';
import { Response, Request } from 'express';
import { CashuOptions } from '../types';
import { parseAmount } from './parse-amount';
import { PaymentRequest } from '@cashu/cashu-ts';

/**
 * Sends payment http request to client
 */
export async function sendPaymentRequest(
    options: Pick<CashuOptions, 'unit' | 'trustedMints' | 'lockedPubkeys' | 'amount'>,
    req: Request,
    res: Response
) {
    const { unit, lockedPubkeys, trustedMints } = options;

    const _amount = await parseAmount(options, req);

    assert(Number.isInteger(_amount), 'Received invalid value for `amount`');

    const nut24Request = {
        'a': _amount,
        'u': unit,
        'm': trustedMints,
    };

    if (lockedPubkeys?.length > 0) {
        nut24Request['nut10'] = ['pubkeys', ...lockedPubkeys];
    }

    const _token = PaymentRequest.fromRawRequest(nut24Request);

    // add cashu payment request in header
    res.header('X-Cashu', _token.toEncodedCreqA());
    res.sendStatus(402);
}
