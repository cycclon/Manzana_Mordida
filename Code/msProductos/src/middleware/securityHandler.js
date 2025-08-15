const { verifyToken } = require('../utils/token');

function authMiddleware(req, res, next) {
    //console.log('auth middleware');
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({message: 'No token provided'});
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if(!decoded) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.user = decoded;
    next();
}

function roleMiddleware(allowedRoles) {    
    return (req, res, next) => {
        //console.log('role middleware');
        if(!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({message: 'Forbidden'});
        }
        next();
    };    
}

module.exports = {authMiddleware, roleMiddleware};