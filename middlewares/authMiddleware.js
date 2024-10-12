import jwt from "jsonwebtoken";
import User from "../models/users.js";

const protectRoute  = async (req, res, next) => {
    try {
        let token = req.cookies?.token;

        if (token) {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

            const resp = await User.findById(decodedToken.userId).select("isAdmin email");

            if (!resp) {
                return res.status(401).json({ status: false, message: "User not found." });
            }

            req.user = {
                email: resp.email,
                isAdmin: resp.isAdmin,
                userId: decodedToken.userId,
            };
            console.log("User authenticated:", req.user);
            next();
        } else {
            return res.status(401).json({ status: false, message: "Not authorized. Try login again." });
        }
    } catch (error) {
        console.log(error);
        return res.status(401).json({ status: false, message: "Not authorized. Try login again." });
    }
};

const isAdminRoute = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        return res.status(401).json({
            status: false,
            message: "Not authorized. Try login again.",
        });
    }
};

// Exporting the middleware functions
export { protectRoute, isAdminRoute };
