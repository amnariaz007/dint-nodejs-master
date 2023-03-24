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
// const client = new Client({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });
// client.connect(function (err) {
//   if (err) throw err;
//   console.log("Connected!");
// });
const INFURA_ID = 'a9936394d3d94f468393a53fecdcd87f';
const DintTokenAddress = process.env.DINT_TOKEN_ADDRESS;
const DintDistributerAddress = process.env.DINT_DIST_ADDRESS;
const ownerPrivateKey = process.env.OWNER_PRIVATE_KEY;
const web3 = new Web3(`https://sepolia.infura.io/v3/${INFURA_ID}`);
// const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const provider = new ethers.providers.JsonRpcProvider((`https://sepolia.infura.io/v3/${INFURA_ID}`));

//const provider = new ethers.providers.JsonRpcProvider(`https://sepolia.infura.io/v3/${INFURA_ID}`);

const ownerSigner = new ethers.Wallet(ownerPrivateKey, provider);

const generate = async (data, amount) => {

  if (amount >= 0) {
    const signer = new ethers.Wallet(data.userPrivateKey, provider);
    const contract = new ethers.Contract(
      DintTokenAddress.toLowerCase(),
      DintTokenAbBI,
      ownerSigner
    );
    const domainName = "Dint"; // token name
    const domainVersion = "MMT_0.1";
    const chainId = 11155111; // this is for the chain's ID.
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



   
    // const domainType = [
    //   { name: "name", type: "string" },
    //   { name: "version", type: "string" },
    //   { name: "chainId", type: "uint256" },
    //   { name: "verifyingContract", type: "address" },
    // ];
    // const Permit = [
    //   { name: "owner", type: "address" },
    //   { name: "spender", type: "address" },
    //   { name: "value", type: "uint256" },
    //   { name: "nonce", type: "uint256" },
    //   { name: "deadline", type: "uint256" },
    // ];
    // const currentApproval = await contract.allowance(
    //   data.userAddress,
    //   DintDistributerAddress
    // );


      // Get the current allowance for the spender (DintDistributerAddress) from the ownerSigner's wallet
      // const ownerAllowance = await contract.approve(
      //   ownerSigner,
      //   DintDistributerAddress,
      //   ethers.utils.parseUnits('100', 18) // 100 Dint tokens with 18 decimal places
      // );
  

      // Log the current allowances for debugging purposes
      console.log(`Current allowance from signer's wallet: ${currentApproval}`);
      console.log(`Current allowance from ownerSigner's wallet: ${ownerAllowance}`);


//     if (Number(currentApproval) >= 0) {
//       const value = BigInt(
//         Number(ethers.utils.parseUnits(amount.toString(), "ether"))
//       );

//       const currentnonce = await contract.nonces(account);
//       const newNonce = currentnonce.toNumber();
//       const permit = {
//         owner: account,
//         spender,
//         value,
//         nonce: newNonce,
//         deadline,
//       };
//       const generatedSig = await signer._signTypedData(
//         domain,
//         { Permit: Permit },
//         permit
//       );


//       let sig = await ethers.utils.splitSignature(generatedSig);

//       const getGasPrice = async () => {
//         try {
//           const { standard, fast } = await axios
//             .get("https://gasstation-mainnet.matic.network/")
//             .then((res) => res.data);
      
//           const fee = standard + (fast - standard) / 3;
//           return ethers.utils.parseUnits(fee.toFixed(2).toString(), "gwei");
//         } catch (error) {
//           console.log("gas error");
//           console.error(error);
//           return ethers.utils.parseUnits("200", "gwei");
//         }
//       };
//  // Get the current gas price
//  let gasPrice = await getGasPrice();
//  console.log("Gas Price:", gasPrice.toString());

//  // Get the nonce for the transaction
//  const nonce = await signer.getTransactionCount("latest");
//  console.log("Nonce:", nonce);

//  // Set the gas limit to 70,000 units
//  const gasLimit = ethers.utils.parseUnits('600000', 'wei');
      
//       return new Promise(async (resolve, reject) => {
//         contract
//           .permit(account, spender, value, deadline, sig.v, sig.r, sig.s, {
//             gasLimit: gasLimit,
//             gasPrice: gasPrice,
//           })
//           .then((res) => {
//             console.log("Approval Hash", res.hash);
//             send(data, value)
//               .then((data) => {
//                 resolve(data);
//               })
//               .catch((err) => {
//                 reject(err);
//               });
//           })
//           .catch((err) => {
//             console.log("err permit", err);
//             reject(err);
//           });
//       });
//     } else {
//       const currentnonce = await contract.nonces(account);
//       const newNonce = currentnonce.toNumber();
//       const permit = {
//         owner: account,
//         spender,
//         value,
//         nonce: newNonce,
//         deadline,
//       };
//       const generatedSig = await signer._signTypedData(
//         domain,
//         { Permit: Permit },
//         permit
//       );
//       let sig = await ethers.utils.splitSignature(generatedSig);
//       const res = await contract.permit(
//         account,
//         spender,
//         value,
//         deadline,
//         sig.v,
//         sig.r,
//         sig.s,
//         { 
//           gasLimit: gasLimit,
//           gasPrice: gasPrice,
//         }
//       );
//       const value = BigInt(
//         Number(ethers.utils.parseUnits(amount.toString(), "ether"))
//       );
//       const permitNew = {
//         owner: account,
//         spender,
//         value,
//         nonce: newNonce + 1,
//         deadline,
//       };
//       const generatedNewSig = await signer._signTypedData(
//         domain,
//         { Permit: Permit },
//         permitNew
//       );

//       let sigNew = ethers.utils.splitSignature(generatedNewSig);
//       return new Promise((resolve, reject) => {
//         contract
//           .permit(
//             account,
//             spender,
//             value,
//             deadline,
//             sigNew.v,
//             sigNew.r,
//             sigNew.s,
//             { 
//               gasLimit: gasLimit,
//               gasPrice: gasPrice,
//             }
//           )
//           .then((res) => {
//             console.log("Approval Hash", res.hash);
//             console.log("Value", value);
//             send(data, value)
//               .then((data) => {
//                 resolve(data);
//               })
//               .catch((err) => {
//                 reject(err);
//               });
//           })
//           .catch((err) => {
//             console.log("err permit", err);
//             reject(err);
//           });
//       });
//     }
   }
};


