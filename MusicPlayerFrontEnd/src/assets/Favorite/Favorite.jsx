import "./Favorite.scss";
import React from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faPlay } from "@fortawesome/free-solid-svg-icons";
import { TokenContext } from "../../pages/UserPage/user";
import Empty from "../Empty/empty";
import MusicCard from "../MusicCard/MusicCard";

const APIurl = import.meta.env.VITE_APIServerUrl;

export default function Favorite() {
    const { tokenData, handlePlayAll } = React.useContext(TokenContext);
    const [songs, setSongs] = React.useState(null);
    const [searchInput, setSearchInput] = React.useState("");

    const getFavoriteSongs = () => {
        axios
            .get(`${APIurl}/api/v1/users/songs/favorites`, {
                headers: {
                    Authorization: `Bearer ${tokenData.token}`,
                },
            })
            .then((res) => {
                console.log(res.data.data);
                setSongs(res.data.data);
            })
            .catch((err) => console.log(err));
    };

    const searchFilter = (e) => {
        setSearchInput(e.target.value);
    };

    let songlistHTML;

    if (songs) {
        const regEx = new RegExp(`\\b${searchInput}`, "gi");
        const songlistArr = songs.filter((song) => regEx.test(song.name)||regEx.test(song.artist));
        songlistHTML = songlistArr.map((songData) => {
            return (
                <MusicCard
                    songData={songData}
                    key={songData._id}
                    getFavoriteSongs={getFavoriteSongs}
                    control="favorite"
                />
            );
        });
    }

    React.useEffect(() => {
        getFavoriteSongs();
    }, []);

    return (
        <div className="favorite">
            <div className="top-bar">
                <div className="top-left">
                    <h2>Your most favorite music</h2>
                    <button onClick={() => handlePlayAll(songs)}>
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
            </div>
            {songs && songs.length === 0 ?  (
                <div className="bottom-section">
                    <Empty />
                </div>
            ) : (
                <div className="music-list-container">{songlistHTML}</div>
            )}
        </div>
    );
}
