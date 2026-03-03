import { Request } from 'express';
import { Token, getDecodedToken } from '@cashu/cashu-ts';
import { CashuOptions, ErrorResponse } from '../types';
import { parseAmount } from './parse-amount';

/**
 * Validates cashu token from client request
 */
export async function validateToken(
    token: string,
    options: Pick<CashuOptions, 'debug' | 'amount' | 'trustedMints'>,
    req: Request,
): Promise<Partial<ErrorResponse & { token: Token }>> {
    const { debug } = options;

    let decodedToken: Token;

    try {
        // validate the token 'cashuB...'
        decodedToken = getDecodedToken(token);
    } catch (error) {
        if (debug)
            console.error(error);

        return {
            error: 'invalid_token',
            message: 'Invalid token'
        };
    }

    if (debug)
        console.log('Decoded token', decodedToken);

    const isUnitSat = decodedToken.unit === 'sat';
    if (!isUnitSat) {
        return {
            error: 'invalid_unit',
            message: 'Token unit is not satoshi',
        };
    }

    const totalAmount = decodedToken.proofs.reduce((sum, proof) => sum + proof.amount, 0);

    const _amount = await parseAmount(options, req);

    const isWrongAmount = totalAmount !== _amount;
    if (isWrongAmount) {
        return {
            error: 'wrong_amount',
            message: `Wrong amount, must be ${_amount} satoshi`,
        };
    }

    const isTrustedMint = options.trustedMints.includes(decodedToken.mint);
    if (!isTrustedMint) {
        return {
            error: 'untrusted_mint',
            message: 'Untrusted mint',
        };
    }

    return { token: decodedToken };
}
