import { useState, useRef, useEffect } from "react"
import Navbar from "../navbar/navbar"
import profile from "../images/background.webp"
import { IoMdSearch } from "react-icons/io"
import { GrFormAttachment } from "react-icons/gr"
import { VscSend } from "react-icons/vsc"
import { FaPlus } from "react-icons/fa6"
import { RxCross2 } from "react-icons/rx"

export default function Groups() {

    let username = window.localStorage.getItem("username")
    let textareaRef = useRef(null)

    let [isAdd, setIsAdd] = useState(false)
    let [membersSearch, setMembersSearch] = useState("")
    let [member, setMember] = useState("")
    let [members, setMembers] = useState([])
    let [groupName, setGroupName] = useState("")
    let [groups, setGroups] = useState([])
    let [groupSearch, setGroupSearch] = useState("")
    let [searchedGroup, setSearchedGroup] = useState([])
    let [selectedGroup, setSelectedGroup] = useState("")
    let [text, setText] = useState("")
    let [files, setFiles] = useState([])
    let [fetchedChat, setFetchedChat] = useState([])

    useEffect(() => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = "28px"
            textarea.style.height = `${textarea.scrollHeight}px`
        }
        async function fetchGroups() {
            let response = await fetch(`http://localhost:8000/${username}/groups`, {
                method: "GET"
            })
            if (response.ok) {
                let fetchedgroups = await response.json()
                setGroups(fetchedgroups.map((fetchedgroup) => fetchedgroup.groupName));
            }
        }
        fetchGroups()
    }, [username, groups, groupSearch])

    useEffect(() => {
        async function fetchPreviousChats() {
            try {
                let response = await fetch(`http://localhost:8000/${username}/groups`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ type: "show", groupName: selectedGroup })
                })
                if (!response.ok) {
                    alert("Error occured to fetch chats")
                    console.log()
                }
                else if (response.ok) {
                    let data = await response.json()
                    setFetchedChat(data)
                }
                else {
                    alert("Internal server error.")
                }
            }
            catch (error) {
                alert("An error occured. Please refresh and try again.")
            }
        }
        fetchPreviousChats()
    }, [selectedGroup, text])

    function handleAdd() {
        setIsAdd(prev => !prev)
    }

    function handleMemberSearch(e) {
        setMembersSearch(e.target.value)
    }

    function handleGroupName(e) {
        setGroupName(e.target.value)
    }

    function handleGroupSearch(e) {
        const searchValue = e.target.value
        setGroupSearch(searchValue)
        if (searchValue.trim() === "") {
            setSearchedGroup([])
        }
        else {
            setSearchedGroup(groups.filter((group) => group.includes(searchValue)))
        }
    }

    function handleSelectGroup(e) {
        setSelectedGroup(e.currentTarget.innerText)
        setGroupSearch("")
        setSearchedGroup([])
    }

    async function handleIsMember() {
        if (!membersSearch.trim()) return
        try {
            let response = await fetch(`http://localhost:8000/${username}/groups`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ type: "member_search", member: membersSearch })
            })
            if (!response.ok) {
                alert("User not found");
            }
            else if (response.ok) {
                let data = await response.json()
                setMember(data.username)
                setMembersSearch("")
            }
            else {
                alert("Internal server error.")
            }
        }
        catch (error) {
            alert("An error occured. Please refresh and try again.")
        }
    }

    function handleIsAdded(e) {
        let name = e.currentTarget.querySelector("div").innerText
        setMembers(prevMembers => [...prevMembers, name])
        setMember("")
    }

    async function handleCreateGroup() {
        if (members.length === 0) return alert("Add atleast one member.")
        if (!groupName) return alert("Add group name.")
        try {
            let response = await fetch(`http://localhost:8000/${username}/groups`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ type: "create_group", groupName, members })
            })
            if (response.ok) {
                setGroupName("")
                setMember("")
                setIsAdd(false)
            }
            else {
                alert("Internal server error.")
            }
        }
        catch (error) {
            alert("An error occured. Please refresh and try again.")
        }
    }

    function handleText(e) {
        setText(e.target.value)
    }

    function handleFiles(e) {
        setFiles(Array.from(e.target.files))
    }

    async function handleChat() {
        if (text.length === 0 && files.length === 0) {
            return
        }
        let formData = new FormData()
        formData.append("type", "chat")
        formData.append("text", text)
        formData.append("selectedGroup", selectedGroup)
        files.forEach(file => {
            formData.append("files", file)
        })
        try {
            let response = await fetch(`http://localhost:8000/${username}/groups`, {
                method: "POST",
                body: formData
            })
            if (response.ok) {
                const newMessage = { text: text, files: files.map(file => ({ fileUrl: URL.createObjectURL(file) })) }
                setFetchedChat(prevMessages => [...prevMessages, newMessage])
                setText("")
                setFiles([])
            }
            else {
                alert("Internal server error.")
            }
        }
        catch (error) {
            alert("An error occured. Please refresh and try again.")
        }
    }

    return (
        <div className="h-full w-full" >
            <Navbar />
            <div className="text-white h-[640px] m-4 border-2 bg-[#262523] rounded-xl flex" >
                <div className="h-full w-2/5 border-r-2" >
                    {!isAdd ?
                        <div>
                            <div className="flex justify-between px-6 py-4" >
                                <div className="text-xl font-semibold">Groups</div>
                                <FaPlus onClick={handleAdd} className="h-9 w-9 p-1 -mt-1 hover:bg-stone-600 rounded-full transition-all duration-300 cursor-pointer" />
                            </div>
                            <div className="px-6">
                                <input onChange={handleGroupSearch} placeholder="Search" value={groupSearch} className="bg-stone-700 opacity-90 h-9 w-full mb-2 rounded-md pl-3" />
                            </div>
                            <div className="h-[530px] w-full pl-6 pr-3 overflow-y-auto scrollbar-thin scrollbar-track-[#262523] scrollbar-thumb-stone-600">
                                {
                                    groups.length > 0 ?
                                        <div>
                                            {searchedGroup.length === 0 ?
                                                <div>
                                                    {groups.map((group, index) =>
                                                        <div onClick={handleSelectGroup} key={index} className="flex cursor-pointer">
                                                            <img src={profile} alt="profile" className="h-12 w-12 rounded-full" />
                                                            <p className="mt-[10px] ml-4 text-lg font-medium" >{group}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                :
                                                <div>
                                                    {searchedGroup.map((group, index) => (
                                                        <div onClick={handleSelectGroup} key={index} className="flex cursor-pointer">
                                                            <img src={profile} alt="profile" className="h-12 w-12 rounded-full" />
                                                            <p className="mt-[10px] ml-4 text-lg font-medium">{group}</p>
                                                        </div>))}
                                                </div>

                                            }
                                        </div>
                                        :
                                        <p>Make new groups</p>
                                }
                            </div>
                        </div>
                        :
                        <div>
                            <div className="flex justify-between px-6 py-4" >
                                <div className="text-xl font-semibold">Add members</div>
                                <RxCross2 onClick={handleAdd} className="text-3xl mr-[2px] cursor-pointer hover:scale-125 transition-all duration-300" />
                            </div>
                            <div className="px-6 flex">
                                <input onChange={handleMemberSearch} value={membersSearch} placeholder="Search for members" className="bg-stone-700 opacity-90 h-9 w-full mb-2 rounded-md pl-3" />
                                <IoMdSearch onClick={handleIsMember} className="h-9 w-10 p-1 ml-2 bg-stone-700 hover:bg-stone-600 rounded-full transition-all duration-300 cursor-pointer" />
                            </div>
                            {member &&
                                <div onClick={handleIsAdded} className="flex justify-between px-8">
                                    <div className="flex" >
                                        <img src={profile} alt="profile" className="h-12 w-12 rounded-full" />
                                        <p className="mt-[10px] ml-4 text-lg font-medium" >{member}</p>
                                    </div>
                                    <button className="cursor-pointer" >Add</button>
                                </div>
                            }
                            <div className="flex px-6" >
                                {members.map((member, index) => (
                                    <div key={index} className="mr-4" >{member}</div>
                                ))}
                            </div>
                            <div className="px-6 mt-32 flex flex-col" >
                                <input onChange={handleGroupName} value={groupName} placeholder="Add group name" className="bg-stone-700 opacity-90 h-9 w-full mb-2 rounded-md pl-3" />
                                <button onClick={handleCreateGroup} className="h-10 w-28 rounded-2xl self-center mt-4 text-xl font-medium bg-stone-700" >Create</button>
                            </div>
                        </div>
                    }
                </div>
                {selectedGroup ?
                    <div className="h-full w-full flex flex-col justify-between">
                        <div className="flex px-6 py-3 border-b-2 border-black cursor-pointer">
                            <img src={profile} alt="profile" className="h-12 w-12 rounded-full" />
                            <p className="mt-[10px] ml-4 text-lg font-medium" >{selectedGroup}</p>
                        </div>
                        <div className="h-full w-full overflow-y-scroll px-4 my-2 scrollbar-thin scrollbar-track-[#262523] scrollbar-thumb-stone-600">
                            {fetchedChat.length > 0 &&
                                <div>
                                    {fetchedChat.map((message, index) => (
                                        <div>
                                            <div key={index} >{message.text}</div>
                                            {message.files.length > 0 &&
                                                <div>
                                                    {message.files.map((file, index) => (
                                                        <div key={index}>
                                                            <img src={file.fileUrl} alt="image" />
                                                        </div>
                                                    ))}
                                                </div>
                                            }
                                        </div>
                                    ))}
                                </div>}
                        </div>
                        <div className="w-full py-3 border-t border-t-white bg-stone-600 rounded-br-lg rounded-bl-lg flex items-center" >
                            <label htmlFor="attach" className="mx-12 px-1 text-3xl cursor-pointer" ><GrFormAttachment /></label>
                            <input onChange={handleFiles} id="attach" type="file" className="hidden" />
                            <textarea value={text} onChange={handleText} ref={textareaRef} placeholder="Type a message" style={{ maxHeight: "6em", minHeight: "auto" }} className="w-full resize-none bg-stone-600 outline-none overflow-y-auto scrollbar-none pr-28" />
                            <VscSend onClick={handleChat} className="text-3xl mr-6 cursor-pointer" />
                        </div>
                    </div>
                    :
                    <div className="h-full w-full" ></div>
                }
            </div>
        </div>
    )
}