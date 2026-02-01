module.exports = {
  apps: [{
    name: 'claude-bot',
    script: 'src/index.ts',
    interpreter: 'node_modules/.bin/tsx',
    watch: ['src'],
    ignore_watch: ['node_modules', 'dist', '.git'],
    autorestart: true,
    max_restarts: 10,
    env: {
      NODE_ENV: 'production',
      PORT: 4040
    }
  }]
}
