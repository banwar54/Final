const { createLogger, transports } = require("winston");
const LokiTransport = require("winston-loki");
const options = {
  transports: [
    new LokiTransport({
        labels:{
            app_name:"quiz_backend",
        },
        host: "http://localhost:3100"
    })
  ]
 };
const logger = createLogger(options);

module.exports = logger;