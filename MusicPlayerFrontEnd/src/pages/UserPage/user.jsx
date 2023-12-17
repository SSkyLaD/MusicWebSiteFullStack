import React from "react";
import NavBar from "../../assets/NavBar/NavBar";
import Player from "../../assets/Player/Player";
import Home from "../../assets/Home/Home";
import { useNavigate } from "react-router-dom";
import "./user.scss";
import { defaultAlbumImageBase64 } from "../../assets/imageBase64";
export const TokenContext = React.createContext();

export default function UserPage() {
    const [mainComponent, setMainComponent] = React.useState(<Home />); // Điều khiển mainComponent
    const tracklist = React.useRef([]); //lưu tracklist khi được load từ mainComponent
    const tracklistIndex = React.useRef(0); // lưu index tracklist đang chơi
    // Playsong là bài hát hiện tại đang được play
    const [playSong, setPlaySong] = React.useState({
        name: "Unknow",
        artist: "Unknow",
        albumImageBase64: defaultAlbumImageBase64,
        musicUrl: "",
    });

    // xử lý playAll từ các mainComponent
    const handlePlayAll = (arr) => {
        if(arr && arr.length !== 0){
            tracklist.current = arr;
            setPlaySong(tracklist.current[tracklistIndex.current]);
        }
    };

    const [tokenData, setTokenData] = React.useState({
        token: "",
        username: "",
    });

    // Navigate notoken
    const navigate = useNavigate();

    React.useEffect(() => {
        const savedToken = localStorage.getItem("token");
        if (!savedToken) {
            navigate("/login");
        } else {
            const { token, username } = JSON.parse(savedToken);
            setTokenData({ token: token, username: username });
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <TokenContext.Provider
            value={{
                tokenData,
                playSong,
                setPlaySong,
                handlePlayAll,
                tracklist,
                tracklistIndex,
            }}
        >
            <div className="user-page">
                <NavBar
                    handleLogout={handleLogout}
                    setMainComponent={setMainComponent}
                />
                <Player />
                {mainComponent}
            </div>
        </TokenContext.Provider>
    );
}
