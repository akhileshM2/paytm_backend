const express = require("express")
const { Account, User } = require("../db")
const { authMiddleware } = require("../middleware")
const mongoose = require("mongoose")

const app = express()
app.use(express.json())
const accountRouter = express.Router()

accountRouter.get("/balance", authMiddleware, async (req, res) => {
    const account = await Account.findOne({
        userId: req.userId
    })

    res.status(200).json({
        balance: account.balance
    })
})

accountRouter.post("/transfer", authMiddleware, async (req, res) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    const { to, amount } = req.body

    const account = await Account.findOne({
        userId: req.userId
    }).session(session)

    if (!account || account.balance < amount) {
        await session.abortTransaction()
        res.status(400).json({
            message: "Insufficient balance"
        })
    }

    const toAccount = await Account.findOne({
        userId: to
    }).session(session)

    if (!toAccount) {
        await session.abortTransaction()
        res.status(400).json({
            message: "Invalid account"
        })
    }

    await Account.updateOne(
        { userId: req.userId },
        {
            "$inc": {
            balance: -amount
        }
    }).session(session)

    await Account.updateOne(
        { userId: to },
        { 
            "$inc": {
                balance: amount
            }
    }).session(session)

    await session.commitTransaction()

    res.status(200).json({
        message: "Transfer successful"
    })
})

module.exports = {
    accountRouter
}