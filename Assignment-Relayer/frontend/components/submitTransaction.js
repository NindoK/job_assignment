import React, { useState, useEffect } from "react"
import { signEIP712Message, submitSignedMessage } from "../utils/signature"
import receiverAbiJson from "../constants/receiverContract.json"
import { ethers } from "ethers"
import networkMapping from "../constants/networkMapping"
import { fetchBatchedTransactions } from "../utils/transactions"

const SubmitTransactionPage = ({ transactions, setTransactions }) => {
    const [tokenToSend, setTokenToSend] = useState("")
    const [targetAddress, setTargetAddress] = useState("")
    const [to, setTo] = useState("")
    const [submitError, setSubmitError] = useState(null)
    const [isConnected, setIsConnected] = useState(false)

    let signer, provider, receiverAddress, signerAddress

    //Check if the wallet is connected
    const checkConnection = async () => {
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: "eth_accounts" })
            setIsConnected(accounts.length > 0)
        }
    }

    //useEffect to listen to changes in the wallet connection (just to disable/enable button)
    useEffect(() => {
        checkConnection()

        const handleAccountsChanged = (accounts) => {
            setIsConnected(accounts.length > 0)
        }

        if (window.ethereum) {
            window.ethereum.on("accountsChanged", handleAccountsChanged)
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
            }
        }
    }, [])

    //Retrieve the nonce of the user from the receiver contract
    async function getNonce(userAddress, contract) {
        try {
            const nonce = await contract.nonceOf(userAddress)
            return nonce.toNumber()
        } catch (error) {
            console.error("Error getting nonce:", error)
            throw error
        }
    }

    // Sign and submit a transaction by accepting a JSON object which contains the transaction details
    const signAndSubmitTransaction = async (json) => {
        try {
            // Sign the EIP-712 message with MetaMask
            const signature = await signEIP712Message(json, signer)

            // Submit the signed message to the relayer
            const { success, message } = await submitSignedMessage(json, signature)

            return { success: success, message: message }
        } catch (error) {
            console.log(error)
            return { success: false, message: "Error signing transaction" }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        // Instantiate a Web3 provider and retrieve the signer
        provider = new ethers.providers.Web3Provider(window.ethereum)
        signer = provider.getSigner()
        const chainId = await signer.getChainId()
        signerAddress = await signer.getAddress()

        if (!tokenToSend || !targetAddress || !to) {
            setSubmitError("Please fill in all fields")
            return
        }

        if (targetAddress.length !== 42 || to.length !== 42) {
            setSubmitError(
                "Invalid address length. Ethereum addresses should be 42 characters long."
            )
            return
        }

        //Grab the receiver contract address from the networkMapping
        receiverAddress = networkMapping[chainId].receiver
        const receiverContract = new ethers.Contract(receiverAddress, receiverAbiJson, signer)

        // Get the nonce of the user from the receiver contract
        const nonce = await getNonce(signerAddress, receiverContract)
        const tokenToSendInWei = ethers.utils.parseUnits(tokenToSend, "ether")

        const json = {
            user: signerAddress,
            tokenAddress: targetAddress,
            to: to,
            amount: tokenToSendInWei,
            nonce: nonce,
        }

        const { success, message } = await signAndSubmitTransaction(json)

        if (!success) {
            setSubmitError(message)
        } else {
            setSubmitError(null)
        }

        //Update page with new transactions
        const data = await fetchBatchedTransactions()
        setTransactions(data)
    }

    return (
        <div>
            <h1 className="py-2 px-4 mt-5 font-bold text-3xl">Submit Transaction</h1>
            <form onSubmit={handleSubmit} className="flex flex-col justify-center">
                <div className="formContainer tokenField">
                    <label htmlFor="tokenToSend" className="labelForm">
                        Token To Send:
                    </label>
                    <input
                        type="number"
                        id="tokenToSend"
                        className="inputForm"
                        value={tokenToSend}
                        style={{ color: "black" }}
                        onChange={(e) => setTokenToSend(e.target.value)}
                    />
                </div>
                <div className="formContainer">
                    <label htmlFor="targetAddress" className="labelForm">
                        Target Address:
                    </label>
                    <input
                        type="text"
                        id="targetAddress"
                        className="inputForm"
                        value={targetAddress}
                        style={{ color: "black" }}
                        onChange={(e) => setTargetAddress(e.target.value)}
                    />
                </div>
                <div className="formContainer">
                    <label htmlFor="to" className="labelForm">
                        To:
                    </label>
                    <input
                        type="text"
                        id="to"
                        className="inputForm"
                        value={to}
                        style={{ color: "black" }}
                        onChange={(e) => setTo(e.target.value)}
                    />
                </div>
                <div>{submitError && <p className="errorText">{submitError}</p>}</div>
                <div className="formContainer">
                    <button type="submit" className="formButton" disabled={!isConnected}>
                        Submit
                    </button>
                </div>
            </form>
        </div>
    )
}

export default SubmitTransactionPage