const getGasPrice = async () => {
  try {
    const { standard, fast } = await axios
      .get("https://sepolia.infura.io/v3/")
      .then((res) => res.data);

    const fee = standard + (fast - standard) / 3;
    return ethers.utils.parseUnits(fee.toFixed(2).toString(), "gwei");
  } catch (error) {
    console.log("gas error");
    console.error(error);
    return ethers.utils.parseUnits("220", "gwei");
  }
};

   
// const send = async (data, value) => {
//   try {
//     const priceInUSD = 1000000;
//     const gasLimit = ethers.utils.parseUnits('2500000', 'wei');
//     let nonce = await ownerSigner.getTransactionCount('pending');
//     let gasPrice = await getGasPrice();
//     let attempt = 1;
//     let txHash = null;

//     while (!txHash) {
//       try {
//         const dintDistContract = new ethers.Contract(
//           DintDistributerAddress.toLowerCase(),
//           dintDistributerABI,
//           ownerSigner
//         );

//         const tx = await dintDistContract.sendDint(
//           data.userAddress,
//           data.recieverAddress,
//           value,
//           priceInUSD,
//           {
//             nonce: nonce,
//             gasLimit: gasLimit,
//             gasPrice: gasPrice,
//           }
//         );

//         console.log("Transaction Sent Successfully");
//         console.log("Transaction Hash:", tx.hash);
//         console.log("Dint Price:", priceInUSD);
//         txHash = tx.hash;

//         const receipt = await tx.wait();
//         gasPrice = receipt.effectiveGasPrice;

//         console.log("Transaction Receipt:", receipt);
//         console.log("Transaction completed successfully!");
//       } catch (error) {
//         console.log(`Attempt ${attempt}: ${error.message}`);
//         attempt++;

//         if (error.reason === 'replacement' || error.code === 'TRANSACTION_REPLACED') {
//           console.log("There was an issue with your transaction. Transaction was replaced");
//           return { error };
//         } else if (error.message.includes("replacement transaction underpriced")) {
//           gasPrice = await getGasPrice();
//           console.log("New Gas Price:", gasPrice.toString());
//         } else if (error.message.includes("nonce too low")) {
//           nonce = await ownerSigner.getTransactionCount('pending');
//           console.log("New Nonce:", nonce);
//         } else if (error.message.includes("insufficient funds")) {
//           console.log(`Error: ${error.message}`);
//           return { error };
//         } else if (error.message.includes("transfer amount exceeds allowance")) {
//           console.log(`Error: ${error.message}`);
//           return { error };
//         } else {
//           throw error;
//         }
//       }
//     }

//     return { txHash };
//   } catch (error) {
//     console.log("There was an issue processing your transaction.");
//     console.log("Error:", error);
//     return { error };
//   }
// };



