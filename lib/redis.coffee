if process.env.NODE_ENV is "production"
  redis = require("redis-url").connect(process.env.REDISTOGO_URL)
else
  redis = require("redis").createClient()

module.exports = redis
