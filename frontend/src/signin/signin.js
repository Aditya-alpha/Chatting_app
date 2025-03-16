import { useState } from "react"
import {useNavigate} from "react-router-dom"
import { RxCross2 } from "react-icons/rx";

export default function Signin() {

    const navigate = useNavigate()

    let [signInData, setSignInData] = useState({
        email: "",
        password: ""
    })

    function setData(event) {
        return (setSignInData((currData) => ({
            ...currData, [event.target.name]: event.target.value
        })))
    }

    function handleCross() {
        navigate("/")
    }

    function handleForgot() {
        if (!signInData.email.trim()) {
            alert("Please enter your email address before proceeding.");
            return
        }
        navigate("/signin/forgotpassword")
        window.localStorage.setItem("email", signInData.email)
    }

    async function handleSignIn(e) {
        e.preventDefault()
        let areAllFieldsFilled = Object.values(signInData).every((value) => value.trim() === "")
        if (areAllFieldsFilled) {
            alert("Please fill out all fields before proceeding.")
            return
        }
        if (!signInData.email.includes("@gmail.com")) {
            alert("Email must be a valid Gmail address (e.g., example@gmail.com).")
            return
        }
        if (signInData.password.length < 8) {
            alert("Password must contain atleast 8 characters.")
            return
        }
        try {
            const response = await fetch("http://localhost:8000/signin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(signInData)
            })
            if(response.ok) {
                const data = await response.json()
                window.localStorage.setItem("username", data.username)
                window.localStorage.setItem("email", data.email)
                window.localStorage.setItem("isSignedin", true)
                window.localStorage.setItem("profile_photo", data.profile_photo)
                alert("Signin successful !")
                navigate("/")
            }
            if(response.status === 403) {
                alert("The password is incorrect. Try again.")
            }
            if(response.status === 404) {
                alert("User not found. Please Sign up first.")
                navigate("/signup")
            }
        } 
        catch (error) {
            alert("An error occurred during sign-in. Please try again.");
            navigate("/")
        }
    }

    return (
        <div className="h-screen w-full flex justify-center items-center">
            <div className="h-[480px] w-[420px] rounded-lg py-4 px-5 bg-stone-600 shadow-2xl hover:scale-105 transition-all duration-300 max-sm:mx-4">
                <div className="flex justify-between">
                    <p className="font-medium text-3xl text-white">Sign in</p>
                    <RxCross2 onClick={handleCross} className="text-3xl mt-1 -mr-1 cursor-pointer hover:scale-125 transition-all duration-300" />
                </div>
                <form method="post" action="/signin" className="mt-6">
                    <input type="text" name="email" placeholder="Email" value={signInData.email} onChange={setData} className="block h-12 w-full px-3 rounded-md placeholder:text-black placeholder:opacity-70 border-2 border-black mt-8" />
                    <input type="password" name="password" placeholder="Password" value={signInData.password} onChange={setData} className="block h-12 w-full px-3 rounded-md placeholder:text-black placeholder:opacity-70 border-2 border-black mt-8" />
                    <p onClick={handleForgot} className="mt-4 text-white font-medium cursor-pointer w-36">Forgot password?</p>
                    <button onClick={handleSignIn} className="h-12 w-full mt-6 hover:text-2xl transition-all duration-200 rounded-full border-2 border-black bg-white text-black text-xl font-semibold" >Sign in</button>
                </form>
                <div className="flex items-center mt-6">
                    <hr className="flex-grow border-white" />
                    <p className="px-3 text-stone-300 font-medium -mt-1">or</p>
                    <hr className="flex-grow border-white" />
                </div>
                <button className="h-12 w-full mt-6 hover:text-lg transition-all duration-200 rounded-full font-medium border-[2px] border-black bg-white">Sign in with Google</button>
            </div>
        </div>
    )
}