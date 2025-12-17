module.exports = {
    apps: [{
        name: "utilites",
        script: "./node_modules/next/dist/bin/next",
        args: "start",
        env: {
            NODE_ENV: "production",
            PORT: 8002
        }
    }]
}
