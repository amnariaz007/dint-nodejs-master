const ethers = require("ethers");
const Web3 = require("web3");
const DintTokenAbBI = require("../DintTokenABI.json");
// require("dotenv").config({ path: `../env.local`, override: true });
require("dotenv").config();
const { Client } = require("pg");
const dintDistributerABI = require("../DintDistributerABI.json");
const fernet = require("fernet");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const axios = require('axios');
const express = require("express");
const app = express();
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

const DintTokenAddress = process.env.DINT_TOKEN_ADDRESS;
const DintDistributerAddress = process.env.DINT_DIST_ADDRESS;
const ownerPrivateKey = process.env.OWNER_PRIVATE_KEY;
const web3 = new Web3(process.env.RPC_PROVIDER);
// const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_PROVIDER);

const ownerSigner = new ethers.Wallet(ownerPrivateKey, provider);

const generate = async (data, amount) => {
  const nonce = await ownerSigner.getTransactionCount("latest");
  if (amount >= 0) {
    const signer = new ethers.Wallet(data.userPrivateKey, provider);
    const contract = new ethers.Contract(
      DintTokenAddress.toLowerCase(),
      DintTokenAbBI,
      ownerSigner
    );
    const domainName = "Dint"; // token name
    const domainVersion = "MMT_0.1";
    const chainId = 137; // this is for the chain's ID.
    const contractAddress = DintTokenAddress.toLowerCase();
    const spender = DintDistributerAddress.toLowerCase();
    const deadline = 2673329804;
    var account = data.userAddress.toLowerCase();
    const domain = {
      name: domainName,
      version: domainVersion,
      verifyingContract: contractAddress.toLowerCase(),
      chainId,
    };

    const domainType = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ];
    const Permit = [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ];
    const currentApproval = await contract.allowance(
      data.userAddress,
      DintDistributerAddress
    );

    console.log("currentApproval", currentApproval);

    if (Number(currentApproval) == 0) {
      const value = BigInt(
        Number(ethers.utils.parseUnits(amount.toString(), "ether"))
      );

      const currentnonce = await contract.nonces(account);
      const newNonce = currentnonce.toNumber();
      const permit = {
        owner: account,
        spender,
        value,
        nonce: newNonce,
        deadline,
      };
      const generatedSig = await signer._signTypedData(
        domain,
        { Permit: Permit },
        permit
      );


      let sig = await ethers.utils.splitSignature(generatedSig);

      const getGasPrice = async () => {
        try {
          const { standard, fast } = await axios
            .get("https://gasstation-mainnet.matic.network/")
            .then((res) => res.data);
      
          const fee = standard + (fast - standard) / 3;
          return ethers.utils.parseUnits(fee.toFixed(2).toString(), "gwei");
        } catch (error) {
          console.log("gas error");
          console.error(error);
          return ethers.utils.parseUnits("200", "gwei");
        }
      };
 // Get the current gas price
 let gasPrice = await getGasPrice();
 console.log("Gas Price:", gasPrice.toString());

 // Get the nonce for the transaction
 const nonce = await signer.getTransactionCount("latest");
 console.log("Nonce:", nonce);

 // Set the gas limit to 70,000 units
 const gasLimit = ethers.utils.parseUnits('70000', 'wei');
      
      return new Promise(async (resolve, reject) => {
        contract
          .permit(account, spender, value, deadline, sig.v, sig.r, sig.s, {
            gasLimit: gasLimit,
            gasPrice: gasPrice,
          })
          .then((res) => {
            console.log("Approval Hash", res.hash);
            send(data, value)
              .then((data) => {
                resolve(data);
              })
              .catch((err) => {
                reject(err);
              });
          })
          .catch((err) => {
            console.log("err permit", err);
            reject(err);
          });
      });
    } else {
      const currentnonce = await contract.nonces(account);
      const newNonce = currentnonce.toNumber();
      const permit = {
        owner: account,
        spender,
        value: 0,
        nonce: newNonce,
        deadline,
      };
      const generatedSig = await signer._signTypedData(
        domain,
        { Permit: Permit },
        permit
      );
      let sig = await ethers.utils.splitSignature(generatedSig);
      const res = await contract.permit(
        account,
        spender,
        0,
        deadline,
        sig.v,
        sig.r,
        sig.s,
        { 
          gasLimit: gasLimit,
          gasPrice: gasPrice,
        }
      );
      const value = BigInt(
        Number(ethers.utils.parseUnits(amount.toString(), "ether"))
      );
      const permitNew = {
        owner: account,
        spender,
        value,
        nonce: newNonce + 1,
        deadline,
      };
      const generatedNewSig = await signer._signTypedData(
        domain,
        { Permit: Permit },
        permitNew
      );

      let sigNew = ethers.utils.splitSignature(generatedNewSig);
      return new Promise((resolve, reject) => {
        contract
          .permit(
            account,
            spender,
            value,
            deadline,
            sigNew.v,
            sigNew.r,
            sigNew.s,
            { 
              gasLimit: gasLimit,
              gasPrice: gasPrice,
            }
          )
          .then((res) => {
            console.log("Approval Hash", res.hash);
            send(data, value)
              .then((data) => {
                resolve(data);
              })
              .catch((err) => {
                reject(err);
              });
          })
          .catch((err) => {
            console.log("err permit", err);
            reject(err);
          });
      });
    }
  }
};


