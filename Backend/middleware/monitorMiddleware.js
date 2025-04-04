const responseTime = require("response-time");
const { reqResTime ,totalReqCounter ,quiz2Requests} = require("../controllers/promController");

const monitorMiddleware = responseTime((req, res, time) => {
    if (req.originalUrl !== "/metrics") { 
        totalReqCounter.inc();
        reqResTime.labels(req.method, 
                          req.originalUrl, 
                          res.statusCode.toString())
                          .observe(time);

        // Track total requests on /quiz2
        if (req.originalUrl.startsWith("/quiz2")) {
            quiz2Requests.inc({ method: req.method, 
                                status_code: res.statusCode.toString() });
        }
    }
});

module.exports = { monitorMiddleware };
