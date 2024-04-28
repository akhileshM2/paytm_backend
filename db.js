const mongoose = require("mongoose")

mongoose.connect("mongodb+srv://Akhilesh_admin:kinley%40123@cluster0.zjqaee1.mongodb.net/paytm")

const userSchema = mongoose.Schema({
    username: String,
    firstName: String,
    lastName: String,
    password: String
});

const accountSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
})

const User = mongoose.model("User", userSchema);
const Account = mongoose.model("Account", accountSchema);

module.exports = {
    User,
    Account
}