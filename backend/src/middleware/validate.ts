import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

/**
 * Run a list of validation chains then short-circuit with 422 if any fail.
 * Usage: router.post('/path', validate([body('field').notEmpty()]), controller)
 */
export const validate =
  (chains: ValidationChain[]) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(chains.map((chain) => chain.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({ success: false, errors: errors.array() });
      return;
    }
    next();
  };
