import { useSignInWithGoogle } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";
import { Button } from "./ui/button";
import { Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SignInButton = () => {
    const [signInWithGoogle,, loading, error] = useSignInWithGoogle(auth);
    const navigate = useNavigate();

    if(error) {
        //* have to navigate to error page
        console.log(error);
    }

    const handleSignIn = async () => {
        await signInWithGoogle();
        navigate("/authcallback/google");
    };
    return (
        <Button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full bg-emerald-500 border-zinc-400 h-11 hover:bg-emerald-600 hover:cursor-pointer"
            variant="ghost"
        >
            {loading ? <Loader className="size-5 animate-spin" /> : <span className="text-sm text-white font-bold">Sign In with Google</span>}
        </Button>
    );

}
export default SignInButton;