const { JWT_SECRET } = require("./config")
const jwt = require("jsonwebtoken")

function authMiddleware(req, res, next) {
    const authToken = req.headers.authorization

    if(!authToken || !authToken.startsWith("Bearer ")) {
        res.status(403).json({})
    }

    const auths = authToken.split(" ")
    
    try {
        const decoded = jwt.verify(auths[1], JWT_SECRET)
        if(decoded.userId) {
            req.userId = decoded.userId
            next();
        }
        else {
            res.status(403).json({})
        }
    }
    catch (err) {
        res.status(403).json({})
    }
}

module.exports = {
    authMiddleware
}