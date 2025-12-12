/**
 * PM2 Ecosystem Configuration
 * 
 * Usage:
 *   Development: pm2 start ecosystem.config.js --env development
 *   Production:  pm2 start ecosystem.config.js --env production
 * 
 * Commands:
 *   pm2 start ecosystem.config.js   - Start all apps
 *   pm2 stop all                    - Stop all apps
 *   pm2 restart all                 - Restart all apps
 *   pm2 logs                        - View logs
 *   pm2 monit                       - Monitor dashboard
 *   pm2 save                        - Save current process list
 *   pm2 startup                     - Generate startup script
 */

module.exports = {
    apps: [
        // ================================
        // Backend API (Express)
        // ================================
        {
            name: 'delivery-api',
            script: 'src/index.js',
            cwd: './backend',
            instances: 'max', // Use all CPU cores in production
            exec_mode: 'cluster',

            // Environment variables
            env: {
                NODE_ENV: 'development',
                PORT: 3001
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 3001
            },

            // Logging
            log_file: './logs/api-combined.log',
            error_file: './logs/api-error.log',
            out_file: './logs/api-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,

            // Auto-restart settings
            watch: false, // Set to true for development
            max_memory_restart: '500M',
            restart_delay: 3000,
            max_restarts: 10,
            min_uptime: '10s',

            // Graceful shutdown
            kill_timeout: 5000,
            wait_ready: true,
            listen_timeout: 10000,
        },

        // ================================
        // Frontend (Next.js)
        // ================================
        {
            name: 'delivery-frontend',
            script: 'npm',
            args: 'start',
            cwd: './',
            instances: 1,
            exec_mode: 'fork',

            // Environment variables
            env: {
                NODE_ENV: 'development',
                PORT: 5000
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5000
            },

            // Logging
            log_file: './logs/frontend-combined.log',
            error_file: './logs/frontend-error.log',
            out_file: './logs/frontend-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,

            // Auto-restart settings
            watch: false,
            max_memory_restart: '1G',
            restart_delay: 5000,
            max_restarts: 10,
            min_uptime: '30s',
        }
    ],

    // ================================
    // Deployment Configuration
    // ================================
    deploy: {
        production: {
            // SSH connection
            user: 'deploy',
            host: 'your-server-ip',
            ref: 'origin/main',
            repo: 'git@github.com:your-username/your-repo.git',
            path: '/var/www/delivery-platform',

            // Pre-deployment commands (on local machine)
            'pre-deploy-local': '',

            // Post-deployment commands (on server)
            'post-deploy': 'npm install && npm run build && cd backend && npm install && npm run migrate && pm2 reload ecosystem.config.js --env production',

            // Pre-setup commands (first deployment only)
            'pre-setup': 'mkdir -p /var/www/delivery-platform/logs'
        }
    }
};
