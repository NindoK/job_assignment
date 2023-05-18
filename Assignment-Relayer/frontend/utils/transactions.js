const fetchBatchedTransactions = async () => {
    try {
        const response = await fetch("http://localhost:4000/get-batch")
        if (response.ok) {
            const batch = await response.json()
            return batch.messages
        } else {
            throw new Error("Failed to fetch batched transactions")
        }
    } catch (error) {
        console.error("Error fetching batched transactions:", error)
        return []
    }
}

module.exports = { fetchBatchedTransactions }
