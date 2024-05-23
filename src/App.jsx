import "./App.css";
import { useState } from "react";
import VideoRecorder from "../src/VideoRecorder";
import AudioRecorder from "../src/AudioRecorder";

const App = () => {
    let [recordOption, setRecordOption] = useState("video");

    const toggleRecordOption = (type) => {
        return () => {
            setRecordOption(type);
        };
    };

    return (
        <div className="app-container">
            <h1>Job Interview Recording</h1>
            <div>
                <VideoRecorder />
            </div>
        </div>
    );
};

export default App;