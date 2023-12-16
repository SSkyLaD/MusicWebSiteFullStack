import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHouse,
    faUser,
    faMusic,
    faHeart,
    faBookmark,
    faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import Home from "../Home/Home";
import Music from "../Music/Music";
import Profile from "../Profile/Profile";
import Favorite from "../Favorite/Favorite";
import "./NavBar.scss";
import { TokenContext } from "../../pages/UserPage/user";

NavBar.propTypes = {
    handleLogout: PropTypes.func.isRequired,
    setMainComponent: PropTypes.func.isRequired,
};

export default function NavBar({ handleLogout, setMainComponent }) {
    const { tokenData } = React.useContext(TokenContext);
    const [select, setSelect] = React.useState("Home");

    const navHome = () => {
        setMainComponent(<Home />);
        setSelect("Home");
    };

    const navUser = () => {
        setMainComponent(<Profile title="this is MainComponent" />);
        setSelect("User");
    };

    const navMusic = () => {
        setMainComponent(<Music />);
        setSelect("Music");
    };
    const navFavorite = () => {
        setMainComponent(<Favorite />);
        setSelect("Favorite");
    };

    return (
        <div className="nav-bar">
            <div className="main-nav">
                <div
                    className={
                        select === "User"
                            ? "button-avatar-selected"
                            : "button-avatar"
                    }
                    onClick={navUser}
                >
                    <div className="avatar-container">
                        <FontAwesomeIcon icon={faUser} size="xl" width={25} />
                    </div>
                    <p>{tokenData.username}</p>
                </div>
                <div
                    className={select === "Home" ? "button-selected" : "button"}
                    onClick={navHome}
                >
                    <FontAwesomeIcon icon={faHouse} size="xl" />
                    <p>Home</p>
                </div>
            </div>
            <div className="your-library-nav">
                <p>YOUR LIBRARY</p>
                <div
                    className={
                        select === "Music" ? "button-selected" : "button"
                    }
                    onClick={navMusic}
                >
                    <FontAwesomeIcon icon={faMusic} size="xl" />
                    <p>Music</p>
                </div>
                {/* <div className="button">
                    <FontAwesomeIcon
                        icon={faRotateRight}
                        size="xl"
                        width={25}
                    />
                    <p>Recent played</p>
                </div> */}
                <div
                    className={
                        select === "Favorite" ? "button-selected" : "button"
                    }
                    onClick={navFavorite}
                >
                    <FontAwesomeIcon icon={faHeart} size="xl" />
                    <p>Favorite</p>
                </div>
            </div>
            <div className="playlist">
                <p>YOUR PLAYLIST</p>
                <div className="button">
                    <FontAwesomeIcon icon={faBookmark} size="xl" />
                    <p>Playlist</p>
                </div>
                <div className="button">
                    <FontAwesomeIcon icon={faBookmark} size="xl" />
                    <p>Playlist1542ádasdadsdadasdadasdaddasdasdadad</p>
                </div>
                <div className="button">
                    <FontAwesomeIcon icon={faBookmark} size="xl" />
                    <p>Playlist2</p>
                </div>
            </div>
            <div className="logout button" onClick={handleLogout}>
                <FontAwesomeIcon
                    icon={faRightFromBracket}
                    size="xl"
                    width={25}
                />
                <p>Logout</p>
            </div>
        </div>
    );
}
