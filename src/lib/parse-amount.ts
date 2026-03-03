import { Request } from 'express';
import { CashuOptions } from '../types';

/**
 * Parse numeric payment amount from middleware options
 */
export async function parseAmount(
    options: Pick<CashuOptions, 'amount'>,
    req: Request
): Promise<number> {
    let _amount: number;

    if (typeof options.amount === 'number') {
        _amount = options.amount;
    } else if (typeof options.amount === 'function') {
        _amount = await options.amount(req);
    }
    return _amount;
}
