import { OAuth2Client } from 'google-auth-library';
import { jwtDecode } from "jwt-decode";
import User from '../models/users.js';
import crypto from 'crypto';
import { randomBytes } from 'crypto';
import { createJWT } from '../utils/utility.js';

// Initialize Google OAuth2 client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const loginWithGoogle = async (req, res) => {
    try {
        const { credential } = req.body;
        console.log('credential: ',credential)
        console.log('req.body: ',req.body)
        const decodedCredential = jwtDecode(credential);
        console.log('decodedCredential', decodedCredential);
        
        
        // Verify the Google ID token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        const { email, name, picture } = payload;
        
        // Check if user exists
        let user = await User.findOne({ email });
        
        if (!user) {
            // Create new user with Google data
            user = new User({
                email,
                username: email.split('@')[0],
                firstName: name.split(' ')[0],
                lastName: name.split(' ')[1] || '',
                image: picture,
                // Set a random password that won't be used
                password: crypto.randomBytes(16).toString('hex'),
                // Mark as Google-signin user
                authMethod: 'google',
                verified: true // Google-authenticated users are automatically verified
            });
            
            await user.save();
        } else if (user.authMethod !== 'google') {
            // User exists but didn't sign up with Google originally
            return res.status(400).json({
                status: false,
                message: "This email is already registered with email/password. Please login with your password."
            });
        }
        
        // Generate JWT token
        const token = createJWT(res, user._id);
        
        // Prepare user data to return
        const userData = {
            id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isAdmin: user.isAdmin,
            image: user.image,
            authMethod: user.authMethod
        };
        
        res.status(200).json({
            status: true,
            message: "Google login successful",
            data: {
                user: userData,
                token
            }
        });
        console.log('res', res.status);
        
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(400).json({
            status: false,
            message: 'Google authentication failed'
        });
    }
};