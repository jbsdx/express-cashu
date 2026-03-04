import { Token, Wallet, Proof, getEncodedTokenV4 } from '@cashu/cashu-ts';
import { CashuOptions } from '../types';

type ErrorResponse = {
    error: string;
    message: string;
    token: string;
}

/**
 * Creates wallet to receive token from client request
 */
export async function receiveToken(
    options: Pick<CashuOptions, 'debug'>,
    token: Token
): Promise<Partial<ErrorResponse>> {
    const { debug } = options;

    // create new wallet
    const wallet = new Wallet(token.mint);
    await wallet.loadMint();

    try {
        // TODO: add nut-10 locking conditions
        const receiveProofs: Proof[] = await wallet.receive(token);

        const backToken = getEncodedTokenV4({
            mint: token.mint,
            proofs: receiveProofs
        });

        return { token: backToken };
    } catch (error) {
        if (debug)
            console.error(error);

        if (error.code === 11001) {
            return {
                error: 'token_spent',
                message: 'Token already spent',
            };
        }

        return {
            error: 'cannot_receive_token',
            message: `Cannot receive token: ${error.code}`,
        };
    }

}
