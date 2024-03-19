export async function preventFirstLogin(req, res, next) {
    const firstLogin = !!req.firstLogin;
    if (firstLogin) {
        res.status(400).json('Required change password before use this feature');
    }
    else {
        next();
    }
}
