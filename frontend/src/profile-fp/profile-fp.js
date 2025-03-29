import { useNavigate } from "react-router-dom"
import { RxCross2 } from "react-icons/rx"

export default function ForgotProfilePassword() {

    const navigate = useNavigate()

    let username = window.localStorage.getItem("username")
    let email = window.localStorage.getItem("email")

    function handleCross() {
        navigate(`/${username}/profile/updatepassword`)
    }

    function handleProceed() {
        navigate(`/${username}/profile/forgotpassword/verify`)
        sendOtp()
    }

    async function sendOtp() {
        try {
            const response = await fetch("https://hosttel.onrender.com/signin/forgotpassword", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email })
            })
            if (!response.ok) {
                alert("Failed to send OTP.")
                navigate(`/${username}/profile/updatepassword`)
            }
        }
        catch (error) {
            alert("An error occurred during sign-in. Please try again.")
            window.localStorage.removeItem("email")
            navigate(`/${username}/profile/updatepassword`)
        }

    }

    return (
        <div className="h-screen w-full flex justify-center items-center bg-stone-700">
            <div className="h-56 w-[600px] rounded-lg py-6 px-5 bg-stone-600 shadow-2xl hover:scale-105 transition-all duration-300 max-sm:mx-4">
                <div className="flex justify-between">
                    <p className="font-medium text-2xl text-white">Forgot Password</p>
                    <RxCross2 onClick={handleCross} className="text-3xl mt-1 -mr-1 cursor-pointer hover:scale-125 transition-all duration-300" />
                </div>
                <div>
                    <p className="my-6 pl-[2px] text-white" >You will get a verification code on XXXXXXX{email.slice(-14)}@gmail.com</p>
                    <button onClick={handleProceed} className="h-12 w-full mt-2 hover:text-2xl text-xl transition-all duration-200 rounded-full bg-white text-black font-semibold">Press to proceed</button>
                </div>
            </div>
        </div>
    )
}