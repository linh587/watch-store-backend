import Joi from 'joi';
import * as GeneralValidate from './general.js';
const updateInformationSchema = Joi.object({
    phone: GeneralValidate.phoneSchema,
    name: GeneralValidate.vietnameseSchema.required(),
    gender: GeneralValidate.genderSchema.required(),
    dateOfBirth: Joi.string().isoDate().required(),
    avatar: Joi.string(),
    email: Joi.string().email().required(),
    address: Joi.string(),
    longitude: Joi.string().regex(GeneralValidate.COORDINATE_REGEX).when('address', { is: Joi.exist(), then: Joi.required() }),
    latitude: Joi.string().regex(GeneralValidate.COORDINATE_REGEX).when('address', { is: Joi.exist(), then: Joi.required() })
}).unknown();
const addToCartShema = Joi.object({
    productPriceId: Joi.string().required(),
    quality: Joi.number().integer().positive().required()
}).unknown();
const updateCartDetailSchema = Joi.object({
    quality: Joi.number().integer().positive().required()
}).unknown();
const markNotificationIsSeenSchema = Joi.object({
    notificationIds: Joi.array().items(Joi.string()).min(1).required()
}).unknown();
const addRatingSchema = Joi.object({
    star: Joi.number().min(1).max(5).integer().required(),
    content: Joi.string().allow(null, ''),
}).unknown();
const updateRatingSchema = Joi.object({
    star: Joi.number().min(1).max(5).integer().required(),
    content: Joi.string().allow(null, ''),
}).unknown();
export default class UserValidate {
    static updateInformation(req, res, next) {
        if (!req.fields) {
            res.status(400).json('Unknown error');
            return;
        }
        const validationResult = updateInformationSchema.validate(req.fields);
        if (validationResult.error) {
            res.status(400).json(validationResult.error.message);
            return;
        }
        if (req.files && req.files.avatarFile) {
            const imageValidateResult = GeneralValidate.imageFileSchema.validate(req.files.avatarFile);
            if (imageValidateResult.error) {
                res.status(400).json(imageValidateResult.error.message);
                return;
            }
        }
        next();
    }
    static updatePassword(req, res, next) {
        const validationResult = GeneralValidate.updatePasswordSchema.validate(req.body);
        if (validationResult.error) {
            res.status(400).json(validationResult.error.message);
            return;
        }
        next();
    }
    static addToCart(req, res, next) {
        const validationResult = addToCartShema.validate(req.body);
        if (validationResult.error) {
            res.status(400).json(validationResult.error.message);
            return;
        }
        next();
    }
    static updateCartDetail(req, res, next) {
        const validationResult = updateCartDetailSchema.validate(req.body);
        if (validationResult.error) {
            res.status(400).json(validationResult.error.message);
            return;
        }
        next();
    }
    static createOrder(req, res, next) {
        const validationResult = GeneralValidate.createOrderSchema.validate(req.body);
        if (validationResult.error) {
            res.status(400).json(validationResult.error.message);
            return;
        }
        next();
    }
    static markNotificationIsSeen(req, res, next) {
        const validationResult = markNotificationIsSeenSchema.validate(req.body);
        if (validationResult.error) {
            res.status(400).json(validationResult.error.message);
            return;
        }
        next();
    }
    static addRating(req, res, next) {
        const validationResult = addRatingSchema.validate(req.body);
        if (validationResult.error) {
            res.status(400).json(validationResult.error.message);
            return;
        }
        next();
    }
    static updateRating(req, res, next) {
        const validationResult = updateRatingSchema.validate(req.body);
        if (validationResult.error) {
            res.status(400).json(validationResult.error.message);
            return;
        }
        next();
    }
}
