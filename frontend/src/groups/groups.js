import { useState, useRef, useEffect } from "react"
import Navbar from "../navbar/navbar"
import { GrFormAttachment } from "react-icons/gr"
import { VscSend } from "react-icons/vsc"
import { FaPlus } from "react-icons/fa6"
import { RxCross1 } from "react-icons/rx"
import { RxCross2 } from "react-icons/rx"
import { io } from 'socket.io-client'
import { IoSettingsOutline } from "react-icons/io5"
import profile from "../images/default_profile.png"
import default_group_photo from "../images/default_group_photo.png"

const socket = io("https://hosttel.onrender.com")

export default function Groups() {

    let username = window.localStorage.getItem("username")
    let textareaRef = useRef(null)
    let endRef = useRef(null)

    let [isAdd, setIsAdd] = useState(false)
    let [allUsers, setAllUsers] = useState([])
    let [membersSearch, setMembersSearch] = useState("")
    let [searchedMember, setSearchedMember] = useState("")
    let [members, setMembers] = useState([])
    let [groupName, setGroupName] = useState("")
    let [groups, setGroups] = useState([])
    let [groupsData, setGroupsData] = useState([])
    let [groupSearch, setGroupSearch] = useState("")
    let [groupPhoto, setGroupPhoto] = useState("")
    let [searchedGroup, setSearchedGroup] = useState([])
    let [selectedGroup, setSelectedGroup] = useState("")
    let [text, setText] = useState("")
    let [files, setFiles] = useState([])
    let [fetchedChat, setFetchedChat] = useState([])
    let [fullscreen, setFullscreen] = useState(null)
    let [settings, setSettings] = useState(false)
    let [groupMembersScreen, setGroupMembersScreen] = useState(false)
    let [changeNameScreen, setChangeNameScreen] = useState(false)
    let [newGroupName, setNewGroupName] = useState("")
    let [changeProfileScreen, setChangeProfileScreen] = useState(false)
    let [newGroupProfile, setNewGroupProfile] = useState("")
    let [addNewMembersScreen, setAddNewMembersScreen] = useState(false)
    let [newMembers, setNewMembers] = useState([])
    let [removeMembersScreen, setRemoveMembersScreen] = useState(false)
    let [removeMembers, setRemoveMembers] = useState([])

    useEffect(() => {
        socket.emit("room", selectedGroup)
    }, [selectedGroup])

    useEffect(() => {
        socket.emit("chatUserRegister", username)
    }, [username])

    useEffect(() => {
        socket.on("freshGroupChatList", ({ messageWithPhoto, groupsWithLastMessage }) => {
            if (messageWithPhoto.groupName === selectedGroup) {
                setFetchedChat((prevMessages) => [...prevMessages, messageWithPhoto])
                setTimeout(() => {
                    endRef.current?.scrollIntoView({ behavior: "smooth" })
                }, 100)
            }
            if (groupsWithLastMessage) {
                setGroupsData((prevGroups) =>
                    prevGroups.map((group) => {
                        const updatedGroup = groupsWithLastMessage.find(g => g.groupName === group.groupName)
                        return updatedGroup ? { ...group, lastMessage: updatedGroup.lastMessage } : group
                    }).sort((a, b) => {
                        let dateA = a.lastMessage?.date ? new Date(a.lastMessage.date) : new Date(0)
                        let dateB = b.lastMessage?.date ? new Date(b.lastMessage.date) : new Date(0)
                        return dateB - dateA
                    })
                )
            }
        })
        return () => socket.off("freshGroupChatList")
    }, [username, selectedGroup])

    useEffect(() => {
        socket.on("newGroupCreated", (group) => {
            setGroups((prevGroups) => [...prevGroups, group.groupName])
            setGroupPhoto(group.group_photo)
            setGroupsData((prevGroups) => [...prevGroups, group])
            setTimeout(() => {
                endRef.current?.scrollIntoView({ behavior: "smooth" })
            }, 100)
        })
        return () => socket.off("newGroupCreated")
    }, [username, groups])

    useEffect(() => {
        socket.on("groupNameChanged", ({ oldGroupName, newGroupName }) => {
            setGroupsData((prevGroups) =>
                prevGroups.map((group) => oldGroupName === group.groupName ? { ...group, groupName: newGroupName } : group
                ).sort((a, b) => {
                    let dateA = a.lastMessage?.date ? new Date(a.lastMessage.date) : new Date(0)
                    let dateB = b.lastMessage?.date ? new Date(b.lastMessage.date) : new Date(0)
                    return dateB - dateA
                })
            )
            setSelectedGroup(newGroupName)
        })
        return () => socket.off("groupNameChanged")
    }, [username])

    useEffect(() => {
        socket.on("groupProfileChanged", ({ newGroupProfile, groupName }) => {
            setGroupsData((prevGroups) =>
                prevGroups.map((group) => groupName === group.groupName ? { ...group, group_photo: newGroupProfile } : group
                ).sort((a, b) => {
                    let dateA = a.lastMessage?.date ? new Date(a.lastMessage.date) : new Date(0)
                    let dateB = b.lastMessage?.date ? new Date(b.lastMessage.date) : new Date(0)
                    return dateB - dateA
                })
            )
            setGroupPhoto(newGroupProfile)
        })
        return () => socket.off("groupProfileChanged")
    }, [username])

    useEffect(() => {
        socket.on("memberRemoved", ({ group }) => {
            setGroupsData(prevGroups => prevGroups.map(g => g.groupName === group.groupName ? { ...g, members: group.members } : g).filter(g => g.members.includes(username)))
            setSelectedGroup(prev => (prev === group.groupName ? "" : prev))
        })
        return () => socket.off("memberRemoved")
    }, [username])

    useEffect(() => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = "28px"
            textarea.style.height = `${textarea.scrollHeight}px`
        }
    }, [username, text, selectedGroup])

    useEffect(() => {
        async function fetchGroups() {
            let response = await fetch(`https://hosttel.onrender.com/${username}/groups`, {
                method: "GET"
            })
            if (response.ok) {
                let { fetchedgroups, allUsers } = await response.json()
                fetchedgroups.sort((a, b) => {
                    let dateA = a.lastMessage?.date ? new Date(a.lastMessage.date) : new Date(0)
                    let dateB = b.lastMessage?.date ? new Date(b.lastMessage.date) : new Date(0)
                    return dateB - dateA
                })
                setGroupsData(fetchedgroups)
                setGroups(fetchedgroups.map((fetchedgroup) => fetchedgroup.groupName))
                setAllUsers(allUsers)
            }
        }
        fetchGroups()
    }, [username])

    useEffect(() => {
        if (!selectedGroup) return
        async function fetchPreviousChats() {
            try {
                let response = await fetch(`https://hosttel.onrender.com/${username}/groups`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ type: "show", groupName: selectedGroup })
                })
                if (!response.ok) {
                    alert("Error occured to fetch chats")
                }
                else if (response.ok) {
                    let data = await response.json()
                    setFetchedChat(data)
                    setTimeout(() => {
                        endRef.current?.scrollIntoView({ behavior: "instant" })
                    }, 100)
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
    }, [username, selectedGroup])

    function handleAdd() {
        setIsAdd(prev => !prev)
        setGroupName("")
        setGroupSearch("")
        setMembersSearch("")
        setMembers([])
    }

    function handleMemberSearch(e) {
        let searchValue = e.target.value
        setMembersSearch(searchValue)
        if (searchValue.trim() === "") {
            setSearchedMember([])
        }
        else {
            setSearchedMember(
                allUsers.filter((user) =>
                    user.username !== username && user.username.toLowerCase().includes(searchValue.toLowerCase())
                )
            )
        }
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
            setSearchedGroup(groupsData.filter((group) => group.groupName.toLowerCase().includes(searchValue.toLowerCase())))
        }
    }

    async function handleGroupNameSearch(groupName) {
        if (groupName.trim() === "") return
        try {
            let response = await fetch(`https://hosttel.onrender.com/${username}/groups`, {
                method: "GET"
            })
            if (response.ok) {
                let fetchedgroups = await response.json()
                if (!fetchedgroups.includes(fetchedgroup => fetchedgroup.groupName === groupName)) {
                    alert("Group doesn't exist.")
                }
                setSelectedGroup(fetchedgroups.includes(fetchedgroup => fetchedgroup.groupName === groupName))
                setGroupSearch("")
                setSearchedGroup([])
            }
        }
        catch (error) {
            alert("An error occured. Please refresh and try again.")
        }
    }

    function handleEnterForGroupNameSearch(e) {
        let groupName = e.target.value
        if (e.key === "Enter") {
            handleGroupNameSearch(groupName)
        }
    }

    function handleSelectGroup(group) {
        setSelectedGroup(group.groupName)
        setGroupSearch("")
        setSearchedGroup([])
        setGroupPhoto(group.group_photo)
    }

    async function handleIsMember() {
        if (!membersSearch.trim()) return
        if (membersSearch === username) {
            alert("You will be added automatically in the group. Search for other members.")
            setMembersSearch("")
            setGroupName("")
            return
        }
        if (members.includes(membersSearch)) {
            alert("Member already added.")
            setMembersSearch("")
            return
        }
        try {
            let response = await fetch(`https://hosttel.onrender.com/${username}/groups`, {
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

    function handleEnterForHandleIsMember(e) {
        if (e.key === "Enter") {
            handleIsMember()
        }
    }

    function handleIsAdded(e) {
        let name = e.currentTarget.querySelector("div").innerText
        if (members.includes(name)) {
            alert("Member already added to the list.")
            setMembersSearch("")
            return
        }
        if (name === username) {
            alert("You will be added automatically in the group. Search for other members.")
            setMembersSearch("")
            setGroupName("")
            return
        }
        setMembers(prevMembers => [...prevMembers, name])
        setMembersSearch("")
    }

    function handleMemberRemove(memberToRemove) {
        setMembers((prev) => prev.filter(member => member !== memberToRemove))
    }

    async function handleCreateGroup() {
        if (members.length < 2) return alert("Add atleast two member.")
        if (members.length === 1) {
            if (members[0] === username) {
                alert("Can't make group with only you as a member. Atleast add two another member.")
                return
            }
        }
        if (!groupName) return alert("Add group name.")
        if (groups.includes(groupName)) return alert("Group with the same name already exists.")
        try {
            let response = await fetch(`https://hosttel.onrender.com/${username}/groups`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ type: "create_group", groupName, members, group_photo: default_group_photo })
            })
            if (response.ok) {
                setGroupName("")
                setIsAdd(false)
                setMembers([])
                setSelectedGroup("")
            }
            else if (response.status === 300){
                alert("Group already exists.")
            }
            else {
                alert("Internal server error.")
            }
        }
        catch (error) {
            alert("An error occured. Please refresh and try again.")
        }
    }

    function handleEnterForCreateGroup(e) {
        if (e.key === "Enter") {
            handleCreateGroup()
        }
    }

    function handleText(e) {
        setText(e.target.value)
    }

    function handleFiles(e) {
        let selectedFiles = e.target.files ? Array.from(e.target.files) : []
        setFiles(selectedFiles)
        if (selectedFiles.length > 0) {
            let fileNames = selectedFiles.map(file => file.name).join(", ")
            setText(prev => prev ? `${prev} [${fileNames}]` : `[${fileNames}]`)
        }
    }

    async function handleChat() {
        if (text.length === 0 && files.length === 0) {
            return
        }
        let cleanMessage = text.replace(/\[.*?\]/g, "").trim()
        let formData = new FormData()
        formData.append("type", "chat")
        formData.append("message", cleanMessage)
        formData.append("selectedGroup", selectedGroup)
        files.forEach(file => {
            formData.append("files", file)
        })
        try {
            let response = await fetch(`https://hosttel.onrender.com/${username}/groups`, {
                method: "POST",
                body: formData
            })
            if (response.ok) {
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

    function handleEnterForChat(e) {
        if (e.key === "Enter") {
            handleChat()
        }
    }

    function handleNewNameChange(e) {
        let newName = e.target.value
        setNewGroupName(newName)
    }

    async function handleGroupNameChange() {
        if (groupsData.some((group) => group.groupName === newGroupName)) return alert("Group with same name already exists.")

        if (newGroupName.trim() === "") return
        try {
            let response = await fetch(`https://hosttel.onrender.com/${username}/groups`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ type: "change_name", newGroupName, selectedGroup })
            })
            if (response.ok) {
                setSelectedGroup("")
                alert("Group's name changed succesfully !")
                setChangeNameScreen(prev => !prev)
            }
        }
        catch (error) {
            alert("An error occured, please refresh and try again")
        }
    }

    function handleEnterForGroupNameChange(e) {
        if (e.key === "Enter") {
            handleGroupNameChange()
        }
    }

    function handleNewProfileChange(e) {
        let selectedFiles = e.target.files ? Array.from(e.target.files) : []
        setNewGroupProfile(selectedFiles)
    }

    async function handleGroupProfileChange() {
        if (newGroupProfile.length === 0) {
            alert("No file selected.")
            return
        }
        let formData = new FormData()
        formData.append("type", "change_profile")
        formData.append("selectedGroup", selectedGroup)
        formData.append("newGroupProfile", newGroupProfile[0])
        try {
            let response = await fetch(`https://hosttel.onrender.com/${username}/groups`, {
                method: "POST",
                body: formData
            })
            if (response.ok) {
                alert("Group profile updated successfully.")
                setNewGroupProfile([])
            }
        }
        catch (error) {
            alert("An error occured, please refresh and try again")
        }
    }

    function handleNewMembers(e) {
        let searchValue = e.target.value
        setNewMembers(searchValue)
        setMembersSearch(searchValue)
        if (searchValue.trim() === "") {
            setSearchedMember([])
        }
        else {
            setSearchedMember(
                allUsers.filter((user) =>
                    user.username !== username && user.username.toLowerCase().includes(searchValue.toLowerCase())
                )
            )
        }
    }

    async function handleAddNewGroupMembers() {
        if (members.length === 0) return alert("Add atleast one member.")
        if (members.some(member => groupsData.find(group => group.groupName === selectedGroup).members.includes(member))) return alert("Member is already in the group.")
        try {
            let response = await fetch(`https://hosttel.onrender.com/${username}/groups`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ type: "add_members", members, selectedGroup })
            })
            if (response.ok) {
                alert("Member(s) added successfully.")
            }
        }
        catch (error) {
            alert("An error occured, please refresh and try again")
        }
    }

    function handleRemoveMembers(e) {
        let searchValue = e.target.value
        setRemoveMembers(searchValue)
        setMembersSearch(searchValue)
        if (searchValue.trim() === "") {
            setSearchedMember([])
        }
        else {
            setSearchedMember(groupsData.filter((group) => group.groupName === selectedGroup).flatMap(group => group.members.filter(member => member.toLowerCase().includes(searchValue.toLowerCase()))))
        }
    }

    async function handleRemoveGroupMembers() {
        if (members.length === 0) return alert("Select atleast one member.")
        try {
            let response = await fetch(`https://hosttel.onrender.com/${username}/groups`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ type: "remove_members", members, selectedGroup })
            })
            if (response.ok) {
                alert("Member(s) removed successfully.")
                setRemoveMembersScreen(false)
            }
        }
        catch (error) {
            alert("An error occured, please refresh and try again")
        }
    }

    async function handleLeaveGroup() {
        let confirmLeave = window.confirm("Confirm leaving group ?")
        if (!confirmLeave) return
        try {
            let response = await fetch(`https://hosttel.onrender.com/${username}/groups`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ type: "leave_group", username, selectedGroup })
            })
        }
        catch (error) {
            alert("An error occured, please refresh and try again")
        }
    }


    return (
        <div className="h-full w-full" >
            <Navbar />
            <div className="text-white h-[600px] m-4 border-2 bg-[#262523] rounded-xl flex" >
                <div className="h-full w-2/5 border-r-2" >
                    {!isAdd ?
                        <div>
                            <div className="flex justify-between px-4 py-4" >
                                <div className="text-xl font-semibold">Groups</div>
                                <FaPlus onClick={handleAdd} className="h-9 w-9 p-1 -mt-1 hover:bg-stone-600 rounded-full transition-all duration-300 cursor-pointer" />
                            </div>
                            <div className="px-4 flex">
                                <input onChange={handleGroupSearch} onKeyDown={handleEnterForGroupNameSearch} placeholder="Search" value={groupSearch} className="bg-stone-700 opacity-90 h-9 w-full mb-2 rounded-md pl-3" />
                            </div>
                            <div className="h-[475px] w-full px-4 overflow-y-auto scrollbar-thin scrollbar-track-[#262523] scrollbar-thumb-stone-600">
                                {
                                    groupsData.length > 0 ?
                                        <div>
                                            {searchedGroup.length === 0 ?
                                                <div>
                                                    {groupsData.map((group, index) =>
                                                        <div onClick={() => handleSelectGroup(group)} key={index} className={`flex justify-between cursor-pointer mt-2 px-3 py-2 rounded-lg ${selectedGroup === group.groupName ? "bg-stone-700" : "hover:bg-stone-700 active:bg-stone-600"}`}>
                                                            <div className="flex" >
                                                                <img onClick={() => { setFullscreen(group.group_photo) }} src={group.group_photo} alt="profile" className="h-12 w-12 rounded-full bg-black" />
                                                                <p className="mt-[10px] ml-4 text-lg font-medium" >{group.groupName}</p>
                                                            </div>
                                                            <p className="mt-3" >{group.lastMessage?.date.slice(11, 16)}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                :
                                                <div>
                                                    {searchedGroup.map((group, index) =>
                                                        <div onClick={() => handleSelectGroup(group)} key={index} className="flex cursor-pointer mt-2 px-3 py-2 rounded-lg hover:bg-stone-700 active:bg-stone-600">
                                                            <img src={group.group_photo} alt="profile" className="h-12 w-12 rounded-full" />
                                                            <p className="mt-[10px] ml-4 text-lg font-medium">{group.groupName}</p>
                                                        </div>)}
                                                </div>
                                            }
                                        </div>
                                        :
                                        <p className="text-2xl font-bold m-[90px]" >Make new groups</p>
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
                                <input onChange={handleMemberSearch} onKeyDown={handleEnterForHandleIsMember} value={membersSearch} placeholder="Search for members" className="bg-stone-700 opacity-90 h-9 w-full mb-2 rounded-md pl-3" />                            </div>
                            <div className="flex px-6 flex-wrap max-h-28 overflow-y-auto" >
                                {members.map((member, index) => (
                                    <div key={index} className="mr-4 mt-6 bg-black bg-opacity-60 px-4 py-1 rounded-full flex">
                                        <div>{member}</div>
                                        <RxCross2 onClick={() => handleMemberRemove(member)} className="text-xl mt-[3px] ml-4 cursor-pointer" />
                                    </div>
                                ))}
                            </div>
                            <div className="max-h-56 overflow-y-auto scrollbar-thin scrollbar-track-[#262523] scrollbar-thumb-stone-600" >
                                {membersSearch ?
                                    <div>
                                        {searchedMember.map((member, index) =>
                                            <div onClick={handleIsAdded} key={index} className="flex justify-between px-8 mt-6 cursor-pointer">
                                                <div className="flex" >
                                                    <img src={member.profile_photo} alt="profile" className="h-12 w-12 rounded-full bg-black" />
                                                    <p className="mt-[10px] ml-4 text-lg font-medium" >{member.username}</p>
                                                </div>
                                                <button>Add</button>
                                            </div>
                                        )}
                                    </div>
                                    :
                                    <div>
                                        {allUsers.filter(user => user.username !== username).map((user, index) =>
                                            <div onClick={handleIsAdded} key={index} className="flex justify-between px-8 mt-6 cursor-pointer" >
                                                <div className="flex">
                                                    <img src={user.profile_photo} alt="profile" className="h-12 w-12 rounded-full bg-black" />
                                                    <p className="mt-[10px] ml-4 text-lg font-medium">{user.username}</p>
                                                </div>
                                                <button>Add</button>
                                            </div>
                                        )}
                                    </div>
                                }
                            </div>
                            <div className="px-6 mt-8 flex flex-col" >
                                <input onChange={handleGroupName} onKeyDown={handleEnterForCreateGroup} value={groupName} placeholder="Add group name" className="bg-stone-700 opacity-90 h-9 w-full mb-2 rounded-md pl-3" />
                                <button onClick={handleCreateGroup} className="h-10 w-28 rounded-2xl self-center mt-4 text-xl font-medium bg-stone-700" >Create</button>
                            </div>
                        </div>
                    }
                </div>
                {selectedGroup ?
                    <div className="h-full w-full flex flex-col justify-between">
                        <div className="flex justify-between w-full px-6 py-3 border-b-2 border-black cursor-pointer relative">
                            <div className="flex" >
                                <img onClick={() => { setFullscreen(groupPhoto) }} src={groupPhoto} alt="profile" className="h-12 w-12 rounded-full bg-black" />
                                <p className="mt-[10px] ml-4 text-lg font-medium" >{selectedGroup}</p>
                            </div>
                            <IoSettingsOutline onClick={() => setSettings(prev => prev = !prev)} className="text-3xl mt-2 active:-rotate-45 transition-all duration-100" />
                            {settings &&
                                <div className="h-[335px] w-60 absolute z-10 p-3 right-6 top-20 space-y-1 rounded-xl bg-stone-900 flex flex-col border-2 border-black" >
                                    <button onClick={() => { setGroupMembersScreen((prev) => prev = !prev); setSettings(false); if (changeNameScreen) { setChangeNameScreen(false) }; if (changeProfileScreen) { setChangeProfileScreen(false) }; if (addNewMembersScreen) { setAddNewMembersScreen(false) }; if (removeMembersScreen) { setRemoveMembersScreen(false) } }} className="font-semibold w-full hover:bg-black hover:bg-opacity-80 hover:scale-105 transition-all duration-200 p-3 rounded-lg" >See Group Members</button>
                                    <button onClick={() => { setChangeNameScreen((prev) => prev = !prev); setSettings(false); if (groupMembersScreen) { setGroupMembersScreen(false) }; if (changeProfileScreen) { setChangeProfileScreen(false) }; if (addNewMembersScreen) { setAddNewMembersScreen(false) }; if (removeMembersScreen) { setRemoveMembersScreen(false) } }} className="font-semibold w-full hover:bg-black hover:bg-opacity-80 hover:scale-105 transition-all duration-200 p-3 rounded-lg" >Change Group Name</button>
                                    <button onClick={() => { setChangeProfileScreen((prev) => prev = !prev); setSettings(false); if (groupMembersScreen) { setGroupMembersScreen(false) }; if (changeNameScreen) { setChangeNameScreen(false) }; if (addNewMembersScreen) { setAddNewMembersScreen(false) }; if (removeMembersScreen) { setRemoveMembersScreen(false) } }} className="font-semibold w-full hover:bg-black hover:bg-opacity-80 hover:scale-105 transition-all duration-200 p-3 rounded-lg" >Change Profile Photo</button>
                                    <button onClick={() => { setAddNewMembersScreen((prev) => prev = !prev); setSettings(false); if (groupMembersScreen) { setGroupMembersScreen(false) }; if (changeNameScreen) { setChangeNameScreen(false) }; if (changeProfileScreen) { setChangeProfileScreen(false) }; if (removeMembersScreen) { setRemoveMembersScreen(false) }; setRemoveMembers(""); setMembers([]); setMembersSearch("") }} className="font-semibold w-full hover:bg-black hover:bg-opacity-80 hover:scale-105 transition-all duration-200 p-3 rounded-lg" >Add Members</button>
                                    <button onClick={() => { setRemoveMembersScreen((prev) => prev = !prev); setSettings(false); if (groupMembersScreen) { setGroupMembersScreen(false) }; if (changeNameScreen) { setChangeNameScreen(false) }; if (changeProfileScreen) { setChangeProfileScreen(false) }; if (addNewMembersScreen) { setAddNewMembersScreen(false) }; setNewMembers(""); setMembers([]); setMembersSearch("") }} className="font-semibold w-full hover:bg-black hover:bg-opacity-80 hover:scale-105 transition-all duration-200 p-3 rounded-lg" >Remove Members</button>
                                    <button onClick={handleLeaveGroup} className="font-semibold w-full hover:bg-black hover:bg-opacity-80 hover:scale-105 transition-all duration-200 p-3 rounded-lg" >Leave Group</button>
                                </div>
                            }
                        </div>
                        <div className="h-full w-full overflow-y-scroll px-4 my-2 scrollbar-thin scrollbar-track-[#262523] scrollbar-thumb-stone-600 flex flex-col">
                            {groupMembersScreen &&
                                <div className="flex justify-center items-center h-full w-full" >
                                    <div className="h-80 w-72 flex flex-col rounded-xl bg-stone-900 p-4 text-lg" >
                                        <div className="flex justify-between" >
                                            <p className="text-xl font-semibold" >Group Members</p>
                                            <RxCross2 onClick={() => { setGroupMembersScreen(prev => !prev); setTimeout(() => { endRef.current?.scrollIntoView({ behavior: "instant" }) }, 100) }} className="text-2xl mt-1 cursor-pointer" />
                                        </div>
                                        <div className="h-68 overflow-y-auto scrollbar-thin scrollbar-track-[#262523] scrollbar-thumb-stone-600" >
                                            {groupsData.map(group =>
                                                group.groupName === selectedGroup && group.members.map((member, index) => (
                                                    <div onClick={handleIsAdded} key={index} className="flex mt-6 cursor-pointer" >
                                                        <img src={allUsers.find(user => user.username === member)?.profile_photo} alt="profile" className="h-10 w-10 rounded-full bg-black" />
                                                        <p className="mt-[5px] ml-4 text-lg font-medium">{member}</p>
                                                    </div>
                                                )))}
                                        </div>
                                    </div>
                                </div>
                            }
                            {changeNameScreen &&
                                <div className="flex justify-center items-center h-full w-full" >
                                    <div className="h-80 w-72 flex flex-col rounded-xl bg-stone-900 p-4 text-lg" >
                                        <RxCross2 onClick={() => { setChangeNameScreen(prev => !prev); setTimeout(() => { endRef.current?.scrollIntoView({ behavior: "instant" }) }, 100) }} className="text-2xl self-end cursor-pointer" />
                                        <p>Old Name : {selectedGroup}</p>
                                        <p className="mt-6" >New Name : </p>
                                        <input onChange={handleNewNameChange} onKeyDown={handleEnterForGroupNameChange} className="h-10 w-full rounded mt-4 text-black font-medium px-2 outline-none" />
                                        <button onClick={handleGroupNameChange} className="h-10 w-2/3 mx-10 mt-16 bg-blue-500 hover:bg-blue-600 transition-all rounded-md" >Confirm new name</button>
                                    </div>
                                </div>
                            }
                            {changeProfileScreen &&
                                <div className="flex justify-center items-center h-full w-full" >
                                    <div className="h-80 w-72 flex flex-col rounded-xl bg-stone-900 p-4 text-lg" >
                                        <RxCross2 onClick={() => { setChangeProfileScreen(prev => !prev); setTimeout(() => { endRef.current?.scrollIntoView({ behavior: "instant" }) }, 100) }} className="text-2xl self-end cursor-pointer" />
                                        <p className="mt-6 mx-[26px]" >Select new group profile</p>
                                        <label htmlFor="upload" className="cursor-pointer h-10 w-2/3 text-lg text-center bg-blue-500 text-white rounded-md mx-10 mt-10 py-[6px] hover:bg-blue-600 transition-all" >Choose Image</label>
                                        <input onChange={handleNewProfileChange} id="upload" type="file" className="hidden" />
                                        <button onClick={handleGroupProfileChange} className="h-10 w-2/3 mx-10 mt-10 bg-blue-500 hover:bg-blue-600 transition-all rounded-md" >Confirm new Profile</button>
                                    </div>
                                </div>
                            }
                            {addNewMembersScreen &&
                                <div className="flex justify-center items-center h-full w-full" >
                                    <div className="h-[430px] w-96 flex flex-col rounded-xl bg-stone-900 p-4 text-lg" >
                                        <RxCross2 onClick={() => { setAddNewMembersScreen(prev => !prev); setNewMembers(""); setMembers([]); setMembersSearch(""); setTimeout(() => { endRef.current?.scrollIntoView({ behavior: "instant" }) }, 100) }} className="text-2xl self-end cursor-pointer" />
                                        <p className="mb-3" >Search members to add</p>
                                        <input onChange={handleNewMembers} value={newMembers} placeholder="Search for members" className="h-9 px-2 rounded text-base bg-stone-700" />
                                        <div className="flex px-4 my-4 flex-wrap max-h-40 overflow-y-auto scrollbar-thin scrollbar-track-[#262523] scrollbar-thumb-stone-600" >
                                            {members.map((member, index) => (
                                                <div key={index} className="mr-2 my-2 text-sm bg-black bg-opacity-60 px-4 py-1 rounded-full flex">
                                                    <div>{member}</div>
                                                    <RxCross2 onClick={() => handleMemberRemove(member)} className="text-xl mt-[3px] ml-4 cursor-pointer" />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-track-[#262523] scrollbar-thumb-stone-600" >
                                            {membersSearch ?
                                                <div>
                                                    {searchedMember.map((member, index) =>
                                                        <div onClick={handleIsAdded} key={index} className="flex justify-between px-4 mt-4 cursor-pointer">
                                                            <div className="flex" >
                                                                <img src={member.profile_photo} alt="profile" className="h-12 w-12 rounded-full bg-black" />
                                                                <p className="mt-[10px] ml-4 text-lg font-medium" >{member.username}</p>
                                                            </div>
                                                            <button>Add</button>
                                                        </div>
                                                    )}
                                                </div>
                                                :
                                                <div>
                                                    {allUsers.filter(user => user.username !== username).map((user, index) =>
                                                        <div onClick={handleIsAdded} key={index} className="flex justify-between px-4 mt-4 cursor-pointer" >
                                                            <div className="flex">
                                                                <img src={user.profile_photo} alt="profile" className="h-12 w-12 rounded-full bg-black" />
                                                                <p className="mt-[10px] ml-4 text-lg font-medium">{user.username}</p>
                                                            </div>
                                                            <button>Add</button>
                                                        </div>
                                                    )}
                                                </div>
                                            }
                                        </div>
                                        <button onClick={handleAddNewGroupMembers} className="h-10 w-3/5 mx-[70px] mt-10 bg-blue-500 hover:bg-blue-600 transition-all rounded-md" >Add</button>
                                    </div>
                                </div>
                            }
                            {removeMembersScreen &&
                                <div className="flex justify-center items-center h-full w-full" >
                                    <div className="h-[430px] w-96 flex flex-col rounded-xl bg-stone-900 p-4 text-lg" >
                                        <RxCross2 onClick={() => { setRemoveMembersScreen(prev => !prev); setRemoveMembers(""); setMembers([]); setMembersSearch(""); setTimeout(() => { endRef.current?.scrollIntoView({ behavior: "instant" }) }, 100) }} className="text-2xl self-end cursor-pointer" />
                                        <p className="mb-3" >Search members to remove</p>
                                        <input onChange={handleRemoveMembers} value={removeMembers} placeholder="Search for members" className="h-9 px-2 rounded text-base bg-stone-700" />
                                        <div className="flex px-4 my-4 flex-wrap max-h-40 overflow-y-auto scrollbar-thin scrollbar-track-[#262523] scrollbar-thumb-stone-600" >
                                            {members.map((member, index) => (
                                                <div key={index} className="mr-2 my-2 text-sm bg-black bg-opacity-60 px-4 py-1 rounded-full flex">
                                                    <div>{member}</div>
                                                    <RxCross2 onClick={() => handleMemberRemove(member)} className="text-xl mt-[3px] ml-4 cursor-pointer" />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-track-[#262523] scrollbar-thumb-stone-600" >
                                            {membersSearch ?
                                                <div>
                                                    {searchedMember.map((member, index) =>
                                                        <div onClick={handleIsAdded} key={index} className="flex justify-between px-4 mt-4 cursor-pointer">
                                                            <div className="flex" >
                                                                <img src={allUsers.find(user => user.username === member)?.profile_photo} alt="profile" className="h-12 w-12 rounded-full bg-black" />
                                                                <p className="mt-[10px] ml-4 text-lg font-medium" >{member}</p>
                                                            </div>
                                                            <button>Remove</button>
                                                        </div>
                                                    )}
                                                </div>
                                                :
                                                <div>
                                                    {groupsData.filter(group => group.groupName === selectedGroup).map(group =>
                                                        group.members.filter(member => member !== username).map((member, index) => (
                                                            <div onClick={handleIsAdded} key={index} className="flex justify-between px-4 mt-4 cursor-pointer" >
                                                                <div className="flex" >
                                                                    <img src={allUsers.find(user => user.username === member)?.profile_photo} alt="profile" className="h-12 w-12 rounded-full bg-black" />
                                                                    <p className="mt-[10px] ml-4 text-lg font-medium">{member}</p>
                                                                </div>
                                                                <button>Remove</button>
                                                            </div>
                                                        )))}
                                                </div>
                                            }
                                        </div>
                                        <button onClick={handleRemoveGroupMembers} className="h-10 w-3/5 mx-[70px] mt-10 bg-blue-500 hover:bg-blue-600 transition-all rounded-md" >Remove</button>
                                    </div>
                                </div>
                            }
                            {!groupMembersScreen && !changeNameScreen && !changeProfileScreen && !addNewMembersScreen && !removeMembersScreen &&
                                fetchedChat.length > 0 && fetchedChat.map((msg) => (
                                    msg.from !== username ?
                                        <div key={msg._id} className="flex mb-4 gap-5" >
                                            <img onClick={() => { setFullscreen(msg.profile_photo) }} src={msg.profile_photo || profile} alt="profile" className="h-10 w-10 rounded-full bg-black bg-opacity-40 cursor-pointer" />
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
                                                                            <div onClick={() => { setFullscreen(file.fileUrl) }} className="bg-black bg-opacity-40 rounded-lg flex gap-4 relative cursor-pointer" >
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
                                                                            <div onClick={() => { setFullscreen(file.fileUrl) }} className="bg-black bg-opacity-40 rounded-lg flex gap-4 relative cursor-pointer" >
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
                                            <img onClick={() => { setFullscreen(msg.profile_photo) }} src={msg.profile_photo} alt="profile" className="h-10 w-10 rounded-full bg-black bg-opacity-40 cursor-pointer" />
                                        </div>
                                ))}
                            <div ref={endRef} ></div>
                        </div>
                        <div className="w-full py-3 border-t border-t-white bg-stone-600 rounded-br-lg rounded-bl-lg flex items-center" >
                            <label htmlFor="attach" className="mx-12 px-1 text-3xl cursor-pointer" ><GrFormAttachment /></label>
                            <input onChange={handleFiles} disabled={fullscreen || groupMembersScreen || changeNameScreen || changeProfileScreen || addNewMembersScreen || removeMembersScreen} id="attach" type="file" className="hidden" />
                            <textarea value={text} onChange={fullscreen || groupMembersScreen || changeNameScreen || changeProfileScreen || addNewMembersScreen || removeMembersScreen ? null : handleText} onKeyDown={fullscreen || groupMembersScreen || changeNameScreen || changeProfileScreen || addNewMembersScreen || removeMembersScreen ? null : handleEnterForChat} disabled={fullscreen || groupMembersScreen || changeNameScreen || changeProfileScreen || addNewMembersScreen || removeMembersScreen} ref={textareaRef} placeholder="Type a message" style={{ maxHeight: "6em", minHeight: "auto" }} className="w-full resize-none bg-stone-600 outline-none overflow-y-auto scrollbar-none pr-28 disabled:cursor-not-allowed" />
                            <VscSend onClick={fullscreen || groupMembersScreen || changeNameScreen || changeProfileScreen || addNewMembersScreen || removeMembersScreen ? null : handleChat} className={`text-3xl mr-6 ${fullscreen || groupMembersScreen || changeNameScreen || changeProfileScreen || addNewMembersScreen || removeMembersScreen ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`} />
                        </div>
                    </div>
                    :
                    <div className="h-full w-full" ></div>
                }
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