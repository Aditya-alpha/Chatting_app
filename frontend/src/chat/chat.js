import { useState, useRef, useEffect } from "react"
import Navbar from "../navbar/navbar"
import { IoMdSearch } from "react-icons/io"
import { GrFormAttachment } from "react-icons/gr"
import { VscSend } from "react-icons/vsc"
import { RxCross1 } from "react-icons/rx"
import { io } from 'socket.io-client'

const socket = io("http://localhost:8000")

export default function Chat() {
    let username = window.localStorage.getItem("username")
    let endRef = useRef(null)
    let textareaRef = useRef(null)
    let [to, setTo] = useState("")
    let [search, setSearch] = useState("")
    let [isClicked, setIsClicked] = useState(false)
    let [text, setText] = useState("")
    let [files, setFiles] = useState([])
    let [fetchedMessage, setFetchedMessage] = useState([])
    let [allChats, setAllChats] = useState([])
    let [toProfilePhoto, setToProfilePhoto] = useState([])
    let [fullscreen, setFullscreen] = useState(null)


    useEffect(() => {
        socket.emit("userRegister", username)
    }, [username])

    useEffect(() => {
        socket.on("freshChatList", (messageWithPhoto) => {
            if ((messageWithPhoto.from === username && messageWithPhoto.to === to) || (messageWithPhoto.from === to && messageWithPhoto.to === username)) {
                setFetchedMessage((prevMessages) => [...prevMessages, messageWithPhoto])
                setTimeout(() => {
                    endRef.current?.scrollIntoView({ behavior: "smooth" })
                }, 100)
            }

            setAllChats(prevChats => {
                const chatKey = [messageWithPhoto.from, messageWithPhoto.to].sort().join("-")
                const updatedChats = new Map(prevChats.map(chat => {
                    const key = [chat.from, chat.to].sort().join("-")
                    return [key, chat]
                }))

                updatedChats.set(chatKey, {
                    from: messageWithPhoto.from,
                    to: messageWithPhoto.to,
                    text: messageWithPhoto.text,
                    profile_photo: messageWithPhoto.profile_photo,
                    to_profile_photo: messageWithPhoto.to_profile_photo,
                    date: messageWithPhoto.date
                })
                return Array.from(updatedChats.values()).sort((a, b) => new Date(b.date) - new Date(a.date))
            })

            setTimeout(() => {
                endRef.current?.scrollIntoView({ behavior: "smooth" })
            }, 100)
        })

        return () => socket.off("freshChatList")
    }, [username, to])

    useEffect(() => {
        if (!to) return
        async function handleFetchPreviousMessages() {
            try {
                let response = await fetch(`http://localhost:8000/${username}/chat`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ type: "fetch", to })
                })
                if (response.ok) {
                    let chats = await response.json()
                    setFetchedMessage(chats)
                    endRef.current?.scrollIntoView({ behavior: "instant" })
                }
            }
            catch (error) {
                alert("An error occurred, please refresh and try again")
            }
        }
        handleFetchPreviousMessages()
    }, [username, to])

    useEffect(() => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = "28px"
            textarea.style.height = `${textarea.scrollHeight}px`
        }
    }, [to])

    useEffect(() => {
        const fetchData = async () => {
            try {
                let response = await fetch(`http://localhost:8000/${username}/chat`, {
                    method: "GET"
                })
                if (response.ok) {
                    let data = await response.json()
                    const uniqueChats = Array.from(
                        new Map(
                            data.map(chat => {
                                const chatKey = [chat.from, chat.to].sort().join("-")
                                return [chatKey, chat]
                            })
                        ).values()
                    )
                    setAllChats(uniqueChats.sort((a, b) => new Date(b.date) - new Date(a.date)))
                }
            }
            catch (error) {
                alert("An error occurred, please refresh and try again")
            }
        }
        fetchData()
    }, [username, to, fetchedMessage])

    function handleSearch(e) {
        setSearch(e.target.value)
    }

    function handleText(e) {
        setText(e.target.value)
    }

    function handleFileChange(e) {
        let selectedFiles = e.target.files ? Array.from(e.target.files) : []
        setFiles(selectedFiles)
        if (selectedFiles.length > 0) {
            let fileNames = selectedFiles.map(file => file.name).join(", ")
            setText(prev => prev ? `${prev} [${fileNames}]` : `[${fileNames}]`)
        }
    }

    async function handleFind() {
        try {
            let response = await fetch(`http://localhost:8000/${username}/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ type: "user", search })
            })
            if (response.ok) {
                let receiver = await response.json()
                if (receiver.length > 0) {
                    setTo(receiver[0].username)
                    setToProfilePhoto(receiver[0].profile_photo)
                    setFetchedMessage([])
                    setIsClicked(true)
                    setSearch("")
                }
                else {
                    alert("User not found !")
                }
            }
        }
        catch (error) {
            alert("An error occurred, please refresh and try again")
        }
    }

    function handleFindByEnter(e) {
        if (e.key === "Enter") {
            handleFind()
        }
    }

    async function handleSelectChat(chatTo) {
        setIsClicked(true)
        setTo(chatTo)
        try {
            let response = await fetch(`http://localhost:8000/${username}/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ type: "fetch", to: chatTo })
            })
            if (response.ok) {
                let chats = await response.json()
                setFetchedMessage(chats)
                setToProfilePhoto(chats[0].to_profile_photo)
                endRef.current?.scrollIntoView({ behavior: "instant" })
            }
        }
        catch (error) {
            alert("An error occurred, please refresh and try again")
        }
    }

    async function handleSend() {
        try {
            if (text.length === 0 && files.length === 0) {
                return
            }
            let cleanMessage = text.replace(/\[.*?\]/g, "").trim()
            let formData = new FormData()
            formData.append("type", "create")
            formData.append("to", to);
            formData.append("message", cleanMessage)
            files.forEach(file => {
                formData.append("files", file)
            })
            let response = await fetch(`http://localhost:8000/${username}/chat`, {
                method: "POST",
                body: formData
            })
            if (response.ok) {
                let newMessage = await response.json()
                if (newMessage) {
                    setText("")
                    setFiles([])
                }
                else {
                    alert("Message not sent !")
                }
            }
        }
        catch (error) {
            alert("An error occurred, please refresh and try again")
        }
    }

    function handleSendByEnter(e) {
        if (e.key === "Enter") {
            handleSend()
        }
    }

    return (
        <div>
            <Navbar />
            <div className="text-white h-[600px] m-4 border-2 bg-[#262523] rounded-xl flex chat-container">
                <div className="h-full w-2/5 border-r-2">
                    <div className="text-xl font-semibold px-6 py-4">Chats</div>
                    <div className="px-6 flex">
                        <input onChange={handleSearch} onKeyDown={handleFindByEnter} value={search} placeholder="Search" className="bg-stone-700 opacity-90 h-9 w-full mb-2 rounded-md pl-3" />
                        <IoMdSearch onClick={handleFind} className="h-9 w-10 p-1 ml-2 bg-stone-700 hover:bg-stone-600 rounded-full transition-all duration-300 cursor-pointer" />
                    </div>
                    <div className="h-[530px] w-full pl-6 pr-3 overflow-y-auto scrollbar-thin scrollbar-track-[#262523] scrollbar-thumb-stone-600">
                        {allChats.length > 0 ?
                            <div>
                                {allChats.map((chat) => {
                                    return chat.to === username ?
                                        (
                                            <div onClick={() => handleSelectChat(chat.from)} key={chat._id} className={`flex justify-between mt-2 px-3 py-2 rounded-lg cursor-pointer 
                                        ${to === chat.from ? "bg-stone-700" : "hover:bg-stone-700 active:bg-stone-600"}`} >
                                                <div className="flex">
                                                    <img onClick={ (e) => {e.stopPropagation(); setFullscreen(chat.profile_photo)}} src={chat.profile_photo} alt="profile" className="h-12 w-12 rounded-full bg-black" />
                                                    <p className="mt-[10px] ml-4 text-lg font-medium" >{chat.from === username ? chat.from + "  (You)" : chat.from}</p>
                                                </div>
                                                <p className="mt-3" >{chat.date.slice(11, 16)}</p>
                                            </div>
                                        )
                                        :
                                        (
                                            <div onClick={() => handleSelectChat(chat.to)} key={chat._id} className={`flex justify-between mt-2 px-3 py-2 rounded-lg cursor-pointer 
                                        ${to === chat.to ? "bg-stone-700" : "hover:bg-stone-700 active:bg-stone-600"}`} >
                                                <div className="flex">
                                                    <img onClick={ (e) => {e.stopPropagation(); setFullscreen(chat.to_profile_photo)}} src={chat.to_profile_photo} alt="profile" className="h-12 w-12 rounded-full bg-black" />
                                                    <p className="mt-[10px] ml-4 text-lg font-medium" >{chat.to}</p>
                                                </div>
                                                <p className="mt-3" >{chat.date.slice(11, 16)}</p>
                                            </div>
                                        )
                                })}
                            </div>
                            :
                            <p className="text-3xl font-semibold m-16" >Start Messaging</p>
                        }
                    </div>
                </div>
                <div className="h-full w-full flex flex-col justify-between">
                    {isClicked &&
                        <div onClick={ () => {setFullscreen(toProfilePhoto)}} className="flex px-6 py-3 border-b-2 border-black cursor-pointer">
                            <img src={toProfilePhoto} alt="profile" className="h-12 w-12 rounded-full" />
                            <p className="mt-[10px] ml-4 text-lg font-medium" >{to}</p>
                        </div>
                    }
                    {isClicked &&
                        <div className="h-full w-full overflow-y-scroll px-4 my-2 scrollbar-thin scrollbar-track-[#262523] scrollbar-thumb-stone-600 flex flex-col">
                            {fetchedMessage.length > 0 && fetchedMessage.map((msg) => (
                                msg.from !== username ?
                                    <div key={msg._id} className="flex mb-4 gap-5" >
                                        <img onClick={ () => {setFullscreen(msg.profile_photo)}} src={msg.profile_photo} alt="profile" className="h-10 w-10 rounded-full bg-black bg-opacity-40 cursor-pointer" />
                                        <div className="flex flex-col" >
                                            {msg.files.length > 0 && (
                                                <div>
                                                    {msg.files.map((file, idx) => (
                                                        <div key={idx}>
                                                            {file.fileUrl && (
                                                                <>
                                                                    {file.fileUrl.endsWith(".mp4") ||
                                                                        file.fileUrl.endsWith(".webm") ||
                                                                        file.fileUrl.endsWith(".ogg") ? (
                                                                        <div className="bg-black bg-opacity-40 rounded-lg flex gap-4 relative cursor-pointer" >
                                                                            <video
                                                                                controls
                                                                                className="max-w-[300px] max-h-[300px] object-contain rounded-lg"
                                                                            >
                                                                                <source src={file.fileUrl} type="video/mp4" />
                                                                                Your browser does not support the video tag.
                                                                            </video>
                                                                            <p className="absolute bottom-0 right-0 pb-2 pr-4 text-xs" >{new Date(file.uploadDate).toLocaleString().slice(11, -6)} {new Date(file.uploadDate).toLocaleString().slice(18)}</p>
                                                                        </div>
                                                                    ) : (
                                                                        <div onClick={ () => {setFullscreen(file.fileUrl)}} className="bg-black bg-opacity-40 rounded-lg flex gap-4 relative cursor-pointer" >
                                                                            <img
                                                                                src={file.fileUrl}
                                                                                alt={`Uploaded File ${idx + 1}`}
                                                                                className="max-w-[300px] max-h-[300px] object-contain rounded-lg"
                                                                            />
                                                                            <p className="absolute bottom-0 right-0 pb-2 pr-4 text-xs" >{new Date(file.uploadDate).toLocaleString().slice(11, -6)} {new Date(file.uploadDate).toLocaleString().slice(18)}</p>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {msg.text.message && (
                                                <div className="bg-black bg-opacity-40 h-min-9 px-3 py-1 rounded-lg flex gap-4 justify-between" >
                                                    <p className="text-lg font-medium max-w-[500px] break-words" >{msg.text.message}</p>
                                                    <p className="text-xs self-end" >{new Date(msg.text.sentDate).toLocaleString().slice(11, -6)} {new Date(msg.text.sentDate).toLocaleString().slice(19)}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    :
                                    <div key={msg._id} className="flex mb-4 gap-5 self-end right-6" >
                                        <div className="flex flex-col" >
                                            {msg.files.length > 0 && (
                                                <div>
                                                    {msg.files.map((file, idx) => (
                                                        <div key={idx}>
                                                            {file.fileUrl && (
                                                                <>
                                                                    {file.fileUrl.endsWith(".mp4") ||
                                                                        file.fileUrl.endsWith(".webm") ||
                                                                        file.fileUrl.endsWith(".ogg") ? (
                                                                        <div className="bg-black bg-opacity-40 rounded-lg flex gap-4 relative cursor-pointer" >
                                                                            <video
                                                                                controls
                                                                                className="max-w-[300px] max-h-[300px] object-contain rounded-lg"
                                                                            >
                                                                                <source src={file.fileUrl} type="video/mp4" />
                                                                                Your browser does not support the video tag.
                                                                            </video>
                                                                            <p className="absolute bottom-0 right-0 pb-2 pr-4 text-xs" >{new Date(file.uploadDate).toLocaleString().slice(11, -6)} {new Date(file.uploadDate).toLocaleString().slice(18)}</p>
                                                                        </div>
                                                                    ) : (
                                                                        <div onClick={ () => {setFullscreen(file.fileUrl)}} className="bg-black bg-opacity-40 rounded-lg flex gap-4 relative cursor-pointer" >
                                                                            <img
                                                                                src={file.fileUrl}
                                                                                alt={`Uploaded File ${idx + 1}`}
                                                                                className="max-w-[300px] max-h-[300px] object-contain rounded-lg"
                                                                            />
                                                                            <p className="absolute bottom-0 right-0 pb-2 pr-4 text-xs" >{new Date(file.uploadDate).toLocaleString().slice(11, -6)} {new Date(file.uploadDate).toLocaleString().slice(18)}</p>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {msg.text.message && (
                                                <div className="bg-black bg-opacity-40 h-min-9 px-3 py-1 rounded-lg flex gap-4 justify-between" >
                                                    <p className="text-lg font-medium max-w-[500px] break-words" >{msg.text.message}</p>
                                                    <p className="text-xs self-end" >{new Date(msg.text.sentDate).toLocaleString().slice(11, -6)} {new Date(msg.text.sentDate).toLocaleString().slice(19)}</p>
                                                </div>
                                            )}
                                        </div>
                                        <img onClick={ () => {setFullscreen(msg.profile_photo)}} src={msg.profile_photo} alt="profile" className="h-10 w-10 rounded-full bg-black bg-opacity-40 cursor-pointer" />
                                    </div>
                            ))}
                            <div ref={endRef} ></div>
                        </div>
                    }
                    {isClicked &&
                        <div className="w-full py-3 border-t border-t-white bg-stone-600 rounded-br-lg rounded-bl-lg flex items-center" >
                            <label htmlFor="attach" className="mx-12 px-1 text-3xl cursor-pointer" ><GrFormAttachment /></label>
                            <input onChange={handleFileChange} id="attach" type="file" className="hidden" />
                            <textarea onChange={handleText} onKeyDown={handleSendByEnter} value={text} ref={textareaRef} placeholder="Type a message" style={{ maxHeight: "6em", minHeight: "auto" }} className="w-full resize-none bg-stone-600 outline-none overflow-y-auto scrollbar-none pr-28" />
                            <VscSend onClick={handleSend} className="text-3xl mr-6 cursor-pointer" />
                        </div>
                    }
                </div>
            </div>
            {fullscreen && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center">
                    <button onClick={() => setFullscreen(null)} className="text-white text-3xl ml-[1400px]">
                        <RxCross1 />
                    </button>
                    <img src={fullscreen} alt="selected_photo" className="w-[90%] h-[90%] object-contain rounded-lg" />
                </div>
            )}
        </div>
    )
}