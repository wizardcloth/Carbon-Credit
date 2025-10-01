import { User } from "../Model/User.js";
import { User_email } from "../Model/User.email.js";
export const authCallbackGoogle = async (req, res) => {
    try {
        const { id, firstName, lastName, imageUrl } = req.body;

        let user = await User.findOne({ firebaseUID: id });

        if (user) {
            console.log("User already exists:");
        } else {
            user = await User.create({
                firebaseUID: id,
                fullName: `${firstName} ${lastName}`,
                imageUrl,
            });
            console.log("User created successfully");
        }

        res.status(201).json({ message: "User authenticated successfully", user });
    } catch (error) {
        console.error("Error during authentication callback:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const authCallbackEmail = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await User_email.create({
            name,
            email,
            password
        });
        res.status(201).json({ message: "User authenticated successfully", user });

    } catch (error) {
        console.error("Error during authentication callback:", error);
        res.status(500).json({ message: "Something went wrong" });
    }

}