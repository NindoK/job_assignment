const dotenv = require("dotenv")
const path = require("path")
const { ethers } = require("hardhat")
dotenv.config({ path: path.join(__dirname, "..", ".env") })
const { ecsign } = require("ethereumjs-util")

function calculateDomainSeparator(name, version, chainId, receiverAddress) {
    return ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
            ["bytes32", "bytes32", "bytes32", "uint256", "address"],
            [
                ethers.utils.id(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                ethers.utils.id(name),
                ethers.utils.id(version),
                chainId,
                receiverAddress,
            ]
        )
    )
}

function calculateTransactionHash(from, targetAddress, to, amount, nonce) {
    return ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
            ["bytes32", "address", "address", "uint256", "uint256", "uint256"],
            [
                ethers.utils.id(
                    "Transaction(address user,address tokenAddress,address to,uint256 amount,uint256 nonce)"
                ),
                from,
                targetAddress,
                to,
                amount,
                nonce,
            ]
        )
    )
}

function signTransaction(digest, private_key = process.env.PRIVATE_KEY) {
    const { v, r, s } = ecsign(
        Buffer.from(digest.slice(2), "hex"),
        Buffer.from(private_key.slice(2), "hex")
    )
    const signature = ethers.utils.joinSignature({
        v: v,
        r: ethers.utils.hexlify(r),
        s: ethers.utils.hexlify(s),
    })
    return signature
}

module.exports = {
    signTransaction,
    calculateDomainSeparator,
    calculateTransactionHash,
}
