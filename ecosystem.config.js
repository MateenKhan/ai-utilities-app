module.exports = {
    apps: [{
        name: "utilities-app",
        script: "npm",
        args: "start",
        env: {
            NODE_ENV: "production",
            PORT: 8002
        }
    }]
}
