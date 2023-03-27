const express = require("express");
const sendDint = express.Router();
// require("dotenv").config({ path: `../env.local`, override: true });
require("dotenv").config();
const bodyParser = require("body-parser");
const { getData, generate, checkout } = require("../controller/dint");
const { approval, getUserData } = require("../controller/payout");

sendDint.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
sendDint.use(bodyParser.json());



sendDint.post("/send-dint", async (req, res) => {
  if (req.headers.apikey !== process.env.SECURITY_KEY) {
    console.log("req.headers", req.headers.apikey === process.env.SECURITY_KEY);

    return res.send({ success: false, message: "invalid api key" });
  }
  if (!process.env.OWNER_PRIVATE_KEY) {
    return res.send({ success: false, message: "private key not found" });
  }
 
  const { sender_id, reciever_id, amount, priceInUSD} = req.body;

  try {
    getData(sender_id, reciever_id, amount, priceInUSD)
      .then((data) => {
        generate(data, amount)
          .then((data) => {
            // if (data.data) {
            //   const users = ethers.utils.defaultAbiCoder.decode(
            //     ["address", "address"],
            //     data.data
            //   );
            //   const sender = users[0];
            //   const reciever = users[1];
            return res.send({
              success: true,
              Hash: data.res.hash,
              sender: data.data.userAddress,
              reciever: data.data.recieverAddress,
              amount: amount,
            });
            // } else {
            //   return res.send("Something went wrong. Please try again");
            // }
          })
          .catch((err) => {
            return res.send({
              success: false,
              message:
                "Something went wrong while making transaction. Please try again!",
              error: err,
            });
          });
      })
      .catch((error) => {
        console.log("err", error);
        return res.send({
          sucess: false,
          message: "Something went wrong while getting user data.",
        });
      });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: "Something went wrong. Please try again!",
    });
  }
});

sendDint.post("/checkout", checkout);

sendDint.post("/withdraw-dint", async (req, res) => {
   if (req.headers.apikey !== process.env.SECURITY_KEY) {
     console.log(
       "req.headers",
       req.headers.apikey === process.env.SECURITY_KEY
     );

     return res.send({ success: false, message: "invalid api key" });
   }
   if (!process.env.OWNER_PRIVATE_KEY) {
     return res.send({ success: false, message: "private key not found" });
   }
  const { user_id, amount } = req.body;
  console.log(" req.body", req.body);

  try {
    getUserData(user_id, amount)
      .then((data) => {
        approval(data, amount)
          .then((data) => {
            // if (data.data) {
            //   const users = ethers.utils.defaultAbiCoder.decode(
            //     ["address", "address"],
            //     data.data
            //   );
            //   const sender = users[0];
            //   const reciever = users[1];
            return res.send({
              success: true,
              hash: data.res.hash,
              userAddress: data.data.userAddress,
              amount: amount,
            });
            // } else {
            //   return res.send("Something went wrong. Please try again");
            // }
          })
          .catch((err) => {
            return res.send({
              success: false,
              message:
                "Something went wrong while making transaction. Please try again!",
              error: err,
            });
          });
      })
      .catch((error) => {
        console.log("err", error);
        return res.send({
          sucess: false,
          message: "Something went wrong while getting user data.",
          error: error,
        });
      });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: "Something went wrong. Please try again!",
      error: err,
    });
  }
});



module.exports = sendDint;
