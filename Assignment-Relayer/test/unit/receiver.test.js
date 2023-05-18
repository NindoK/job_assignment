const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")
const {
    calculateDomainSeparator,
    signTransaction,
    calculateTransactionHash,
} = require("../helpers/testHelpers")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Receiver", function () {
          let receiver, targetERC20, deployer, payee, chainId

          const PRICE = ethers.utils.parseEther("400", 18)
          const NAME = "EIP712 Relayer Assignment"
          const VERSION = "1"

          beforeEach(async function () {
              const accounts = await ethers.getSigners()
              deployer = accounts[0]
              payee = accounts[1]
              await deployments.fixture(["all"])
              receiver = await ethers.getContract("Receiver")
              targetERC20 = await ethers.getContract("Target")
              chainId = network.config.chainId
              receiver.setRelayer(deployer.address)
          })

          it("deployer should have 10^6 tokens", async function () {
              const amountTokens = await targetERC20.balanceOf(deployer.address)

              assert.equal(ethers.utils.formatEther(amountTokens).toString(), (10 ** 6).toFixed(1))
          })

          it("payee should have 0 tokens", async function () {
              const amountTokens = await targetERC20.balanceOf(payee.address)

              assert.equal(ethers.utils.formatEther(amountTokens).toString(), 0)
          })

          it("should start with nonce 0 for each user", async function () {
              expect(await receiver.nonceOf(payee.address)).to.equal(0)
              expect(await receiver.nonceOf(deployer.address)).to.equal(0)
          })

          describe("EIP712 domain separator", function () {
              it("should have a valid domain separator", async function () {
                  const expectedDomainSeparator = calculateDomainSeparator(
                      NAME,
                      VERSION,
                      chainId,
                      receiver.address
                  )

                  expect(await receiver.getDomainSeparator()).to.equal(expectedDomainSeparator)
              })
          })

          describe("Meta-Transaction Processing", function () {
              let beforeDeployerBalance, beforePayeeBalance
              beforeEach(async function () {
                  beforeDeployerBalance = await targetERC20.balanceOf(deployer.address)
                  beforePayeeBalance = await targetERC20.balanceOf(payee.address)

                  const nonce = await receiver.nonceOf(deployer.address)

                  //Calculate the hash of the transaction to get the signature
                  const digest = ethers.utils.keccak256(
                      ethers.utils.solidityPack(
                          ["bytes1", "bytes1", "bytes32", "bytes32"],
                          [
                              "0x19",
                              "0x01",
                              calculateDomainSeparator(NAME, VERSION, chainId, receiver.address),
                              calculateTransactionHash(
                                  deployer.address,
                                  targetERC20.address,
                                  payee.address,
                                  PRICE,
                                  nonce
                              ),
                          ]
                      )
                  )

                  const signature = signTransaction(digest, process.env.PRIVATE_KEY)

                  //Check that the signature is valid and matches the deployer address
                  assert.equal(deployer.address, ethers.utils.recoverAddress(digest, signature))

                  const tx = await receiver.executeMetaTransaction(
                      [
                          ethers.utils.defaultAbiCoder.encode(
                              ["address", "address", "address", "uint256", "uint256"],
                              [deployer.address, targetERC20.address, payee.address, PRICE, nonce]
                          ),
                      ],
                      [signature]
                  )
              })

              it("should execute a valid meta-transaction", async function () {
                  const deployerBalance = await targetERC20.balanceOf(deployer.address)
                  const payeeBalance = await targetERC20.balanceOf(payee.address)

                  const diffDeployerBalance = beforeDeployerBalance.sub(PRICE)
                  const diffPayeeBalance = beforePayeeBalance.add(PRICE)

                  expect(deployerBalance.toString()).to.equal(diffDeployerBalance.toString())
                  expect(payeeBalance.toString()).to.equal(diffPayeeBalance.toString())
              })

              it("should increment nonce after a successful meta-transaction just for the deployer", async function () {
                  expect(await receiver.nonceOf(payee.address)).to.equal(0)
                  expect(await receiver.nonceOf(deployer.address)).to.equal(1)
              })

              it("should not increment nonce if meta-transaction fails", async function () {
                  const nonce = await receiver.nonceOf(deployer.address)
                  const digest = ethers.utils.keccak256(
                      ethers.utils.solidityPack(
                          ["bytes1", "bytes1", "bytes32", "bytes32"],
                          [
                              "0x19",
                              "0x01",
                              calculateDomainSeparator(NAME, VERSION, chainId, receiver.address),
                              calculateTransactionHash(
                                  deployer.address,
                                  targetERC20.address,
                                  payee.address,
                                  PRICE,
                                  nonce
                              ),
                          ]
                      )
                  )
                  const signature = signTransaction(digest, process.env.PRIVATE_KEY)

                  const tx = await receiver.executeMetaTransaction(
                      [
                          ethers.utils.defaultAbiCoder.encode(
                              ["address", "address", "address", "uint256", "uint256"],
                              [
                                  deployer.address,
                                  targetERC20.address,
                                  payee.address,
                                  PRICE,
                                  nonce + 1,
                              ]
                          ),
                      ],
                      [signature]
                  )
                  expect(await receiver.nonceOf(deployer.address)).to.equal(1)
              })

              it("should not perform since nonce is invalid", async function () {
                  const nonce = await receiver.nonceOf(deployer.address)
                  const digest = ethers.utils.keccak256(
                      ethers.utils.solidityPack(
                          ["bytes1", "bytes1", "bytes32", "bytes32"],
                          [
                              "0x19",
                              "0x01",
                              calculateDomainSeparator(NAME, VERSION, chainId, receiver.address),
                              calculateTransactionHash(
                                  deployer.address,
                                  targetERC20.address,
                                  payee.address,
                                  PRICE,
                                  nonce + 3
                              ),
                          ]
                      )
                  )
                  const signature = signTransaction(digest, process.env.PRIVATE_KEY)

                  await expect(
                      receiver.executeMetaTransaction(
                          [
                              ethers.utils.defaultAbiCoder.encode(
                                  ["address", "address", "address", "uint256", "uint256"],
                                  [
                                      deployer.address,
                                      targetERC20.address,
                                      payee.address,
                                      PRICE,
                                      nonce + 3,
                                  ]
                              ),
                          ],
                          [signature]
                      )
                  ).to.emit(receiver, "TransactionInvalidNonce")
                  expect(await receiver.nonceOf(deployer.address)).to.equal(1)
              })
          })

          it("should not perform since length mismatch and revert with custom error", async function () {
              const nonce = await receiver.nonceOf(deployer.address)
              await expect(
                  receiver.executeMetaTransaction(
                      [
                          ethers.utils.defaultAbiCoder.encode(
                              ["address", "address", "address", "uint256", "uint256"],
                              [
                                  deployer.address,
                                  targetERC20.address,
                                  payee.address,
                                  PRICE,
                                  nonce + 3,
                              ]
                          ),
                      ],
                      []
                  )
              ).to.be.revertedWith("Receiver__TransactionAndSignatureLengthMismatch")
          })

          it("should emits event on invalid signature", async function () {
              const nonce = await receiver.nonceOf(deployer.address)
              const digest = ethers.utils.keccak256(
                  ethers.utils.solidityPack(
                      ["bytes1", "bytes1", "bytes32", "bytes32"],
                      [
                          "0x19",
                          "0x01",
                          calculateDomainSeparator(NAME, VERSION, chainId, receiver.address),
                          calculateTransactionHash(
                              deployer.address,
                              targetERC20.address,
                              payee.address,
                              PRICE,
                              nonce
                          ),
                      ]
                  )
              )
              const signature = signTransaction(digest, process.env.PRIVATE_KEY2)
              await expect(
                  receiver.executeMetaTransaction(
                      [
                          ethers.utils.defaultAbiCoder.encode(
                              ["address", "address", "address", "uint256", "uint256"],
                              [deployer.address, targetERC20.address, payee.address, PRICE, nonce]
                          ),
                      ],
                      [signature]
                  )
              ).to.emit(receiver, "TransactionInvalidSigner")
          })

          it("should emits event on invalid nonce, producing invalid signer", async function () {
              const nonce = await receiver.nonceOf(deployer.address)

              //Calculate the hash of the transaction to get the signature
              const digest = ethers.utils.keccak256(
                  ethers.utils.solidityPack(
                      ["bytes1", "bytes1", "bytes32", "bytes32"],
                      [
                          "0x19",
                          "0x01",
                          calculateDomainSeparator(NAME, VERSION, chainId, receiver.address),
                          calculateTransactionHash(
                              deployer.address,
                              targetERC20.address,
                              payee.address,
                              PRICE,
                              nonce
                          ),
                      ]
                  )
              )

              const signature = signTransaction(digest, process.env.PRIVATE_KEY)

              await expect(
                  receiver.executeMetaTransaction(
                      [
                          ethers.utils.defaultAbiCoder.encode(
                              ["address", "address", "address", "uint256", "uint256"],
                              [
                                  deployer.address,
                                  targetERC20.address,
                                  payee.address,
                                  PRICE,
                                  nonce + 1,
                              ]
                          ),
                      ],
                      [signature]
                  )
              ).to.emit(receiver, "TransactionInvalidSigner")
          })

          it("should not be able to send transaction the address is not the relayer", async function () {
              receiver = receiver.connect(payee)
              const nonce = await receiver.nonceOf(deployer.address)

              //Calculate the hash of the transaction to get the signature
              const digest = ethers.utils.keccak256(
                  ethers.utils.solidityPack(
                      ["bytes1", "bytes1", "bytes32", "bytes32"],
                      [
                          "0x19",
                          "0x01",
                          calculateDomainSeparator(NAME, VERSION, chainId, receiver.address),
                          calculateTransactionHash(
                              deployer.address,
                              targetERC20.address,
                              payee.address,
                              PRICE,
                              nonce
                          ),
                      ]
                  )
              )

              const signature = signTransaction(digest, process.env.PRIVATE_KEY)

              await expect(
                  receiver.executeMetaTransaction(
                      [
                          ethers.utils.defaultAbiCoder.encode(
                              ["address", "address", "address", "uint256", "uint256"],
                              [
                                  deployer.address,
                                  targetERC20.address,
                                  payee.address,
                                  PRICE,
                                  nonce + 1,
                              ]
                          ),
                      ],
                      [signature]
                  )
              ).to.be.revertedWith("Only relayer can call this function")
          })

          it("should emits event on invalid amount", async function () {
              const nonce = await receiver.nonceOf(deployer.address)
              //Calculate the hash of the transaction to get the signature
              const digest = ethers.utils.keccak256(
                  ethers.utils.solidityPack(
                      ["bytes1", "bytes1", "bytes32", "bytes32"],
                      [
                          "0x19",
                          "0x01",
                          calculateDomainSeparator(NAME, VERSION, chainId, receiver.address),
                          calculateTransactionHash(
                              payee.address,
                              targetERC20.address,
                              deployer.address,
                              PRICE,
                              nonce
                          ),
                      ]
                  )
              )

              const signature = signTransaction(digest, process.env.PRIVATE_KEY2)

              await expect(
                  receiver.executeMetaTransaction(
                      [
                          ethers.utils.defaultAbiCoder.encode(
                              ["address", "address", "address", "uint256", "uint256"],
                              [payee.address, targetERC20.address, deployer.address, PRICE, nonce]
                          ),
                      ],
                      [signature]
                  )
              ).to.emit(receiver, "TransactionInvalidAmount")
          })

          it("should not be able to send transaction the address is not the relayer", async function () {
              receiver = receiver.connect(payee)

              await expect(receiver.setRelayer(payee.address)).to.be.revertedWith(
                  "Only owner can call this function"
              )
          })
      })
