import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { RxCross2 } from "react-icons/rx"

export default function UpdatePassword() {

    let navigate = useNavigate()

    let { username } = useParams()
    let [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    })

    async function updatePassword(e) {
        e.preventDefault()
        if(passwordData.newPassword.length < 8) {
            alert("Password must have atleast 8 digits.")
            return
        }
        if(passwordData.newPassword !== passwordData.confirmNewPassword) {
            alert("Make sure the new password match.")
            return
        }
        try {
            const response = await fetch(`https://hosttel.onrender.com/${username}/profile/updatepassword`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(passwordData)
            })
            if (response.status === 200) {
                alert("Password updated successfully !")
                navigate(`/${username}/profile`)
            }
            else {
                alert("Old password is incorrect.")
            }
        }
        catch (error) {
            alert("An error occured. Please try again later.")
        }
    }

    function setData(event) {
        return (setPasswordData((currData) => ({
            ...currData, [event.target.name]: event.target.value
        })))
    }

    function handleCross() {
        navigate(`/${username}/profile`)
    }

    return (
        <div className="flex justify-center items-center h-screen w-full bg-stone-700 ">
            <div className="h-[440px] w-[420px] rounded-lg py-4 px-5 bg-stone-600 shadow-2xl hover:scale-105 transition-all duration-300 max-sm:mx-4">
                <div className="flex justify-between">
                    <p className="font-medium text-3xl text-white">Change Password</p>
                    <RxCross2 onClick={handleCross} className="text-3xl mt-1 -mr-1 cursor-pointer hover:scale-125 transition-all duration-300" />
                </div>
                <form className="mt-6">
                    <input type="password" name="oldPassword" placeholder="Old password" value={passwordData.oldPassword} onChange={setData} className="block h-12 w-full px-3 rounded-md placeholder:text-black placeholder:opacity-70 border-2 border-black mt-8" />
                    <input type="password" name="newPassword" placeholder="New password" value={passwordData.newPassword} onChange={setData} className="block h-12 w-full px-3 rounded-md placeholder:text-black placeholder:opacity-70 border-2 border-black mt-8" />
                    <input type="password" name="confirmNewPassword" placeholder="Confirm new password" value={passwordData.confirmNewPassword} onChange={setData} className="block h-12 w-full px-3 rounded-md placeholder:text-black placeholder:opacity-70 border-2 border-black mt-8" />
                    <p onClick={() => navigate(`/${username}/profile/forgotpassword`)} className="mt-4 text-white font-medium cursor-pointer w-36">Forgot password?</p>
                    <button onClick={updatePassword} className="h-12 w-full mt-6 hover:text-2xl transition-all duration-200 rounded-full bg-white text-black text-xl font-semibold border-2 border-black" >Update Password</button>
                </form>
            </div>
        </div>
    )
}