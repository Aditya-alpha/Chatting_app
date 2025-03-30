import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../App';
import logo from "../images/logo.png";

export default function Navbar() {

    let navigate = useNavigate()

    let [isSignedin, setIsSignedin] = useContext(Context)

    let username = window.localStorage.getItem("username")

    useEffect(() => {
        setIsSignedin(window.localStorage.getItem("isSignedin"))
    }, [])

    function handleClick(e) {
        let name = e.target.innerText
        if (name === "Gallery") {
            navigate(`/${username}/gallery`)
        }
        else if (name === "Chats") {
            navigate(`/${username}/chats`)
        }
        else if (name === "Upload") {
            navigate(`/${username}/upload`)
        }
        else if (name === "Signin") {
            navigate("/signup")
        }
        else if (name === "Profile") {
            navigate(`/${username}/profile`)
        }
        else {
            navigate("/")
        }
    }

    return (
        <div className="h-16 w-full flex items-center px-12">
            {/* <div onClick={handleClick} className="h-full mt-3 cursor-pointer">
                <img src={logo} alt="logo" className="h-5/6 w-32 hover:scale-110 transition-all duration-300" />
            </div> */}
                {isSignedin ?
                    <div className="ml-auto mt-2 flex space-x-10">
                        <div onClick={handleClick} className="text-white text-lg font-medium px-4 py-1 cursor-pointer hover:scale-125 hover:bg-sky-900 rounded-2xl transition-all duration-300">Home</div>
                        <div onClick={handleClick} className="text-white text-lg font-medium px-4 py-1 cursor-pointer hover:scale-125 hover:bg-sky-900 rounded-2xl transition-all duration-300">Chats</div>
                        <div onClick={handleClick} className="text-white text-lg font-medium px-4 py-1 cursor-pointer hover:scale-125 hover:bg-sky-900 rounded-2xl transition-all duration-300">Gallery</div>
                        <div onClick={handleClick} className="text-white text-lg font-medium px-4 py-1 cursor-pointer hover:scale-125 hover:bg-sky-900 rounded-2xl transition-all duration-300">Upload</div>
                        <div onClick={handleClick} className="text-white text-lg font-medium px-4 py-1 cursor-pointer hover:scale-125 hover:bg-sky-900 rounded-2xl transition-all duration-300">Profile</div>
                    </div>
                    :
                    <div onClick={handleClick} className="text-white text-lg font-medium px-4 py-1 ml-auto mt-2 cursor-pointer hover:scale-125 hover:bg-sky-900 rounded-2xl transition-all duration-300">Signin</div>
                }
        </div>
    );
}
