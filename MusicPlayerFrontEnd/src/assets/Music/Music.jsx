import React from "react";
import axios from "axios";
import "./Music.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass ,faPlay} from "@fortawesome/free-solid-svg-icons";
import { TokenContext } from "../../pages/UserPage/user";
import {successNotification,failedNotification} from "../notification"
import Empty from "../Empty/empty";
import MusicCard from "../MusicCard/MusicCard";


const APIurl = import.meta.env.VITE_APIServerUrl;


export default function Music() {
    const { tokenData,handlePlayAll,notification} = React.useContext(TokenContext);
    const [songs, setSongs] = React.useState(null);
    const [uploadtedFile, setuploadtedFile] = React.useState(null);
    const [searchInput, setSearchInput] = React.useState("");
    const inputFileRef = React.useRef();

    //Songs sau khi được load từ API đi qua filter search input rồi render thành các songCard


    const getSongs = () => {
        axios
            .get(`${APIurl}/api/v1/users/songs`, {
                headers: {
                    Authorization: `Bearer ${tokenData.token}`,
                },
            })
            .then((res) => setSongs(res.data.data))
            .catch((err) => console.log(err));
    };

    // Upfile
    const handleFileChange = (e) => {
        setuploadtedFile(e.target.files[0]);
    };

    const handleFileUpload = () => {
        if (!uploadtedFile) {
            console.log("No file selected");
            return;
        }

        const fd = new FormData();
        fd.append("file", uploadtedFile);

        axios
            .post(`${APIurl}/api/v1/users/songs`, fd, {
                onUploadProgress: (progressEvent) => {
                    console.log(progressEvent.progress * 100);
                },
                headers: {
                    Authorization: `Bearer ${tokenData.token}`,
                },
            })
            .then(() => {
                successNotification('File uploadted successfully');
                setuploadtedFile(null);
                inputFileRef.current.value = null;
                getSongs();
            })
            .catch((err) => {
                failedNotification('Oops... Something went wrong');
                console.log(err);
                setuploadtedFile(null);
                inputFileRef.current.value = null;
            });
    };
    //

    const searchFilter = (e) => {
        setSearchInput(e.target.value);
    };

    let songlistHTML;
    
    if (songs) {
        const regEx = new RegExp(`\\b${searchInput}`, "gi");
        const songlistArr = songs.filter(song=>regEx.test(song.name)||regEx.test(song.artist));
        songlistHTML = songlistArr.map((songData) => {
            return (
                <MusicCard
                    songData={songData}
                    key={songData._id}
                    getSongs = {getSongs}
                    control= "music"
                    notification ={notification}
                />
            );
        });
    }

    //Lấy songs từ API mỗi khi Load component
    React.useEffect(() => {
        getSongs();
    }, []);

    return (
        <div className="music">
            <div className="top-bar">
                <div className="top-left">
                    <h2>Discover your music</h2>
                    <button onClick={()=>handlePlayAll(songs)}>
                        <FontAwesomeIcon icon={faPlay} />
                        <p>Play all</p>
                    </button>
                </div>
                <div className="search">
                    <input
                        type="text"
                        id="search-input"
                        placeholder="Search here..."
                        onChange={searchFilter}
                        value={searchInput}
                    ></input>
                    <div className="search-icon">
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </div>
                </div>
                <div className="upload">
                    <input
                        type="file"
                        accept=".mp3, .flac"
                        onChange={handleFileChange}
                        ref={inputFileRef}
                    />
                    <button onClick={handleFileUpload}>Upload</button>
                </div>
            </div>
            {songs==[] ? (
                <div className="bottom-section">
                    <Empty />
                </div>
            ) : (
                <div className="music-list-container">{songlistHTML}</div>
            )}
        </div>
    );
}
