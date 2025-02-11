import { useNavigate } from "react-router-dom"
import Navbar from "../navbar/navbar"
import { FaUserCircle } from "react-icons/fa"

export default function Profile() {

    let navigate = useNavigate()

    let username = window.localStorage.getItem("username")
    let email = window.localStorage.getItem("email")


    return (
        <div className="h-full w-full">
            <Navbar />
            <div className="h-1/3 w-full relative">
                <div className="h-full w-full pt-28 bg-stone-700" ></div>
                <FaUserCircle className="h-60 w-60 rounded-full text-stone-400 cursor-pointer absolute top-32 left-28 p-2 bg-stone-800" /></div>
            <div className="mt-36 pl-[125px] text-white text-xl font-medium" >
                <p>{username}</p>
                <p>{email}</p>
                <p onClick={() => { navigate(`/${username}/profile/updatepassword`) }} className="w-44 hover:underline hover:scale-110 transition-all duration-200 cursor-pointer" >Change password</p>
            </div>
        </div>
    )
}