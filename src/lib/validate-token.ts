import { Request } from 'express';
import { Token, getDecodedToken } from '@cashu/cashu-ts';
import { CashuOptions } from '../types';
import { parseAmount } from './parse-amount';
import { validateAmount } from './validate-amount';

type ErrorResponse = {
    error: string;
    message: string;
    token: Token;
}

/**
 * Validates cashu token from client request
 */
export async function validateToken(
    token: string,
    options: Pick<CashuOptions, 'debug' | 'amount' | 'trustedMints' | 'exactAmount'>,
    req: Request,
): Promise<Partial<ErrorResponse>> {
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

    const expectedAmount = await parseAmount(options, req);
    const totalAmount = decodedToken.proofs.reduce((sum, proof) => sum + proof.amount, 0);

    const amountValidation = await validateAmount(expectedAmount, totalAmount, options);

    if (amountValidation) {
        return {
            error: amountValidation.error,
            message: amountValidation.message
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
