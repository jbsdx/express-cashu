import { Request, Response, NextFunction } from 'express';
import { CashuOptions } from './types';
import { sendPaymentRequest, validateToken, receiveToken } from './lib';

/**
 * ExpressJS middleware function for 402 cashu payment requests
 * 
 * [Link NUT-24 protocol specs](https://github.com/cashubtc/nuts/blob/main/24.md)
 * 
 * @param options Cashu middleware options
 */
export const cashu = (options?: CashuOptions) =>
    async (req: Request, res: Response, next: NextFunction) => {

        const token = req.headers['x-cashu'] as string;
        const { debug } = options;

        if (!token) {
            // send payment request to client
            return sendPaymentRequest(options, req, res);
        }

        const validation = await validateToken(token, options, req);
        if (validation.error) {
            return res.status(400).json({
                error: validation.error,
                message: validation.message
            });
        }

        const decodedToken = validation.token;

        if (debug)
            console.log('Decoded token', decodedToken);

        const receiveResponse = await receiveToken(options, decodedToken);

        if (receiveResponse.token) {
            await options.paymentCallback(receiveResponse.token);
        } else {
            return res.status(400).json({
                error: receiveResponse.error,
                message: receiveResponse.message
            });
        }

        next();
    };
