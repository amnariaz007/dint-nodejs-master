const ethers = require("ethers");
const axios = require("axios");
require("dotenv").config();

const transferDint = async ({ amount, destAddr }) => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_PROVIDER);

  const signer = new ethers.Wallet(process.env.OWNER_PRIVATE_KEY, provider);

  const abi = [
    {
      constant: false,
      inputs: [
        { name: "_to", type: "address" },
        { name: "_amount", type: "uint256" },
      ],
      name: "transfer",
      outputs: [{ name: "success", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  const contractAddr = process.env.DINT_TOKEN_ADDRESS;
  const erc20dint = new ethers.Contract(contractAddr, abi, signer);

  // get max fees from gas station
  let maxFeePerGas = ethers.BigNumber.from(150000000000); // fallback to 40 gwei
  let maxPriorityFeePerGas = ethers.BigNumber.from(1500000000000); // fallback to 40 gwei
  try {
    const { data } = await axios({
      method: "get",
      url: process.env.IS_PROD
        ? "https://gasstation-mainnet.matic.network/v2"
        : "https://gasstation-mumbai.matic.today/v2",
    });
    maxFeePerGas = ethers.utils.parseUnits(
      Math.ceil(data.fast.maxFee) + "",
      "gwei"
    );
    maxPriorityFeePerGas = ethers.utils.parseUnits(
      Math.ceil(data.fast.maxPriorityFee) + "",
      "gwei"
    );
  } catch (error) {
    console.error("Error fetching gas prices:", error);
    return;
  }

  try {
    // Send the transaction
    const tx = await erc20dint.transfer(destAddr, amount, {
      maxFeePerGas: ethers.utils.parseUnits("350", "gwei"),
      maxPriorityFeePerGas: ethers.utils.parseUnits("95", "gwei"),
      gasLimit: ethers.utils.parseUnits("8000000", "wei"),
    });
    
    const receipt = await tx.wait();
    console.log("Transaction Hash", receipt.transactionHash);
    return receipt;
  } catch (error) {
    console.error("Error sending transaction:", error);
    return;
  }
};

module.exports = { transferDint };
