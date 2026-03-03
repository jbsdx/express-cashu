import { Request } from 'express';

/**
 * Middleware options for cashu payments
 */
export type CashuOptions = {
    /**
     * Enable console.log output
     */
    debug?: boolean;
    /**
     * Set locked pubkeys in payment request for recipient
     */
    lockedPubkeys?: string[];
    /**
     * Unit for now fixed to 'sat'
     */
    unit?: 'sat';
    /**
     * The payment amount in 'sat'
     */
    amount: number | ((req: Request) => Promise<number>);
    /**
     * Callback function triggered after succesful payments
     */
    paymentCallback: ((token: string, req: Request) => Promise<void>);
    /**
     * Set list of trustet mint URLs, e.g. 'https://mint.lnserver.com'
     */
    trustedMints?: string[];
};

export type ErrorResponse = {
    error: string;
    message: string;
}
