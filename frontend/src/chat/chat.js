import { useState, useRef, useEffect } from "react"
import profile from "../images/background.webp"
import Navbar from "../navbar/navbar"
import { IoMdSearch } from "react-icons/io"
import { GrFormAttachment } from "react-icons/gr"
import { VscSend } from "react-icons/vsc"

export default function Chat() {
    let username = window.localStorage.getItem("username")
    let textareaRef = useRef(null)
    let [to, setTo] = useState("")
    let [search, setSearch] = useState("")
    let [isClicked, setIsClicked] = useState(false)
    let [text, setText] = useState("")
    let [files, setFiles] = useState([])
    let [fetchedMessage, setFetchedMessage] = useState([])
    let [fetchedFiles, setFetchedFiles] = useState([])
    let [allChats, setAllChats] = useState([])

    useEffect(() => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = "28px"
            textarea.style.height = `${textarea.scrollHeight}px`
        }
        const fetchData = async () => {
            try {
                let response = await fetch(`http://localhost:8000/${username}/chat`, {
                    method: "GET"
                })
                if (response.ok) {
                    let data = await response.json()
                    const uniqueChats = data.reduce((acc, chat) => {
                        if (!acc.some(existingChat => existingChat.to === chat.to)) {
                            acc.push(chat)
                        }
                        return acc
                    }, [])
                    setAllChats(uniqueChats)
                }
            }
            catch (error) {
                alert("An error occurred, please refresh and try again")
            }
        }
        fetchData()
    }, [text, isClicked])

    useEffect(() => {
        if (!to) return
        let fetchData = async () => {
            let type = "show"
            try {
                let response = await fetch(`http://localhost:8000/${username}/chat`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ type, to })
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
    }, [to])

    function handleSearch(e) {
        setSearch(e.target.value)
    }

    function handleCheck(chatTo) {
        setIsClicked(true)
        setTo(chatTo)

        const fetchPreviousMessages = async () => {
            let type = "show"
            try {
                let response = await fetch(`http://localhost:8000/${username}/chat`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ type, to: chatTo })
                });

                if (response.ok) {
                    let data = await response.json();
                    setFetchedMessage(data)
                    const files = data.map(item => item.files).flat()
                    setFetchedFiles(files)
                }
            } catch (error) {
                alert("An error occurred, please refresh and try again")
            }
        };

        fetchPreviousMessages();
    }


    function handleText(e) {
        setText(e.target.value)
    }

    function handleFileChange(e) {
        setFiles(e.target.files ? Array.from(e.target.files) : [])
    }

    async function handleFind() {
        let type = "user"
        let response = await fetch(`http://localhost:8000/${username}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ type, search })
        })
        if (response.ok) {
            let person = await response.json()
            if (person.length > 0) {
                setTo(person[0].username)
                setIsClicked(true)
            }
            else {
                alert("User not found")
            }
            setSearch("")
        }
    }

    async function handleSend() {
        if (text.length === 0 && files.length === 0) {
            return
        }
        let formData = new FormData()
        formData.append("type", "message")
        formData.append("to", to);
        formData.append("text", text);
        files.forEach(file => {
            formData.append("files", file)
        })
        let response = await fetch(`http://localhost:8000/${username}/chat`, {
            method: "POST",
            body: formData
        })
        if (response.ok) {
            const newMessage = { text: text, files: files.map(file => ({ fileUrl: URL.createObjectURL(file) })) }
            setFetchedMessage(prevMessages => [...prevMessages, newMessage])
            setFetchedFiles(prevFiles => [...prevFiles, ...files.map(file => ({ fileUrl: URL.createObjectURL(file) }))])
            setText("")
            setFiles([])
        }
    }

    return (
        <div>
            <Navbar />
            <div className="text-white h-[640px] m-4 border-2 bg-[#262523] rounded-xl flex">
                <div className="h-full w-2/5 border-r-2">
                    <div className="text-xl font-semibold px-6 py-4">Chats</div>
                    <div className="px-6 flex">
                        <input onChange={handleSearch} value={search} placeholder="Search" className="bg-stone-700 opacity-90 h-9 w-full mb-2 rounded-md pl-3" />
                        <IoMdSearch onClick={handleFind} className="h-9 w-10 p-1 ml-2 bg-stone-700 hover:bg-stone-600 rounded-full transition-all duration-300 cursor-pointer" />
                    </div>
                    <div className="h-[530px] w-full pl-6 pr-3 overflow-y-auto scrollbar-thin scrollbar-track-[#262523] scrollbar-thumb-stone-600">
                        <div>
                            {allChats.map((chat) => (
                                <div onClick={() => handleCheck(chat.to)} key={chat.id} className={`flex justify-between mt-2 px-3 py-2 rounded-lg cursor-pointer 
                                        ${to === chat.to ? "bg-stone-700" : "hover:bg-stone-700 active:bg-stone-600"}`} >
                                    <div className="flex">
                                        <img src={profile} alt="profile" className="h-12 w-12 rounded-full" />
                                        <p className="mt-[10px] ml-4 text-lg font-medium" >{chat.to}</p>
                                    </div>
                                    <p className="mt-3" >{chat.date.slice(11, 16)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="h-full w-full flex flex-col justify-between">
                    {isClicked &&
                        <div className="flex px-6 py-3 border-b-2 border-black cursor-pointer">
                            <img src={profile} alt="profile" className="h-12 w-12 rounded-full" />
                            <p className="mt-[10px] ml-4 text-lg font-medium" >{to}</p>
                        </div>
                    }
                    {isClicked &&
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
                    }
                    {isClicked &&
                        <div className="w-full py-3 border-t border-t-white bg-stone-600 rounded-br-lg rounded-bl-lg flex items-center" >
                            <label htmlFor="attach" className="mx-12 px-1 text-3xl cursor-pointer" ><GrFormAttachment /></label>
                            <input onChange={handleFileChange} id="attach" type="file" className="hidden" />
                            <textarea onChange={handleText} value={text} ref={textareaRef} placeholder="Type a message" style={{ maxHeight: "6em", minHeight: "auto" }} className="w-full resize-none bg-stone-600 outline-none overflow-y-auto scrollbar-none pr-28" />
                            <VscSend onClick={handleSend} className="text-3xl mr-6 cursor-pointer" />
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}