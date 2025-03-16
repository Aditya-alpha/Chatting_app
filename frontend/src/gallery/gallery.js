import { useEffect, useState } from "react";
import Navbar from "../navbar/navbar"
import { RxCross1 } from "react-icons/rx"

export default function Gallery() {
    let [files, setFiles] = useState([])
    let [username, setUsername] = useState(null)
    let [fullscreen, setFullscreen] = useState(null)

    useEffect(() => {
        const storedUsername = window.localStorage.getItem("username");
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    useEffect(() => {
        if (!username) return;

        async function showFiles() {
            try {
                let response = await fetch(`http://localhost:8000/${username}/gallery`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                })

                if (response.ok) {
                    let data = await response.json()
                    const extractedFiles = data.flatMap(item => item.files)
                    setFiles(extractedFiles)
                } else {
                    alert("Failed to fetch gallery");
                }
            } catch (error) {
                alert("Error fetching gallery");
            }
        }
        showFiles()
    }, [username])

    let handleDelete = async (fileName) => {
        let confirmDelete = window.confirm(`Are you sure you want to delete ${fileName}?`)
        if (!confirmDelete) return
        try {
            let response = await fetch(`http://localhost:8000/${username}/delete`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileName })
            })
            if (response.ok) {
                setFiles(prevFiles => prevFiles.filter(file => file.fileName !== fileName));
            } else {
                alert("Failed to delete file");
            }
        } catch (error) {
            alert("Error deleting file");
        }
    }

    const images = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file.fileUrl))
    const videos = files.filter(file => /\.(mp4|webm|mov)$/i.test(file.fileUrl))
    const otherFiles = files.filter(file => !/\.(jpg|jpeg|png|gif|webp|mp4|webm|mov)$/i.test(file.fileUrl))

    return (
        <div className="h-full w-full">
            <Navbar />
            <div className="flex flex-col px-12">
                <p className="text-white text-5xl self-center font-semibold mt-4 mb-12">Gallery</p>
                <div>
                    <h2 className="text-white text-3xl font-semibold mb-6">Images</h2>
                    <div className="flex rounded-lg cursor-pointer gap-12 flex-wrap">
                        {images.length > 0 ? (
                            images.map((file, index) => (
                                <div key={index} onClick={ () => {setFullscreen(file.fileUrl)}} className="relative group w-60 h-48 shadow-lg shadow-gray-700 rounded-lg">
                                    <img src={file.fileUrl} alt={file.fileName} className="rounded-lg w-full h-full object-cover" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-sm p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p>{file.fileName}</p>
                                        <p>{new Date(file.uploadDate).toLocaleDateString()}</p>
                                        <button onClick={(e) => {e.stopPropagation(); handleDelete(file.fileName)}} className="text-red-500 font-semibold hover:underline mt-1">Delete</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-white" >No images available</p>
                        )}
                    </div>
                </div>
                <div className="mt-12">
                    <h2 className="text-white text-3xl font-semibold mb-6">Videos</h2>
                    <div className="flex rounded-lg cursor-pointer gap-14 flex-wrap">
                        {videos.length > 0 ? (
                            videos.map((file, index) => (
                                <div key={index} className="relative group w-60 h-48 shadow-lg shadow-gray-700 rounded-lg">
                                    <video controls className="rounded-lg w-full h-full object-cover">
                                        <source src={file.fileUrl} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-sm p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p>{file.fileName}</p>
                                        <p>{new Date(file.uploadDate).toLocaleDateString()}</p>
                                        <button onClick={() => handleDelete(file.fileName)} className="text-red-500 font-semibold hover:underline mt-1">Delete</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-white" >No videos available</p>
                        )}
                    </div>
                </div>
                <div className="my-12">
                    <h2 className="text-white text-3xl font-semibold mb-6">Other Files</h2>
                    <div className="flex flex-col cursor-pointer">
                        {otherFiles.length > 0 ? (
                            otherFiles.map((file, index) => (
                                <div key={index} className="relative group h-[102px]">
                                    <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                                        {file.fileName}
                                    </a>
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-sm p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p>{file.fileName}</p>
                                        <p>{new Date(file.uploadDate).toLocaleDateString()}</p>
                                        <button onClick={() => handleDelete(file.fileName)} className="text-red-500 font-semibold hover:underline mt-1">Delete</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-white" >No other files available</p>
                        )}
                    </div>
                </div>
                <div className="text-white" >
                    * You can download the media by opening it, then right click on the page and save image/video.
                </div>
            </div>
            {fullscreen && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center">
                    <button onClick={() => setFullscreen(null)} className="text-white text-3xl ml-[1400px]">
                        <RxCross1/>
                    </button>
                    <img src={fullscreen} className="w-[90%] h-[90%] object-contain rounded-lg" />
                </div>
            )}
        </div>
    )
}
