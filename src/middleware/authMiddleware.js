import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {
    let token = null;

    // Vérification dans les en-têtes
    if (req.headers.authorization) {
      token = req.headers.authorization.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : req.headers.authorization;
    }

    if (!token && req.headers['x-access-token']) {
      token = req.headers['x-access-token'];
    }

    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      idUser: decoded.userId
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid Token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Expired Token' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Error during authentication' });
  }
};
