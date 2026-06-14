const db = require('../config/database');

// Middleware to extract and validate tenant from request
const tenantMiddleware = async (req, res, next) => {
  try {
    // Get company_id from:
    // 1. User's company_id (from JWT)
    // 2. X-Company-ID header (for super admins)
    // 3. Subdomain (company.alwameed.com)

    let companyId = req.user?.company_id;

    // Super admin can switch companies via header
    const headerCompanyId = req.headers['x-company-id'];
    if (headerCompanyId && req.user?.is_super_admin) {
      companyId = parseInt(headerCompanyId);
    }

    // Extract from subdomain if not set
    if (!companyId) {
      const host = req.headers.host || '';
      const subdomain = host.split('.')[0];
      if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
        const result = await db.query(
          'SELECT id FROM companies WHERE slug = $1 AND is_active = true',
          [subdomain]
        );
        if (result.rows.length > 0) {
          companyId = result.rows[0].id;
        }
      }
    }

    // Default to company 1 if nothing found
    req.companyId = companyId || 1;

    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    req.companyId = 1;
    next();
  }
};

// Helper to add company filter to queries
const withTenant = (req) => {
  return {
    companyId: req.companyId || 1,
    filter: `company_id = ${req.companyId || 1}`,
  };
};

// Validate tenant limits (orders, users)
const checkTenantLimits = async (req, res, next) => {
  try {
    const companyId = req.companyId || 1;

    const result = await db.query(
      `SELECT c.max_orders_per_month, c.max_users,
        (SELECT COUNT(*) FROM orders WHERE company_id = c.id AND created_at >= date_trunc('month', CURRENT_DATE)) as current_orders,
        (SELECT COUNT(*) FROM users WHERE company_id = c.id) as current_users
       FROM companies c WHERE c.id = $1`,
      [companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const limits = result.rows[0];
    req.tenantLimits = {
      ordersRemaining: limits.max_orders_per_month - limits.current_orders,
      usersRemaining: limits.max_users - limits.current_users,
      canAddOrder: limits.current_orders < limits.max_orders_per_month,
      canAddUser: limits.current_users < limits.max_users,
    };

    next();
  } catch (error) {
    console.error('Tenant limits error:', error);
    next();
  }
};

module.exports = { tenantMiddleware, withTenant, checkTenantLimits };
