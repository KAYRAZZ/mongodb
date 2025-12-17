module.exports = {
    apps: [
        {
            name: 'airbnb-server',
            script: './dist/server.js',
            instances: 'max',
            exec_mode: 'cluster',
            env: {
                NODE_ENV: 'development',
                PORT: 3000
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000
            },
            merge_logs: true,
            autorestart: true,
            watch: false,
            listen_timeout: 10000,
            kill_timeout: 5000
        }
    ],
};
