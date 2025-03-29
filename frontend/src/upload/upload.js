import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from "../navbar/navbar"

export default function Upload() {

    let navigate = useNavigate()

    let [files, setFiles] = useState([])
    let [uploading, setUploading] = useState(false)
    let username = window.localStorage.getItem("username")

    function selectFiles(e) {
        setFiles(Array.from(e.target.files))
    }

    function refresh() {
        setFiles([])
    }

    async function upload() {
        if (files.length === 0) {
            alert("No files selected.")
            return
        }
        setUploading(true)
        let formData = new FormData()
        files.forEach(file => formData.append("files", file))
        try {
            let response = await fetch(`https://hosttel.onrender.com/${username}/upload`, {
                method: "POST",
                body: formData
            })
            if (response.ok) {
                alert("All files are uploaded successfully.")
                setFiles([])
            }
            if (response.status === 400) {
                alert("Files already exists !")
                setFiles([])
            }
        }
        catch (error) {
            alert("An error occured, please refresh and try again")
            navigate("/")
        }
        setUploading(false)
    }

    return (
        <div className='h-screen w-full'>
            <Navbar />
            <div className="flex w-full justify-center mt-28" >
                <div className="h-96 w-[500px] bg-stone-600 rounded-2xl px-12 flex flex-col items-center justify-center space-y-6" >
                    <p className="text-white text-xl font-semibold" >Select files</p>
                    <label htmlFor="upload" className="cursor-pointer text-lg bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition-all" >Choose files</label>
                    <input onChange={selectFiles} id="upload" type="file" multiple className="hidden" />
                    {files.length > 0 && (
                        <div className='flex flex-col'>
                            <button onClick={upload} disabled={uploading} className={`text-lg text-white rounded-lg px-9 py-2 transition-all ${uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 cursor-pointer"}`} >{uploading ? "Uploading" : "Upload"}</button>
                            <button onClick={refresh} disabled={uploading} className={`text-lg text-white rounded-lg px-9 py-2 transition-all mt-6 ${uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 cursor-pointer"}`} >Refresh</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}