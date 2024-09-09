"use client";

import React, { useState } from "react";
import axios from "axios";

const Page = () => {
  const [videoLink, setVideoLink] = useState("");
  const [embedLink, setEmbedLink] = useState("");
  const [transcription, setTranscription] = useState("");

  const handleLoad = () => {
    const embedUrl = videoLink.replace("watch?v=", "embed/");
    setEmbedLink(embedUrl);
  };

  const handleTranscribe = async () => {
    try {
      const formData = new FormData();
      formData.append("file", videoLink);

      const response = await axios.post("/api/transcribe", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setTranscription(response.data.data.text);
    } catch (error) {
      console.error("Error transcribing:", error);
    }
  };

  return (
    <div className="p-4">
      <input
        type="text"
        value={videoLink}
        onChange={(e) => setVideoLink(e.target.value)}
        placeholder="Enter YouTube video link"
        className="w-full p-2 mb-4 border rounded"
      />
      <button
        onClick={handleLoad}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
      >
        Load
      </button>
      <button
        onClick={handleTranscribe}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Transcribe
      </button>
      {embedLink && (
        <div className="mt-4">
          <iframe
            width="560"
            height="315"
            src={embedLink}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}
      {transcription && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Transcription:</h2>
          <p>{transcription}</p>
        </div>
      )}
    </div>
  );
};

export default Page;
