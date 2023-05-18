require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()

// const MAINNET_RPC_URL =
//     process.env.MAINNET_RPC_URL ||
//     process.env.ALCHEMY_MAINNET_RPC_URL ||
//     "https://eth-mainnet.alchemyapi.io/v2/your-api-key"
// const SEPOLIA_RPC_URL =
//     process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY"

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x"

const REPORT_GAS = process.env.REPORT_GAS || false

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            // forking: {
            //   url: MAINNET_RPC_URL
            // }
            logginEnabled: true,
            chainId: 31337,
        },
        localhost: {
            chainId: 31337,
        },
        // sepolia: {
        //     url: SEPOLIA_RPC_URL,
        //     accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
        //     saveDeployments: true,
        //     chainId: 11155111,
        // },
    },
    gasReporter: {
        enabled: REPORT_GAS,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
    },
    contractSizer: {
        runOnCompile: false,
        only: ["Receiver"],
    },
    namedAccounts: {
        deployer: {
            default: 0,
            1: 0,
        },
        payee: {
            default: 1,
        },
    },
    solidity: {
        compilers: [
            {
                version: "0.8.17",
            },
        ],
    },
    mocha: {
        timeout: 200000, // 200 seconds max for running tests
    },
}
