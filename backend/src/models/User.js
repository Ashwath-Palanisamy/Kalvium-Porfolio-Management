import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
    {
        googleId: {
            type: String,
            required: true,
            unique: true,
        },

        name: {
            type: String,
            required:true,
        },

        email: {
            type: String,
            required:true,
            unique: true,
        },

        picture: {
            type: String,
        },

        personalEmail : {
            type: String,
            default: "",
        },

        squadId : {
            type: String,
            default : "",
        },

        bio : {
            type: String,
            default : ""
        },

        githubId : {
            type: String,
            default : ""
        },

        linkedInId : {
            type: String,
            default: ""
        },

        LeetCodeId : {
            type: String,
            default : ""
        },

        resume : {
            type: String,
            default: ""
        }

    },
    {
        timestamps: true,
    }
)

const User = mongoose.model("User", userSchema);

export default User;