import React from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlay,
    faEllipsisVertical,
    faHeart,
    faTrash,
    faDownload,
} from "@fortawesome/free-solid-svg-icons";
import "./MusicCard.scss";
import { TokenContext } from "../../pages/UserPage/user";
import { successNotification, failedNotification } from "../notification";

const APIurl = import.meta.env.VITE_APIServerUrl;

MusicCard.propTypes = {
    songData: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        artist: PropTypes.string.isRequired,
        albumImageBase64: PropTypes.string.isRequired,
        musicUrl: PropTypes.string.isRequired,
        favorite: PropTypes.bool.isRequired,
    }).isRequired,
    getSongs: PropTypes.func,
    getFavoriteSongs: PropTypes.func,
    control: PropTypes.string.isRequired,
};

export default function MusicCard({
    songData,
    getSongs,
    getFavoriteSongs,
    control,
}) {
    //Control để nhận biết xem component cha là gì để khi delete thì rerender component cha
    const [moreButton, setMoreButton] = React.useState(false);
    const { setPlaySong, tokenData, tracklist } =
        React.useContext(TokenContext);

    const moreButtonRef = React.useRef();

    //Setup Download
    const handleFileDownload = (data) => {
        axios
            .get(`${APIurl}/api/v1/users/songs/download/${data._id}`, {
                headers: {
                    Authorization: `Bearer ${tokenData.token}`,
                },
                responseType: "blob", // Corrected typo
            })
            .then((response) => {
                console.log(response)
                const contentType = response.headers["content-type"];
                const url = window.URL.createObjectURL(
                    new Blob([response.data], {
                        type: contentType,
                    })
                );
                const filename = data.filename.split("-");
                filename.shift();
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", filename.join(" - "));
                document.body.appendChild(link);
                link.click();
                link.remove();
            })
            .catch((error) => {
                console.error("Error downloading file:", error);
            });
    };

    const handleFavoriteToggle = (id, favorite) => {
        axios
            .patch(
                `${APIurl}/api/v1/users/songs/${id}`,
                {
                    favorite: !favorite,
                },
                {
                    headers: {
                        Authorization: `Bearer ${tokenData.token}`,
                    },
                }
            )
            .then(() => {
                if (favorite) {
                    successNotification(
                        `${songData.name} - ${songData.artist} removed from favorite`
                    );
                } else {
                    successNotification(
                        `${songData.name} - ${songData.artist} added to favorite`
                    );
                }
                control === "music" ? getSongs() : getFavoriteSongs();
            })
            .catch((error) => {
                failedNotification("Oops... Something went wrong");
                console.log(error);
            });
    };

    const handleDeleteSong = (id) => {
        tracklist.current = tracklist.current.filter((song) => song.id !== id);
        axios
            .delete(`${APIurl}/api/v1/users/songs/${id}`, {
                headers: {
                    Authorization: `Bearer ${tokenData.token}`,
                },
            })
            .then(() => {
                successNotification(
                    `${songData.name} - ${songData.artist} DELETED successfully`
                );
                control === "music" ? getSongs() : getFavoriteSongs();
            })
            .catch((error) => {
                failedNotification("Oops... Something went wrong");
                console.log(error);
            });
    };

    //Hiện moreButton và xử lý ClickOutside
    const moreButtonClickHandle = () => {
        setMoreButton((prev) => !prev);
    };

    React.useEffect(() => {
        const handler = (e) => {
            if (!moreButtonRef.current.contains(e.target)) {
                setMoreButton(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => {
            document.removeEventListener("mousedown", handler);
        };
    }, []);
    //

    return (
        <div
            className="song-card"
            key={songData._id}
            style={{
                boxShadow: songData.favorite
                    ? "0px 0px 5px rgba(255, 0, 0, 1), 0px 0px 25px rgba(255, 0, 0, 1)"
                    : "",
            }}
        >
            <div className="top-section">
                <img src={songData.albumImageBase64} alt="" />
                <div
                    className="play"
                    onClick={() => setPlaySong(songData)}
                    style={{ display: moreButton ? "none" : "" }}
                >
                    <FontAwesomeIcon icon={faPlay} />
                </div>
            </div>
            <div className="more-option" ref={moreButtonRef}>
                <div
                    className="more-option-button"
                    onClick={moreButtonClickHandle}
                >
                    <FontAwesomeIcon icon={faEllipsisVertical} size="xl" />
                </div>
                {moreButton && (
                    <div className="popup-option">
                        <ul>
                            <li
                                onClick={() =>
                                    handleFavoriteToggle(
                                        songData._id,
                                        songData.favorite
                                    )
                                }
                            >
                                <FontAwesomeIcon
                                    icon={faHeart}
                                    style={{
                                        color: songData.favorite ? "red" : "",
                                        filter: "drop-shadow(0 0 5px red)",
                                    }}
                                />
                            </li>
                            <li onClick={() => handleDeleteSong(songData._id)}>
                                <FontAwesomeIcon icon={faTrash} />
                            </li>
                            <li onClick={() => handleFileDownload(songData)}>
                                <FontAwesomeIcon icon={faDownload} />
                            </li>
                        </ul>
                        <div className="shape"></div>
                    </div>
                )}
            </div>
            <p className="name">{songData.name}</p>
            <p className="artist">{songData.artist}</p>
        </div>
    );
}
