import { useState } from "react"
import {useNavigate} from "react-router-dom"
import { RxCross2 } from "react-icons/rx";

export default function SignUp() {

    const navigate = useNavigate()

    let [signUpData, setSignUpData] = useState({
        username: "",
        email: "",
        password: ""
    })

    function setData(event) {
        return (setSignUpData((currData) => ({
            ...currData, [event.target.name]: event.target.value
        })))
    }

    function handleCross () {
        navigate("/")
    }

    async function handleSignup (e) {
        e.preventDefault()
        let areAllFieldsFilled = Object.values(signUpData).every((value) => value.trim() === "" )
        if (areAllFieldsFilled) {
            alert("Please fill out all fields before proceeding.")
            return
        }
        if (!signUpData.email.endsWith("@gmail.com")) {
            alert("Email must be a valid Gmail address (e.g., example@gmail.com).")
            return
        }
        if (signUpData.password.length < 8) {
            alert("Password must contain atleast 8 characters.")
            return
        }
        try {
            let response = await fetch("http://localhost:8000/signup", {
                method: "POST",
                headers: {
                    'Content-Type': "application/json"
                },
                body: JSON.stringify(signUpData)
            })
            const data = await response.json()
            if (response.ok) {
                window.localStorage.setItem("username", signUpData.username)
                window.localStorage.setItem("email", signUpData.email)
                navigate("/signup/otp")
            }
            else if (response.status === 408) {
                alert (`${data.message}`)
            }
            else if (response.status === 409) {
                alert (`${data.message}`)
            }
            else {
                alert("An unexpected error occured.")
            }
        }
        catch (error) {
            alert("An error occurred during sign-up. Please refresh and try again.");
            navigate("/")
        }
    }
    
    return (
        <div className="h-screen w-full flex justify-center items-center">
            <div className="h-[500px] w-[420px] rounded-lg py-4 px-5 bg-stone-600 shadow-2xl hover:scale-105 transition-all duration-300 max-sm:mx-4">
                <div className="flex justify-between">
                    <p className="font-medium text-3xl text-white">Sign up</p>
                    <RxCross2 onClick={handleCross} className="text-3xl mt-1 -mr-1 cursor-pointer hover:scale-125 transition-all duration-300" />
                </div>
                <form method="post" action="/signup" className="mt-5">
                    <input type="text" name="username" placeholder="Username" value={signUpData.username} onChange={setData} className="block h-12 w-full px-3 rounded-md placeholder:text-black placeholder:opacity-70 border-2 border-black mt-4" />
                    <input type="text" name="email" placeholder="Email" value={signUpData.email} onChange={setData} className="block h-12 w-full px-3 rounded-md placeholder:text-black placeholder:opacity-70 border-2 border-black mt-4" />
                    <input type="password" name="password" placeholder="Password" value={signUpData.password} onChange={setData} className="block h-12 w-full px-3 rounded-md placeholder:text-black placeholder:opacity-70 border-2 border-black mt-4" />
                    <p className="text-white w-44 hover:scale-105 transition-all duration-300 mt-4 font-medium cursor-pointer underline" onClick={() => navigate("/signin")}>Already a user? Sign in</p>
                    <button onClick={handleSignup} className="h-12 w-full mt-5 hover:text-2xl transition-all duration-200 rounded-full bg-white text-black text-xl font-semibold border-2 border-black" >Sign up</button>
                </form>
                <div className="flex items-center mt-5">
                    <hr className="flex-grow border-white" />
                    <p className="px-3 text-stone-300 font-medium -mt-1">or</p>
                    <hr className="flex-grow border-white" />
                </div>
                <button className="h-12 w-full mt-5 bg-white text-lg hover:text-xl transition-all duration-200 rounded-full font-semibold border-[2px] border-black">Sign in with Google</button>
            </div>
        </div>
    )
}