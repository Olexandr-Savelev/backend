const dotenv = require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const app = express()

const PORT = process.env.PORT || 5000

app.get('/', (req, res) => {
    res.send('Hi man!')
})

async function main() {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('Connected to DB')
        app.listen(PORT, () => {
            console.log(`App listening on port ${PORT}`)
        })
    } catch (error) {
        console.log(error)
    }
}

main()

process.on("SIGINT", async () => {

    await mongoose.disconnect();
    console.log("App closed");
    process.exit();
});