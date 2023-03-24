const ethers = require("ethers");
const axios = require("axios");
require("dotenv").config();

const transferDint = async ({ amount, destAddr }) => {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.RPC_PROVIDER
  );

  const signer = new ethers.Wallet(
    process.env.OWNER_PRIVATE_KEY,
    provider
  );

  const abi = require("../DintTokenABI.json");

  const contractAddr = process.env.DINT_TOKEN_ADDRESS;
  const erc20dint = new ethers.Contract(contractAddr, abi, signer);

  const getGasPrice = async () => {
    try {
      const { standard, fast } = await axios.get(
        "https://gasstation-mainnet.matic.network/"
      ).then((res) => res.data);

      const fee = standard + (fast - standard) / 3;
      return ethers.utils.parseUnits(fee.toFixed(2).toString(), "gwei");
    } catch (error) {
      console.log("gas error");
      console.error(error);
      return ethers.utils.parseUnits("200", "gwei");
    }
  };

  try {
    // Get the current gas price
    let gasPrice = await getGasPrice();
    console.log("Gas Price:", gasPrice.toString());

    // Get the nonce for the transaction
    const nonce = await signer.getTransactionCount("latest");
    console.log("Nonce:", nonce);

    // Set the gas limit to 70,000 units
    const gasLimit = ethers.utils.parseUnits('70000', 'wei');

    // Create the transaction object
    const tx = {
      to: contractAddr,
      nonce: nonce,
      gasLimit: gasLimit,
      gasPrice: gasPrice,
      data: erc20dint.interface.encodeFunctionData("transfer", [destAddr, amount]),
    };

    console.log("Amount:", amount.toString());
    console.log("Transaction:", tx);

    // Send the transaction
    const response = await signer.sendTransaction(tx);
    console.log("Waiting for confirmation...");
    console.log("Transaction Hash:", response.hash);

    // Wait for the transaction to be confirmed
    const receipt = await response.wait();
    console.log("Receipt:", receipt);

    return receipt;
  } catch (error) {
    console.error("Error:", error);

    if (error.code === "TRANSACTION_UNDERPRICED") {
      console.log("Transaction is pending, increasing gas price...");

      // Increase the gas price by 10%
      gasPrice *= 1.1;
      console.log("New Gas Price:", gasPrice.toString());

      // Resend the transaction with the higher gas price
      const tx = {
        to: contractAddr,
        nonce: nonce,
        gasLimit: gasLimit,
        gasPrice: gasPrice,
        data: erc20dint.interface.encodeFunctionData("transfer", [destAddr, amount]),
      };

      console.log("Resending transaction with higher gas price...");
      console.log("Transaction:", tx);

      const response = await signer.sendTransaction(tx);
      console.log("Waiting for confirmation...");
      console.log("Transaction Hash:", response.hash);

      const receipt = await response.wait();
      console.log("Receipt:", receipt);

      return receipt;
    }

    return null;
  }
};

module.exports = { transferDint };