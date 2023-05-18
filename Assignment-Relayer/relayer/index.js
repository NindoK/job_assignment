const express = require("express")
const path = require("path")
const cors = require("cors")

const dotenv = require("dotenv")
const { MessageHandler } = require("./MessageHandler")
const { BatchHandler } = require("./BatchHandler")

dotenv.config({ path: path.join(__dirname, "..", ".env") })

const app = express()
const PORT = process.env.PORT || 4000
const INTERVAL_DURATION = 10000

// Middleware for parsing JSON request bodies
app.use(express.json())
// Middleware for enabling CORS requests
app.use(cors())

const messageHandler = new MessageHandler()
const batchHandler = new BatchHandler()

//[POST] Submit route for adding messages to the batch
//Requires a message and signature in the request body
app.post("/submit", async (req, res) => {
    try {
        const { message, signature } = req.body
        const result = await messageHandler.addMessage(message, signature)
        if (result.success) {
            res.status(200).send("Message submitted")
        } else {
            res.status(400).send(result.message)
        }
    } catch (error) {
        // console.log(error)
        res.status(400).send(error.message)
    }
})

//[GET] Get batch route for getting the current batch
//Used for showing it in the UI
app.get("/get-batch", (req, res) => {
    const batch = messageHandler.getBatch()
    res.status(200).json(batch)
})

//Making it modular to allow exporting for testing
function startApp(intervalDuration) {
    const server = app.listen(PORT, () => {
        console.log(`Relayer service is running on http://localhost:${PORT}`)
    })

    //Interval for sending the batch to the receiver every `intervalDuration`, currently is set to 10 seconds
    const interval = setInterval(async () => {
        const batch = messageHandler.getBatch()
        if (batch.messages.length > 0) {
            try {
                const { success, message } = await batchHandler.sendBatch(batch)
                if (success) {
                    console.log(message)
                    messageHandler.clearBatch()
                } else {
                    console.error(message)
                }
            } catch (error) {
                console.error("Error sending batch", error)
            }
        }
    }, intervalDuration) // Send batch every 10 seconds = 10000
    return { server, interval }
}

module.exports = { app, startApp }

if (require.main === module) {
    startApp(INTERVAL_DURATION)
}
