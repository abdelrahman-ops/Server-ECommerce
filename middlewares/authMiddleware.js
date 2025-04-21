import jwt from "jsonwebtoken";
import User from "../models/users.js";

const protectRoute  = async (req, res, next) => {
    try {
        let token = req.cookies?.token;
        // console.log(token);
        
        // let token = req.headers.authorization.split(" ")[1];
        if (token) {
            try {
                const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
                console.log(decodedToken);

                const resp = await User.findById(decodedToken.userId).select("isAdmin email");
                console.log(resp);
                

                if (!resp) {
                    return res.status(404).json({ status: false, message: "User not found." });
                }

                req.user = {
                    email: resp.email,
                    isAdmin: resp.isAdmin,
                    userId: decodedToken.userId,
                };
                console.log("User authenticated:", req.user);
                next();
            } catch (err) {
                console.log("Token verification error:", err.message);
                return res.status(401).json({ status: false, message: "Invalid or expired token. Please log in again." });
            }
            
        } else {
            return res.status(401).json({ status: false, message: "Missing Token - Not authorized. Try logging in again." });
        }
    } catch (error) {
        console.log("Authentication error:", error.message);
        return res.status(401).json({ status: false, message: "Not authorized. Try login again." });
    }
};

const isAdminRoute = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        return res.status(401).json({
            status: false,
            message: "Not authorized. Try login again as admin.",
        });
    }
};

// Exporting the middleware functions
export { protectRoute, isAdminRoute };