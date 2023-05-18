import { useState } from "react"
import SubmitTransactionPage from "../components/submitTransaction"
import BatchTransactionsPage from "../components/batchTransactions"

// This is the main page of the app, it contains two components: the submit transaction form and the batch transactions table
//The state is managed here, and passed down to the components as props, to avoid using context for such a small app
export default function Home() {
    const [transactions, setTransactions] = useState([])
    return (
        <div className="container mx-auto">
            <SubmitTransactionPage transactions={transactions} setTransactions={setTransactions} />

            <h1 className="py-4 px-4 font-bold text-2xl">Latest Transactions</h1>
            <BatchTransactionsPage transactions={transactions} setTransactions={setTransactions} />
        </div>
    )
}
