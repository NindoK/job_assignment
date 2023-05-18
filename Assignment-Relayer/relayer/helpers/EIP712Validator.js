const { ethers } = require("ethers")
require("dotenv").config()

class EIP712Validator {
    //Validate the EIP712 message and signature. EIP712Domain is not added since it is not required and conflicts with verifyTypedData, since already built in
    validateMessage(message, signature) {
        const types = {
            Transaction: [
                { name: "user", type: "address" },
                { name: "tokenAddress", type: "address" },
                { name: "to", type: "address" },
                { name: "amount", type: "uint256" },
                { name: "nonce", type: "uint256" },
            ],
        }
        const domain = {
            name: "EIP712 Relayer Assignment",
            version: "1",
            chainId: process.env.CHAIN_ID,
            verifyingContract: process.env.RECEIVER_ADDRESS,
        }

        const value = {
            user: message.user,
            tokenAddress: message.tokenAddress,
            to: message.to,
            amount: message.amount,
            nonce: message.nonce,
        }

        try {
            const signer = ethers.utils.verifyTypedData(domain, types, value, signature)
            return signer === message.user
        } catch (error) {
            // console.error("Error validating EIP712 message:", error)
            return false
        }
    }
}

module.exports = { EIP712Validator }
