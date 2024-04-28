const express = require("express")
const { User, Account } = require("../db")
const zod = require("zod")
const jwt = require("jsonwebtoken")
const { JWT_SECRET } = require("../config")
const { authMiddleware } = require("../middleware")
const userRouter =  express.Router()

const signupSchema = zod.object({
    username: zod.string().email(),
    password: zod.string().min(8),
    firstName: zod.string(),
    lastName: zod.string()
})

userRouter.post("/signup", async (req, res) => {
    const body = req.body
    const { success } = signupSchema.safeParse(body)

    if (!success) {
        res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }

    else {
        const user = await User.findOne({
            username: body.username
        })

        if(user) {
            res.status(411).json({
                message: "Email already taken / Incorrect inputs"
            })
        }

        const dbUser = await User.create(body)
        const userId = dbUser._id
        await Account.create({
            userId,
            balance: 1 + Math.random()*10000
        })
        const token = jwt.sign({userId}, JWT_SECRET)

        res.status(200).json({
            message: "User created successfully",
            token: token
        })
    }
})

const signinSchema = zod.object({
    username: zod.string().email(),
    password: zod.string().min(8)
})

userRouter.post("/signin", async (req, res) => {
    const { success } = signinSchema.safeParse(req.body)

    if(!success) {
        res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    const dbUser = await User.findOne({
        username: req.body.username,
        password: req.body.password
    })

    const token = jwt.sign({userId: dbUser._id}, JWT_SECRET)
    
    if (dbUser._id) {
        res.status(200).json({
            token: token,
            name: dbUser.firstName
        })
    }
    else {
        res.status(411).json({
            message: "Error while logging in"
        })
    }
})

const updateSchema = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional()
})

userRouter.put("/", authMiddleware, async (req, res) => {
    const { success } = updateSchema.safeParse(req.body)
    if(!success) {
        res.status(411).json({
            message: "Error while updating information"
        })
    }

    await User.updateOne({
        _id: req.userId
    }, req.body)

    res.status(200).json({
        message: "Updated successfully"
    })
})

userRouter.get("/bulk", async (req, res) => {
    const filter = req.query.filter || ""

    const users = await User.find({
        $or: [
            {
                firstName: {
                    "$regex": filter
                }
            },
            {
                lastName: {
                    "$regex": filter
                }
            }
        ]
    })

    res.status(200).json({
        user: users.map(user => ({
            username: user.username,
            firstName:user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

module.exports = {
    userRouter
}