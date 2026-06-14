const logger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')?.substring(0, 100),
    };

    if (res.statusCode >= 500) {
      console.error(JSON.stringify(log));
    } else if (res.statusCode >= 400) {
      console.warn(JSON.stringify(log));
    } else if (process.env.LOG_LEVEL === 'debug' || req.originalUrl.includes('/api/')) {
      console.log(JSON.stringify(log));
    }
  });

  next();
};

module.exports = logger;
