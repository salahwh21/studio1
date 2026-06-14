const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

const csrfProtection = (req, res, next) => {
  if (process.env.NODE_ENV !== 'production') return next();
  if (SAFE_METHODS.includes(req.method)) return next();

  const origin = req.headers['origin'];
  const referer = req.headers['referer'];
  const allowedOrigin = process.env.FRONTEND_URL;

  if (!allowedOrigin) return next();

  const source = origin || (referer ? new URL(referer).origin : null);

  if (!source || source !== allowedOrigin) {
    return res.status(403).json({ error: 'CSRF validation failed', code: 'CSRF_REJECTED' });
  }

  next();
};

module.exports = csrfProtection;
