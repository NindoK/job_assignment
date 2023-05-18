const { network } = require("hardhat")

//Helper function to deploy the contracts right when hardhat is run
module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    args = ["BasicToken", "BST"]
    const target = await deploy("Target", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    log("-----------------------")
}

module.exports.tags = ["all", "target"]
