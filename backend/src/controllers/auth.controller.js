import { OAuth2Client } from "google-auth-library"
import jwt from "jsonwebtoken"
import User from "../models/User.js"

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
)

const allowedDomains = [
    "kalvium.community",
    "kalvium.com"
]

export const googleLogin = async (req, res) => {
    try {

        const { token } = req.body;


        const ticket = await client.verifyIdToken({
            idToken : token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        const {
            sub : googleId,
            name, 
            email,
            picture
        } = payload

        const emailDomain = email.split("@")[1]

        if (!allowedDomains.includes(emailDomain)){
            return res.status(403).json({
                message: "Only Kalvium email accounts are allowed"
            })
        }

        let user = await User.findOne({
            googleId
        })

        if (!user){
            user = User.create({
                googleId,
                name,
                email,
                picture
            })
        }

        const jwtToken = jwt.sign(
            {
                id:user._id,
                email:user.email
            },
            process.env.JWT_SECRET,

            {
                expiresIn:"7d"
            }
        )

        res.status(200).json({

            message:
            "Login successful",


            token:jwtToken,


            user
        })

    } catch (error) {
        res.status(500).json({
            message: "Google Authentication Failed",
        })
    }
}