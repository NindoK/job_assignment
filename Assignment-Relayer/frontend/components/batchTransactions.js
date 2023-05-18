import React, { useState, useEffect } from "react"
import { fetchBatchedTransactions } from "../utils/transactions" // Import your transaction helper functions

const BatchTransactionsPage = ({ transactions, setTransactions }) => {
    useEffect(() => {
        const fetchTransactions = async () => {
            const data = await fetchBatchedTransactions()
            setTransactions(data)
        }

        const intervalId = setInterval(() => {
            fetchTransactions()
        }, 5000) // Fetch new data every 5 seconds

        return () => clearInterval(intervalId)
    }, [])

    return (
        <div>
            <div className="transactionWrapper" />
            <ul>
                {transactions.map((transaction, index) => (
                    <li key={index} className="transactionWrapper">
                        <div className="transactionIndex">{index}</div>
                        <div className="transactionBox">{transaction}</div>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default BatchTransactionsPage
