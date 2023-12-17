import React from "react";
import "./Profile.scss";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlay,
    faEllipsisVertical,
    faHeart,
    faTrash,
    faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { TokenContext } from "../../pages/UserPage/user";

export default function Profile() {
    const { tokenData } = React.useContext(TokenContext);
    return (
        <div className="profile">
            <div className="profile-container">
                <div className="top-section"></div>
                <div className="bottom-section">
                    <div className="avatar-container"></div>
                    <h1 className="profile-name">MyAwsomeFrofile</h1>
                    <div className="main">
                        <div>
                            <h3>A Member Since:</h3>
                            <p>20/13/2989</p>
                        </div>
                        <div >
                            <h3>Number Of Songs:</h3>
                            <p>56</p>
                        </div>
                        <div >
                            <h3>Your Top Favorite Songs:</h3>
                        </div>
                        <div className="top-favorite-container"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function BestMusicCard(songData) {
    const [moreButton, setMoreButton] = React.useState(false);
    const { setPlaySong } = React.useContext(TokenContext);

    const moreButtonRef = React.useRef();

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