const getGasPrice = async () => {
  try {
    const { standard, fast } = await axios
      .get("https://gasstation-mainnet.matic.network/")
      .then((res) => res.data);

    const fee = standard + (fast - standard) / 3;
    return ethers.utils.parseUnits(fee.toFixed(2).toString(), "gwei");
  } catch (error) {
    console.log("gas error");
    console.error(error);
    return ethers.utils.parseUnits("200", "gwei");
  }
};

const send = async (data, value) => {
  try {
    const priceInUSD = 1000000;

        // Get the nonce for the transaction
    const nonce = await ownerSigner.getTransactionCount("latest");
    console.log("Nonce:", nonce);
    
    // Set the gas limit to 70,000 units
    const gasLimit = ethers.utils.parseUnits('70000', 'wei');

    const gasPrice = await getGasPrice();
    console.log("Gas Price:", gasPrice.toString());
    const dintDistContract = new ethers.Contract(
      DintDistributerAddress.toLowerCase(),
      dintDistributerABI,
      ownerSigner
    );

    const tx = await  dintDistContract.sendDint(
      data.userAddress,
      data.recieverAddress,
      value,
      priceInUSD,
      nonce,
      {
     
        gasLimit: gasLimit,
        gasPrice: gasPrice,
     
      }
    );
    console.log("Transaction Hash", tx.hash);
    console.log("Dint Price =", priceInUSD);
    return { tx };
  } catch (error) {
    console.log("err", error);
    return { error };
  }
};

const getData = async (sender_id, reciever_id, amount) => {
  return new Promise((resolve, reject) => {
    client
      .query(
        `select wallet_private_key, wallet_address, id from auth_user where id = ${sender_id} or id = ${reciever_id};`
      )
      .then((res) => {
        const data = res.rows;
        let sender = data.find((el) => {
          return el.id === sender_id;
        });
        let reciever = data.find((el) => {
          return el.id === reciever_id;
        });
        const secret = new fernet.Secret(process.env.ENCRYPTION_KEY);
        const bufUserPvt = Buffer.from(sender.wallet_private_key);
        const tokenUserPvt = new fernet.Token({
          secret: secret,
          token: bufUserPvt.toString(),
          ttl: 0,
        });
        const userPrivateKey = tokenUserPvt.decode();
        const bufUserAdd = Buffer.from(sender.wallet_address);
        const tokenUserAdd = new fernet.Token({
          secret: secret,
          token: bufUserAdd.toString(),
          ttl: 0,
        });
        const userAddress = tokenUserAdd.decode();
        const bufRecieverAdd = Buffer.from(reciever.wallet_address);
        const tokenRecieverAdd = new fernet.Token({
          secret: secret,
          token: bufRecieverAdd.toString(),
          ttl: 0,
        });
        const recieverAddress = tokenRecieverAdd.decode();
        resolve({ userPrivateKey, userAddress, recieverAddress });
      })
      .catch((error) => {
        console.log(error.stack);
        reject(error.stack);
      });
  });
};

const checkout = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const charge = await stripe.charges.create({
    receipt_email: req.body.email,
    amount: parseInt(req.body.amount) * 100, //USD*100
    currency: "usd",
    card: req.body.cardDetails.card_id,
    customer: req.body.cardDetails.customer_id,
    metadata: { walletAddr: req.body.walletAddr },
  });
  res.send(charge);
};

module.exports = { getData, generate, checkout };
