import { auth } from "@/lib/firebase.ts";

export const getUserToken = async () => {
    const user = auth.currentUser;
    // console.log(user);
    if (!user) {
        return null; 
    }
    const token = await user.getIdToken();
    return token;
};

export const createHeader = async () => {
    const token = await getUserToken();
    // console.log(token);
    if (!token) {
        return {};
    }
    
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    };
};
