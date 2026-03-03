import { Token, Wallet, Proof, getEncodedTokenV4 } from '@cashu/cashu-ts';
import { CashuOptions, ErrorResponse } from '../types';

/**
 * Creates wallet to receive token from client request
 */
export async function receiveToken(
    options: Pick<CashuOptions, 'debug' | 'lockedPubkeys'>,
    token: Token
): Promise<Partial<ErrorResponse & { token: string }>> {
    const { debug, lockedPubkeys } = options;

    // create new wallet
    const wallet = new Wallet(token.mint);
    await wallet.loadMint();

    let receiveProofs: Proof[];
    try {
        if (lockedPubkeys?.length > 0)
            receiveProofs = await wallet.ops.receive(token).asP2PK({ pubkey: lockedPubkeys }).run();
        else
            receiveProofs = await wallet.receive(token);
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

    const backToken = getEncodedTokenV4({
        mint: token.mint,
        proofs: receiveProofs
    });

    return { token: backToken };
}
