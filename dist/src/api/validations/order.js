import * as GeneralValidate from './general.js';
export default class OrderValidate {
    static createOrder(req, res, next) {
        const validationResult = GeneralValidate.createOrderSchema.validate(req.body);
        if (validationResult.error) {
            res.status(400).json(validationResult.error.message);
            return;
        }
        next();
    }
}
