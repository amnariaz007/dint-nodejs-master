const winston = require("winston");
const express = require("express");
require("dotenv").config();
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const ethers = require("ethers");
const { transferDint } = require("../controller/stripe");
const stripeApp = express.Router();
stripeApp.use(express.raw({ type: "application/json" }));
stripeApp.use(cors());

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});
logger.log({
  level: "info",
  message: "What time is the testing at?",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

stripeApp.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");

    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      const amount = ethers.utils.parseEther(
        String(event.data.object.amount / 100)
      );
      const destAddr = event.data.object.metadata.walletAddr;
      logger.log({
        level: "info",
        message: "Event Created",
      });
      if (
        event.type == "payment_intent.succeeded" ||
        event.type == "charge.succeeded"
      ) {
        transferDint({ amount, destAddr })
          .then((tx) => {
            res.json({ received: true });
          })
          .catch((error) => {
            logger.log({
              level: "error",
              message: error,
            });
            res.status(400).send(`Webhook Error: ${error.message}`);
          });
      } else {
        res.json({ received: true });
      }
    } catch (err) {
      res.status(400).json({
        sucess: false,
        message: `Something went wrong. Error:${err.message}`,
        error: err,
      });
    }
  }
);

module.exports = stripeApp;
