import { Request } from 'express';

/**
 * Middleware options for cashu payments
 */
export type CashuOptions = {
    /**
     * Enable console.log output
     * 
     * @default false
     */
    debug?: boolean;
    /**
     * Set NUT-10 locking conditions
     * 
     * @link https://github.com/cashubtc/nuts/blob/main/10.md
     */
    nut10?: NUT10Option;
    /**
     * Payment unit
     * 
     * For now fixed to 'sat'
     * 
     * @default 'sat'
     */
    unit?: 'sat';
    /**
     * The payment amount
     */
    amount: number | ((req: Request) => Promise<number>);
    /**
     * Payment amount must be identical to the payment request.
     * 
     * If set to false, the amount may be greater or equal
     * 
     * @default true
     */
    exactAmount?: boolean;
    /**
     * Callback function triggered after succesful payments
     */
    paymentCallback: ((token: string, req: Request) => Promise<void>);
    /**
     * Set list of trustet mint URLs
     * 
     * @example ['https://mint.lnserver.com']
     */
    trustedMints?: string[];
};

export type NUT10Option = {
    /**
     * The kind of spending condition.
     */
    kind: string;
    /**
     * Expresses the spending condition relative to the kind.
     */
    data: string;
    /**
     * Tags associated with the spending condition for additional data.
     */
    tags: string[][];
};
