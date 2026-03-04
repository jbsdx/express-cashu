import { CashuOptions } from '../types';

type ErrorResponse = {
    error: string;
    message: string;
}

/**
 * Validates amount received from token
 */
export async function validateAmount(
    expectedAmount: number,
    actualAmount: number,
    options: Pick<CashuOptions, 'exactAmount'>
): Promise<ErrorResponse | void> {

    if (options.exactAmount === false) {
        const isGreaterOrEqual = actualAmount >= expectedAmount;

        if (!isGreaterOrEqual) {
            return {
                error: 'wrong_amount',
                message: `Wrong amount, must greater or equal to '${expectedAmount}' satoshi`,
            };
        }
    } else {
        const isExactAmount = actualAmount === expectedAmount;

        if (!isExactAmount) {
            return {
                error: 'wrong_amount',
                message: `Wrong amount, must be '${expectedAmount}' satoshi`,
            };
        }
    }
}
