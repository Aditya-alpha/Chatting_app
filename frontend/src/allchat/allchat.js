import { useState, useRef, useEffect } from "react"
import Navbar from "../navbar/navbar"
import profile from "../images/background.webp"
import { GrFormAttachment } from "react-icons/gr"
import { VscSend } from "react-icons/vsc"

export default function Allchat() {

    let [message, setMessage] = useState("")
    let [files, setFiles] = useState([])
    let [fetchedMessage, setFetchedMessage] = useState([])
    let [fetchedFiles, setFetchedFiles] = useState([])
    let textareaRef = useRef(null)
    let username = window.localStorage.getItem("username")

    let handleInputChange = (e) => {
        setMessage(e.target.value)
    }

    let handleFileChange = (e) => {
        setFiles(e.target.files ? Array.from(e.target.files) : [])
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
                    const files = data.map(item => item.files).flat()
                    setFetchedFiles(files)
                }
            } catch (error) {
                alert("An error occurred, please refresh and try again")
            }
        }
        fetchData()
    }, [username])

    async function handleSend() {
        if (message.length === 0 && files.length === 0) {
            return
        }
        let formData = new FormData()
        files.forEach(file => formData.append("files", file))
        formData.append("message", message)
        try {
            let response = await fetch(`http://localhost:8000/${username}/allchat`, {
                method: "POST",
                body: formData
            })
            if (response.ok) {
                const newMessage = { text: message, files: files.map(file => ({ fileUrl: URL.createObjectURL(file) })) }
                setFetchedMessage(prevMessages => [...prevMessages, newMessage])
                setFetchedFiles(prevFiles => [...prevFiles, ...files.map(file => ({ fileUrl: URL.createObjectURL(file) }))])
                setFiles([])
                setMessage("")
            }
        }
        catch (error) {
            alert("An error occured, please refresh and try again")
        }
    }

    return (
        <div className="h-full w-full">
            <Navbar />
            <div className="text-white h-[640px] mx-12 m-4 border-2 bg-[#262523] rounded-xl pt-1 flex flex-col">
                <div className="h-full w-full overflow-y-scroll px-4 my-2 scrollbar-thin scrollbar-track-[#262523] scrollbar-thumb-stone-600">
                    {fetchedMessage.length > 0 && fetchedMessage.map((msg) => (
                        <div key={msg._id} className="flex" >
                            <img src={profile} alt="profile" className="h-12 w-12 rounded-full" />
                            <p>{msg.text}</p>
                            {msg.files.length > 0 && (
                                <div>
                                    {msg.files.map((file, idx) => (
                                        <div key={idx}>
                                            {file.fileUrl && (
                                                <>
                                                    {file.fileUrl.endsWith(".mp4") ||
                                                        file.fileUrl.endsWith(".webm") ||
                                                        file.fileUrl.endsWith(".ogg") ? (
                                                        <video
                                                            controls
                                                            className="max-w-[300px] max-h-[300px] object-contain"
                                                        >
                                                            <source src={file.fileUrl} type="video/mp4" />
                                                            Your browser does not support the video tag.
                                                        </video>
                                                    ) : (
                                                        <img
                                                            src={file.fileUrl}
                                                            alt={`Uploaded File ${idx + 1}`}
                                                            className="max-w-[300px] max-h-[300px] object-contain"
                                                        />
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="w-full py-3 border-t border-t-white bg-stone-600 rounded-br-lg rounded-bl-lg flex items-center" >
                    <label htmlFor="attach" className="mx-12 px-1 text-3xl cursor-pointer" ><GrFormAttachment /></label>
                    <input onChange={handleFileChange} id="attach" type="file" className="hidden" />
                    <textarea onChange={handleInputChange} value={message} ref={textareaRef} placeholder="Type a message" style={{ maxHeight: "6em", minHeight: "auto" }} className="w-full resize-none bg-stone-600 outline-none overflow-y-auto scrollbar-none pr-28" />
                    <VscSend onClick={handleSend} className="text-3xl mr-6 cursor-pointer" />
                </div>
            </div>
        </div>
    )
}