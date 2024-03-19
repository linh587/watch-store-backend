import Joi from 'joi';
import * as GeneralValidate from './general.js';
const PASSWORD_REGEX = /^([a-zA-Z]+\d+|\d+[a-zA-Z]+)+[a-zA-Z0-9]*$/;
const ADMIN_USERNAME_REGEX = /^[a-zA-Z0-9_.]+$/;
const PHONE_REGEX = /^\d+$/;
const signInAdminSchema = Joi.object({
    username: Joi.string().required().regex(ADMIN_USERNAME_REGEX),
    password: GeneralValidate.passwordSchema.required()
}).unknown();
const signInUserSchema = Joi.object({
    email: Joi.string().required().email(),
    password: GeneralValidate.passwordSchema.required()
}).unknown();
const signInStaffSchema = Joi.object({
    phone: GeneralValidate.phoneSchema.required(),
    password: GeneralValidate.passwordSchema.required()
}).unknown();
const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required()
}).unknown();
const resetPasswordSchema = Joi.object({
    newPassword: GeneralValidate.passwordSchema.required()
}).unknown();
export default class SignInValidate {
    static signInAdmin(req, res, next) {
        const validationResult = signInAdminSchema.validate(req.body);
        if (validationResult.error) {
            res.status(400).json(validationResult.error.message);
            return;
        }
        next();
    }
    static signInUser(req, res, next) {
        const validationResult = signInUserSchema.validate(req.body);
        if (validationResult.error) {
            res.status(400).json(validationResult.error.message);
            return;
        }
        next();
    }
    static signInStaff(req, res, next) {
        const validationResult = signInStaffSchema.validate(req.body);
        if (validationResult.error) {
            res.status(400).json(validationResult.error.message);
            return;
        }
        next();
    }
    static forgotPassword(req, res, next) {
        const validationResult = forgotPasswordSchema.validate(req.body);
        if (validationResult.error) {
            res.status(400).json(validationResult.error.message);
            return;
        }
        next();
    }
    static resetPassword(req, res, next) {
        const validationResult = resetPasswordSchema.validate(req.body);
        if (validationResult.error) {
            res.status(400).json(validationResult.error.message);
            return;
        }
        next();
    }
}