// const getData = async (sender_id, reciever_id, amount) => {
//   return new Promise((resolve, reject) => {
//     client
//       .query(
//         `select wallet_private_key, wallet_address, id from auth_user where id = ${sender_id} or id = ${reciever_id};`
//       )
//       .then((res) => {
//         const data = res.rows;
//         let sender = data.find((el) => {
//           return el.id === sender_id;
//         });
//         let reciever = data.find((el) => {
//           return el.id === reciever_id;
//         });
//         const secret = new fernet.Secret(process.env.ENCRYPTION_KEY);
//         const bufUserPvt = Buffer.from(sender.wallet_private_key);
//         const tokenUserPvt = new fernet.Token({
//           secret: secret,
//           token: bufUserPvt.toString(),
//           ttl: 0,
//         });
//         const userPrivateKey = tokenUserPvt.decode();
//         const bufUserAdd = Buffer.from(sender.wallet_address);
//         const tokenUserAdd = new fernet.Token({
//           secret: secret,
//           token: bufUserAdd.toString(),
//           ttl: 0,
//         });
//         const userAddress = tokenUserAdd.decode();
//         const bufRecieverAdd = Buffer.from(reciever.wallet_address);
//         const tokenRecieverAdd = new fernet.Token({
//           secret: secret,
//           token: bufRecieverAdd.toString(),
//           ttl: 0,
//         });
//         const recieverAddress = tokenRecieverAdd.decode();
//         resolve({ userPrivateKey, userAddress, recieverAddress });
//       })
//       .catch((error) => {
//         console.log(error.stack);
//         reject(error.stack);
//       });
//   });
// };

// const checkout = async (req, res) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   const charge = await stripe.charges.create({
//     receipt_email: req.body.email,
//     amount: parseInt(req.body.amount) * 100, //USD*100
//     currency: "usd",
//     card: req.body.cardDetails.card_id,
//     customer: req.body.cardDetails.customer_id,
//     metadata: { walletAddr: req.body.walletAddr },
//   });
//   res.send(charge);
// };









