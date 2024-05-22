import { useState, useRef } from "react";

const mimeType = 'video/webm; codecs="opus,vp8"';

const VideoRecorder = () => {
	const [permission, setPermission] = useState(false);

	const mediaRecorder = useRef(null);

	const liveVideoFeed = useRef(null);

	const [recordingStatus, setRecordingStatus] = useState("inactive");

	const [stream, setStream] = useState(null);

	const [recordedVideo, setRecordedVideo] = useState(null);

	const [videoChunks, setVideoChunks] = useState([]);

	const getCameraPermission = async () => {
		setRecordedVideo(null);
		//get video and audio permissions and then stream the result media stream to the videoSrc variable
		if ("MediaRecorder" in window) {
			try {
				const videoConstraints = {
					audio: false,
					video: true,
				};
				const audioConstraints = { audio: true };

				// create audio and video streams separately
				const audioStream = await navigator.mediaDevices.getUserMedia(
					audioConstraints
				);
				const videoStream = await navigator.mediaDevices.getUserMedia(
					videoConstraints
				);

				setPermission(true);

				//combine both audio and video streams

				const combinedStream = new MediaStream([
					...videoStream.getVideoTracks(),
					...audioStream.getAudioTracks(),
				]);

				setStream(combinedStream);

				//set videostream to live feed player
				liveVideoFeed.current.srcObject = videoStream;
			} catch (err) {
				alert(err.message);
			}
		} else {
			alert("The MediaRecorder API is not supported in your browser.");
		}
	};

	const startRecording = async () => {
		setRecordingStatus("recording");

		const media = new MediaRecorder(stream, { mimeType });

		mediaRecorder.current = media;

		mediaRecorder.current.start();

		let localVideoChunks = [];

		mediaRecorder.current.ondataavailable = (event) => {
			if (typeof event.data === "undefined") return;
			if (event.data.size === 0) return;
			localVideoChunks.push(event.data);
		};

		setVideoChunks(localVideoChunks);
	};

	const stopRecording = () => {
		setPermission(false);
		setRecordingStatus("inactive");
		mediaRecorder.current.stop();

		mediaRecorder.current.onstop = () => {
			const videoBlob = new Blob(videoChunks, { type: mimeType });
			const videoUrl = URL.createObjectURL(videoBlob);

			setRecordedVideo(videoUrl);

			setVideoChunks([]);
		};
	};

	const uploadRecording = async () => {
		//upload recordedVideo to Azure Blob sotrage using sas key
		if (recordedVideo) {
			const sasKey = ""; //add your sas key here
			const storageAccount = ""; //add your storage account name here
			const containerName = ""; //add your container name here
			const blobName = ""; //add your blob name here
			const bytes = await fetch(recordedVideo).then((res) => res.blob());
			try {
				const response = await fetch(storageAccount + "/" + containerName + "/" + blobName + "?" + sasKey, {
					method: "PUT",
					body: bytes,
					headers: {
						"Content-Type": mimeType,
						"x-ms-version":"2024-05-04",
						"x-ms-date": Date.now(),
						"x-ms-blob-type": "BlockBlob"
					},
				});
				if (response.ok) {
					console.log("Recording uploaded successfully");
				} else {
					console.error("Failed to upload recording");
				}
			} catch (error) {
				console.error("Error uploading recording:", error);
			}
		}
	};

	return (
		<div>
			<h2>Video Recorder</h2>
			<main>
				<div className="video-controls">
					{!permission ? (
						<button onClick={getCameraPermission} type="button">
							Get Camera
						</button>
					) : null}
					{permission && recordingStatus === "inactive" ? (
						<button onClick={startRecording} type="button">
							Start Recording
						</button>
					) : null}
					{recordingStatus === "recording" ? (
						<button onClick={stopRecording} type="button">
							Stop Recording
						</button>
					) : null}
				</div>
			</main>

			<div className="video-player">
				{!recordedVideo ? (
					<video ref={liveVideoFeed} autoPlay className="live-player"></video>
				) : null}
				{recordedVideo ? (
					<div className="recorded-player">
						<video className="recorded" src={recordedVideo} controls></video>
						<div className="video-controls">
						<button onClick={uploadRecording} type="button">
							Upload Recording to Azure blob storage
						</button>
						</div>
						<a download href={recordedVideo}>
							Download Recording
						</a>
					</div>
				) : null}
			</div>
		</div>
	);
};

export default VideoRecorder;
