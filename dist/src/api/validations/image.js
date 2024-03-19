import Joi from 'joi';
import * as GeneralValidate from './general.js';
const imageUploadSchema = Joi.object({
    imageFile: GeneralValidate.imageFileSchema.required()
}).unknown();
export default class ImageValidate {
    static imageUpload(req, res, next) {
        if (!req.files) {
            res.json('Require image file');
            return;
        }
        const validationResult = imageUploadSchema.validate(req.files);
        if (validationResult.error) {
            res.status(400).json(validationResult.error.message);
            return;
        }
        next();
    }
}
