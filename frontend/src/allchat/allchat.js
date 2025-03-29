import { useState, useRef, useEffect } from "react"
import Navbar from "../navbar/navbar"
import { GrFormAttachment } from "react-icons/gr"
import { VscSend } from "react-icons/vsc"
import { io } from 'socket.io-client'
import { RxCross1 } from "react-icons/rx"

const socket = io("http://localhost:8000")

export default function Allchat() {

    let [message, setMessage] = useState("")
    let [files, setFiles] = useState([])
    let [fetchedMessage, setFetchedMessage] = useState([])
    let [fullscreen, setFullscreen] = useState(null)
    let textareaRef = useRef(null)
    let endRef = useRef(null)
    let username = window.localStorage.getItem("username")

    let handleInputChange = (e) => {
        setMessage(e.target.value)
    }

    let handleFileChange = (e) => {
        let selectedFiles = e.target.files ? Array.from(e.target.files) : []
        setFiles(selectedFiles)
        if (selectedFiles.length > 0) {
            let fileNames = selectedFiles.map(file => file.name).join(", ");
            setMessage(prev => prev ? `${prev} [${fileNames}]` : `[${fileNames}]`);
        }
    }

    useEffect(() => {
        const textarea = textareaRef.current
        if (textarea) {
            if (message.length === 0) {
                textarea.style.height = "28px"
            } else {
                textarea.style.height = "28px"
                textarea.style.height = `${textarea.scrollHeight}px`
            }
        }
    }, [message])

    useEffect(() => {
        const fetchData = async () => {
            try {
                let response = await fetch(`http://localhost:8000/${username}/allchat`, {
                    method: "GET"
                })
                if (response.ok) {
                    let data = await response.json()
                    setFetchedMessage(data)
                    setTimeout(() => {
                        endRef.current?.scrollIntoView({ behavior: "instant" });
                    }, 100)
                }
            } catch (error) {
                alert("An error occurred, please refresh and try again")
            }
        }
        fetchData()
    }, [username])

    useEffect(() => {
        socket.on("newMessage", (newMessage) => {
            setFetchedMessage((prevMessages) => [...prevMessages, newMessage]);
            setTimeout(() => {
                endRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100)
        })
        return () => socket.off("newMessage")
    }, [])

    async function handleSend() {
        if (message.length === 0 && files.length === 0) {
            return
        }
        let cleanMessage = message.replace(/\[.*?\]/g, "").trim()
        let formData = new FormData()
        files.forEach(file => formData.append("files", file))
        formData.append("message", cleanMessage)
        try {
            let response = await fetch(`http://localhost:8000/${username}/allchat`, {
                method: "POST",
                body: formData
            })
            if (response.ok) {
                setFiles([])
                setMessage("")
                setTimeout(() => {
                    endRef.current?.scrollIntoView({ behavior: "smooth" })
                }, 100)
            }
        }
        catch (error) {
            alert("An error occured, please refresh and try again")
        }
    }

    function handleEnter(e) {
        if (e.key === "Enter") {
            handleSend()
        }
    }

    return (
        <div className="h-full w-full">
            <Navbar />
            <div className="text-white h-[600px] mx-12 my-4 border-2 bg-[#262523] rounded-xl pt-1 flex flex-col">
                <div className="h-full w-full overflow-y-scroll px-4 mb-2 mt-3 scrollbar-thin scrollbar-track-[#262523] scrollbar-thumb-stone-600 flex flex-col">
                    {fetchedMessage.length > 0 && fetchedMessage.map((msg) =>
                    (
                        msg.username !== username ?
                            <div key={msg._id} className="flex mb-4 gap-5" >
                                <img onClick={ () => {setFullscreen(msg.profile_photo)}} src={msg.profile_photo} alt="profile" className="h-10 w-10 rounded-full p-1 bg-black bg-opacity-40 cursor-pointer" />
                                <div className="flex flex-col">
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
                                                                <div className="bg-black bg-opacity-40 rounded-lg flex gap-4 relative" >
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
                                                                <div className="bg-black bg-opacity-40 rounded-lg flex gap-4 relative" >
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
                                <img onClick={ () => {setFullscreen(msg.profile_photo)}} src={msg.profile_photo} alt="profile" className="h-10 w-10 rounded-full p-1 bg-black bg-opacity-40 cursor-pointer" />
                            </div>
                    ))}
                    <div ref={endRef} />
                </div>
                <div className="w-full py-3 border-t border-t-white bg-stone-700 rounded-br-lg rounded-bl-lg flex items-center" >
                    <label htmlFor="attach" className="mx-12 px-1 text-3xl cursor-pointer" ><GrFormAttachment /></label>
                    <input onChange={handleFileChange} id="attach" type="file" className="hidden" />
                    <textarea onChange={handleInputChange} onKeyDown={handleEnter} value={message} ref={textareaRef} placeholder="Type a message" style={{ maxHeight: "6em", minHeight: "auto" }} className="w-full resize-none bg-stone-700 outline-none overflow-y-auto scrollbar-none pr-28" />
                    <VscSend onClick={handleSend} className="text-3xl mr-6 cursor-pointer" />
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