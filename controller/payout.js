const ethers = require("ethers");
const Web3 = require("web3");
const DintTokenAbBI = require("../DintTokenABI.json");
// require("dotenv").config({ path: `../env.local`, override: true });
require("dotenv").config();
const { Client } = require("pg");
const dintDistributerABI = require("../DintDistributerABI.json");
const fernet = require("fernet");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

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
const ownerAddress = process.env.OWNER_WALLET_ADDRESS;
const ownerPrivateKey = process.env.OWNER_PRIVATE_KEY;
const web3 = new Web3(process.env.RPC_PROVIDER);
// const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_PROVIDER);

const ownerSigner = new ethers.Wallet(ownerPrivateKey, provider);

const approval = async (data, amount) => {
  const nonce = 0;
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
    const spender = ownerAddress.toLowerCase();
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
      ownerAddress
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
      return new Promise((resolve, reject) => {
        contract
          .permit(account, spender, value, deadline, sig.v, sig.r, sig.s, {
            gasLimit: 1000000,
            gasPrice: 30000000000,
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
        { gasLimit: 1000000, gasPrice: 30000000000 }
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
            { gasLimit: 1000000, gasPrice: 30000000000 }
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

const send = async (data, value) => {
  const contract = new ethers.Contract(
    DintTokenAddress.toLowerCase(),
    DintTokenAbBI,
    ownerSigner
  );
  return new Promise((resolve, reject) => {
    contract
      .transferFrom(data.userAddress, DintDistributerAddress, value, {
        gasLimit: 1000000,
        gasPrice: 30000000000,
      })

      .then(
        async (res) => {
          console.log("Transaction Hashes payouts", res);

          // const filter = {
          //   address: DintDistributerAddress,
          //   topics: [
          //     "0x94793dae1b41ddf18877c1fd772483f743aaa443d4d9052721cef45379dca65f",
          //   ],
          // };
          // provider.on(filter, async (data, err) => {
          //   console.log("data123", data);
          //   console.log("errrr", err);
          //   const txnResponse = data;
          //   resolve(txnResponse);
          //   // const add = ethers.utils.defaultAbiCoder.decode(
          //   //   ["address", "address"],
          //   //   data.data
          //   // );
          //   // console.log("event=====", add);
          // });
          resolve({ res, data });
        },
        (err) => {
          console.log("err", err);
        }
      )
      .catch((err) => {
        console.log("err", err);
        reject(err);
      });
  });
};

const getUserData = async (user_id, amount) => {
  return new Promise((resolve, reject) => {
    console.log("user-id", user_id)
    client
      .query(
        `select id, wallet_private_key, wallet_address from auth_user where id = ${user_id};`
      )
      .then((res) => {
        const data = res.rows;

        console.log("data", data)
        let user = data.find((el) => {
          return el.id === user_id;
        });
      
        const secret = new fernet.Secret(process.env.ENCRYPTION_KEY);
        const bufUserPvt = Buffer.from(user.wallet_private_key);
        const tokenUserPvt = new fernet.Token({
          secret: secret,
          token: bufUserPvt.toString(),
          ttl: 0,
        });
        const userPrivateKey = tokenUserPvt.decode();
        const bufUserAdd = Buffer.from(user.wallet_address);
        const tokenUserAdd = new fernet.Token({
          secret: secret,
          token: bufUserAdd.toString(),
          ttl: 0,
        });
        const userAddress = tokenUserAdd.decode();

        resolve({ userPrivateKey, userAddress });
      })
      .catch((error) => {
        console.log(error.stack);
        reject(error.stack);
      });
  });
};

module.exports = { approval, getUserData };