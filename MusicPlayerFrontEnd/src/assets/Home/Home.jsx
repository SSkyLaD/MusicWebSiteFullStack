import "./Home.scss";
import axios from "axios";
import Clock from "./Clock/Clock";

export default function Home() {
    return (
        <div className="home">
            <Clock className="clock"/>
        </div>
    );
}
