import Joi from 'joi';
const refreshTokenchema = Joi.object({
    refreshToken: Joi.string().required()
}).unknown();
export default class RefreshTokenValidate {
    static refreshTokenForAdmin(req, res, next) {
        const validationResult = refreshTokenchema.validate(req.body);
        if (validationResult.error) {
            res.status(400).json(validationResult.error.message);
            return;
        }
        next();
    }
    static refreshTokenForUser(req, res, next) {
        const validationResult = refreshTokenchema.validate(req.body);
        if (validationResult.error) {
            res.status(400).json(validationResult.error.message);
            return;
        }
        next();
    }
    static refreshTokenForStaff(req, res, next) {
        const validationResult = refreshTokenchema.validate(req.body);
        if (validationResult.error) {
            res.status(400).json(validationResult.error.message);
            return;
        }
        next();
    }
}
