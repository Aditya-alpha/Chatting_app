import { useNavigate } from "react-router-dom"
import hero from "../images/hero.png"
import chat from "../images/chat.png"

export default function Homebody() {

    let navigate = useNavigate()

    let username = window.localStorage.getItem("username")

    function handleClick1 (e) {
        let name = e.currentTarget.querySelector("p").innerText
        if (name === "Chatting") {
            navigate(`/${username}/chats`)
        }
        else if (name === "Gallery") {
            navigate(`/${username}/gallery`)
        }
        else if (name === "Groups") {
            navigate(`/${username}/groups`)
        }
        else {
            navigate(`/${username}/allchat`)
        }
    }

    function handleClick2 (e) {
        let name = e.target.innerText
        if (name === "Chatting") {
            navigate(`/${username}/chats`)
        }
        else if (name === "Communities / Groups") {
            navigate(`/${username}/groups`)
        }
        else {
            navigate(`/${username}/upload`)
        }
    }

    return (
        <div className="h-full w-full pt-12 px-12 bg-stone-700">
            <div className="h-96 w-full flex" >
                <div className="h-full w-2/3 space-y-3">
                    <div className="flex mb-12">
                        <p className="text-white text-6xl font-bold" >Welcome</p>
                        <p className="relative text-red-500 text-6xl font-bold ml-4 transition-all duration-300 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-1 after:bg-red-500 after:transition-all after:duration-300 hover:after:w-full">HERO</p>
                    </div>
                    <div className="w-1/3 h-full space-y-4" >
                        <p className="text-white text-3xl font-semibold" >Features</p>
                        <p onClick={handleClick2} className="h-11 pl-4 pt-1 text-2xl font-medium rounded-full bg-white hover:scale-110 transition-all duration-300 cursor-pointer" >Chatting</p>
                        <p onClick={handleClick2} className="h-11 pl-4 pt-1 text-2xl font-medium rounded-full bg-white hover:scale-110 transition-all duration-300 cursor-pointer" >Communities / Groups</p>
                        <p onClick={handleClick2} className="h-11 pl-4 pt-1 text-2xl font-medium rounded-full bg-white hover:scale-110 transition-all duration-300 cursor-pointer" >Share Images and Videos</p>
                    </div>
                </div>
                <img src={hero} alt="hero_image" className="h-full w-1/3" />
            </div>
            <div className="h-72 w-full flex justify-around px-8" >
                <div onClick={handleClick1} className="h-full w-80 flex items-center hover:scale-105 transition-all duration-300 cursor-pointer">
                    <p className="-rotate-90 -mx-9 text-white text-3xl transform font-semibold whitespace-nowrap tracking-wider" >Chatting</p>
                    <img src={chat} alt="chat_image" className="h-full w-64 rounded-2xl" />
                </div>
                <div onClick={handleClick1} className="h-full w-80 flex items-center hover:scale-105 transition-all duration-300 cursor-pointer">
                    <p className="-rotate-90 -mx-6 text-white text-3xl transform font-semibold whitespace-nowrap tracking-wider" >Gallery</p>
                    <img src={chat} alt="chat_image" className="h-full w-64 rounded-2xl" />
                </div>
                <div onClick={handleClick1} className="h-full w-80 flex items-center hover:scale-105 transition-all duration-300 cursor-pointer">
                    <p className="-rotate-90 -mx-6 text-white text-3xl transform font-semibold whitespace-nowrap tracking-wider" >Groups</p>
                    <img src={chat} alt="chat_image" className="h-full w-64 rounded-2xl" />
                </div>
                <div onClick={handleClick1} className="h-full w-80 flex items-center ml-2 hover:scale-105 transition-all duration-300 cursor-pointer">
                    <p className="-rotate-90 -mx-7 text-white text-3xl transform font-semibold whitespace-nowrap" >All Chat</p>
                    <img src={chat} alt="chat_image" className="h-full w-64 rounded-2xl" />
                </div>
            </div>
        </div>
    )
}