const express = require("express");
// require("dotenv").config({ path: `.env.local`, override: true });
require("dotenv").config();
const cors = require("cors");
const { Client } = require("pg");


const app = express();
app.use(cors());
const stripeApp = require("./routes/payment");
const sendDint = require("./routes/dint");

app.use("/api/webhooks", stripeApp);
app.use("/api", sendDint);

const PORT = 5000;

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
client.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

// Custom Middleware
app.use((req, res, next) => {
  let validIps = ["::12", "::1", "::ffff:127.0.0.1", process.env.WHITELIST_IP]; // Put your IP whitelist in this array
  console.log("ip", validIps);
  console.log("process", typeof process.env.whitelistIp);
  console.log("req.socket.remoteAddress", req.socket.remoteAddress);
  if (process.env.whitelistIp === "inactive") {
    console.log("IP ok");
    next();
  } else if (validIps.includes(req.socket.remoteAddress)) {
    next();
  } else {
    // Invalid ip
    console.log("Bad IP: " + req.socket.remoteAddress);
    const err = new Error("Bad IP: " + req.socket.remoteAddress);
    next(err);
  }
});
// Error handler
app.use((err, req, res, next) => {
  console.log("Error handler", err);
  res.status(err.status || 500);
  res.send("get your ip whitelisted for accessing this");
});

app.listen(PORT, (error) => {
  if (!error)
    console.log(
      "Server is Successfully Running, and App is listening on port " + PORT
    );
  else console.log("Error occurred, server can't start", error);
});

