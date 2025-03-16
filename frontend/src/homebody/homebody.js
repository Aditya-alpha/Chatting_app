import { useNavigate } from "react-router-dom"
import star from "../images/star.png"

export default function Homebody() {

    let navigate = useNavigate()

    let username = window.localStorage.getItem("username")

    function handleClick1(e) {
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

    function handleClick2(e) {
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
        <div className="h-full w-full pt-12 px-12" >
            <div className="h-screen w-full ml-12" >
                <div className="h-full w-full space-y-3">
                    <div className="mb-20">
                        <div className="flex justify-between pr-80" >
                            <p className="text-white text-8xl font-bold opacity-90" >Welcome To The</p>
                            <img src={star} className="h-12 w-12 rotate-12 mt-8 hover:scale-150 transition-all duration-500 animate-glow-star" />
                        </div>
                        <div className="flex ml-24 mt-12">
                            <img src={star} className="h-10 w-10 rotate-12 mt-8 hover:scale-150 transition-all duration-500 animate-glow-star" />
                            <p className="text-white text-8xl font-bold opacity-90 ml-36" >World of</p>
                            <p className="relative text-yellow-400 opacity-90 text-8xl font-bold ml-10 transition-all duration-300 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-1 after:bg-yellow-400 after:transition-all after:duration-300 hover:after:w-full">Memories</p>
                        </div>
                    </div>
                    <div className="w-full opacity-90 flex" >
                        <div className="w-1/3 space-y-7" >
                            <p className="text-white text-4xl mb-4 font-semibold" >Features</p>
                            <p onClick={handleClick2} className="h-11 pl-4 pt-1 text-2xl font-medium rounded-full bg-white hover:scale-110 transition-all duration-500 cursor-pointer" >Chatting</p>
                            <p onClick={handleClick2} className="h-11 pl-4 pt-1 text-2xl font-medium rounded-full bg-white hover:scale-110 transition-all duration-500 cursor-pointer" >Communities / Groups</p>
                            <p onClick={handleClick2} className="h-11 pl-4 pt-1 text-2xl font-medium rounded-full bg-white hover:scale-110 transition-all duration-500 cursor-pointer" >Upload Images and Videos</p>
                        </div>
                        <div className="flex h-80 relative z-0 ml-80" >
                            <div onClick={handleClick1} className="h-full w-72 bg-yellow-100 animate-glow rounded-2xl absolute z-10 cursor-pointer -rotate-12 hover:z-50 hover:scale-110 transition-all duration-700" >
                                <p className="text-3xl font-medium absolute -rotate-90 pb-52 ml-16" >Chatting</p>
                                <p className="text-xl p-4 ml-12 font-medium" >You can chat with a person using this CHAT feature. It will be one-to-one conversation. Share you thoughts freely.</p>
                            </div>
                            <div onClick={handleClick1} className="h-full w-72 bg-yellow-300 animate-glow rounded-2xl absolute ml-12 mt-1 z-20 cursor-pointer -rotate-6 hover:z-50 hover:scale-110 transition-all duration-700" >
                                <p className="text-3xl font-medium absolute -rotate-90 pb-52 ml-20" >Gallery</p>
                                <p className="text-xl p-4 ml-12 font-medium" >It is a hub of your uploaded media from where you can access it anytime. All the data will be stored to cloud.</p>
                            </div>
                            <div onClick={handleClick1} className="h-full w-72 bg-yellow-500 animate-glow rounded-2xl absolute ml-24 mt-3 z-30 cursor-pointer hover:z-50 hover:scale-110 transition-all duration-700" >
                                <p className="text-3xl font-medium absolute -rotate-90 pb-52 ml-20" >Groups</p>
                                <p className="text-xl p-4 ml-12 font-medium" >You can create a group of 3 or more than 3 members like school groups, friends groups, study groups, etc.</p>
                            </div>
                            <div onClick={handleClick1} className="h-full w-72 bg-yellow-700 animate-glow rounded-2xl absolute ml-36 z-40 cursor-pointer mt-6 rotate-6 hover:z-50 hover:scale-110 transition-all duration-700" >
                                <p className="text-3xl font-medium absolute -rotate-90 pb-52 ml-20" >All Chat</p>
                                <p className="text-xl p-4 ml-12 font-medium" >You can communicate with the whole world and can openly share your thoughts.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}