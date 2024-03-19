import formidable from 'formidable';
export function extractFormData(req, res, next) {
    const contentType = req.headers['content-type'];
    if (typeof contentType !== 'string' || contentType.split(';')[0] !== 'multipart/form-data') {
        res.status(418).json('Sorry, we use form-data');
        return;
    }
    const form = new formidable.IncomingForm({ encoding: 'utf-8', keepExtensions: true, multiples: true });
    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.log(err);
            res.status(400).json('Just error');
            return;
        }
        req.fields = fields;
        req.files = files;
        next();
    });
}
