import { User } from "../Model/User.js";
import { User_email } from "../Model/User.email.js";

export const getUsersGoogle = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);

    } catch (error) {
        console.log(error);
    }
}

export const getUsersEmail = async (req, res) => {
    try {
        const users = await User_email.find({});
        res.status(200).json(users);

    } catch (error) {
        console.log(error);
    }
}