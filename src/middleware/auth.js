import jwt from 'jsonwebtoken'

export default function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized - Authentication token required' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { idUser: payload.idUser };
        return next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

export function optionalAuthenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { idUser: payload.idUser };
    } catch (err) {
        // ignore invalid token
    }
    return next();
}