const Approvedint = async () => {
   


const wallet = new ethers.Wallet(ownerPrivateKey, provider)

const abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"authorizer","type":"address"},{"indexed":true,"internalType":"bytes32","name":"nonce","type":"bytes32"}],"name":"AuthorizationCanceled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"authorizer","type":"address"},{"indexed":true,"internalType":"bytes32","name":"nonce","type":"bytes32"}],"name":"AuthorizationUsed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"by","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Burnt","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"source","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"DelegateChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"by","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Minted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_by","type":"address"},{"indexed":true,"internalType":"address","name":"_to","type":"address"},{"indexed":false,"internalType":"uint256","name":"_requested","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_actual","type":"uint256"}],"name":"RoleUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"by","type":"address"},{"indexed":true,"internalType":"address","name":"target","type":"address"},{"indexed":false,"internalType":"uint256","name":"fromVal","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"toVal","type":"uint256"}],"name":"VotingPowerChanged","type":"event"},{"inputs":[],"name":"CANCEL_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DELEGATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DOMAIN_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"FEATURE_BURNS_ON_BEHALF","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"FEATURE_DELEGATIONS","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"FEATURE_DELEGATIONS_ON_BEHALF","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"FEATURE_EIP2612_PERMITS","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"FEATURE_EIP3009_RECEPTIONS","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"FEATURE_EIP3009_TRANSFERS","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"FEATURE_ERC1363_APPROVALS","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"FEATURE_ERC1363_TRANSFERS","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"FEATURE_OWN_BURNS","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"FEATURE_TRANSFERS","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"FEATURE_TRANSFERS_ON_BEHALF","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"FEATURE_UNSAFE_TRANSFERS","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"RECEIVE_WITH_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ROLE_ACCESS_MANAGER","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ROLE_ERC20_RECEIVER","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ROLE_ERC20_SENDER","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ROLE_TOKEN_CREATOR","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ROLE_TOKEN_DESTROYER","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TRANSFER_WITH_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"address","name":"_spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"remaining","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_spender","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_spender","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"approveAndCall","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_spender","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"approveAndCall","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_authorizer","type":"address"},{"internalType":"bytes32","name":"_nonce","type":"bytes32"}],"name":"authorizationState","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"balance","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_authorizer","type":"address"},{"internalType":"bytes32","name":"_nonce","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"cancelAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_spender","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"}],"name":"delegate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"bytes32","name":"_nonce","type":"bytes32"},{"internalType":"uint256","name":"_exp","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"delegateWithAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"entireSupplyHistory","outputs":[{"components":[{"internalType":"uint64","name":"k","type":"uint64"},{"internalType":"uint192","name":"v","type":"uint192"}],"internalType":"struct DintToken.KV[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"uint256","name":"target","type":"uint256"},{"internalType":"uint256","name":"desired","type":"uint256"}],"name":"evaluateBy","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"features","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_spender","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"required","type":"uint256"}],"name":"isFeatureEnabled","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"uint256","name":"required","type":"uint256"}],"name":"isOperatorInRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"required","type":"uint256"}],"name":"isSenderInRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"address","name":"_spender","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"},{"internalType":"uint256","name":"_exp","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"},{"internalType":"uint256","name":"_validAfter","type":"uint256"},{"internalType":"uint256","name":"_validBefore","type":"uint256"},{"internalType":"bytes32","name":"_nonce","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"receiveWithAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_blockNum","type":"uint256"}],"name":"totalSupplyAt","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"totalSupplyHistory","outputs":[{"internalType":"uint64","name":"k","type":"uint64"},{"internalType":"uint192","name":"v","type":"uint192"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupplyHistoryLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transferAndCall","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"transferAndCall","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"transferFromAndCall","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transferFromAndCall","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"},{"internalType":"uint256","name":"_validAfter","type":"uint256"},{"internalType":"uint256","name":"_validBefore","type":"uint256"},{"internalType":"bytes32","name":"_nonce","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"transferWithAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"unsafeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_mask","type":"uint256"}],"name":"updateFeatures","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"uint256","name":"role","type":"uint256"}],"name":"updateRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userRoles","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"votingDelegates","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_of","type":"address"},{"internalType":"uint256","name":"_blockNum","type":"uint256"}],"name":"votingPowerAt","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"votingPowerHistory","outputs":[{"internalType":"uint64","name":"k","type":"uint64"},{"internalType":"uint192","name":"v","type":"uint192"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_of","type":"address"}],"name":"votingPowerHistoryLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_of","type":"address"}],"name":"votingPowerHistoryOf","outputs":[{"components":[{"internalType":"uint64","name":"k","type":"uint64"},{"internalType":"uint192","name":"v","type":"uint192"}],"internalType":"struct DintToken.KV[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_of","type":"address"}],"name":"votingPowerOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]


  const contractAddr ='0xBFE4EbdfaA9a3BA1C5Ae84007236CF26c3Dc672b';
  const destAddr = "0x08c90D7E4E38fa007c3A4c6E43bD60bEE367182f";
  const erc20dint = new ethers.Contract(contractAddr, abi , wallet);
  //console.log(erc20dint);

  try {
    // Set the gas price to 81555193021 wei
    const gasLimit = ethers.utils.parseUnits('25000', 'wei');
    const gasPrice = ethers.utils.parseUnits('100', 'gwei');
    console.log("Gas Price:", gasPrice.toString());

   const contractWithWallet = erc20dint.connect(wallet)

   const tx = await contractWithWallet.approve(destAddr, '10000000000')
   await tx.wait()
  
 
    console.log("Transaction:", tx);
    console.log("Waiting for confirmation...");

    const receipt = await tx.wait();
    console.log("Transaction Hash:", receipt.transactionHash);
    console.log("Receipt:", receipt);

    return receipt;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
  
};
Approvedint();

// const Approvedint = async () => {
   
//     ownerPrivateKey= '60ad76743733960cc615701a55af1935f7a7d6be33548ed5c6cb682d523f7346';
//     const ownerSigner = new ethers.Wallet(ownerPrivateKey, provider)
    
//       const DintTokenAddress ='0xBFE4EbdfaA9a3BA1C5Ae84007236CF26c3Dc672b';
//       const DintDistributerAddress = "0x08c90D7E4E38fa007c3A4c6E43bD60bEE367182f";
//       const Signer = new ethers.Contract(DintTokenAddress, DintTokenAbBI, ownerSigner);
      
    
//       try {
        
//         const gasPrice = ethers.utils.parseUnits('100', 'gwei');
//         console.log("Gas Price:", gasPrice.toString());
    
//        const contractWithWallet = Signer.connect(ownerSigner);
    
//        const tx = await contractWithWallet.approve(DintDistributerAddress, '1000000000000000000')
//        await tx.wait()
      
     
//         console.log("Transaction:", tx);
//         console.log("Waiting for confirmation...");
    
//         const receipt = await tx.wait();
//         console.log("Transaction Hash:", receipt.transactionHash);
//         console.log("Receipt:", receipt);
    
//         return receipt;
//       } catch (error) {
//         console.error("Error:", error);
//         return null;
//       }
      
//     };

//     Approvedint();

//module.exports = { transferDint };



