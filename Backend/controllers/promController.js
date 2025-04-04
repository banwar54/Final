const client = require("prom-client");

const reqResTime = new client.Histogram({
    name: "http_express_req_res_time",
    help: "This tells how much time is taken by request and response",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1, 5]
});

const totalReqCounter = new client.Counter({
    name: "total_req",
    help: "total requests",
})

const quiz2Requests = new client.Counter({
    name: "quiz2_total_requests",
    help: "Total number of requests received on /quiz2",
    labelNames: ["method", "status_code"]
});

module.exports = { reqResTime  , totalReqCounter ,quiz2Requests};
