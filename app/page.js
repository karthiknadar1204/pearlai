"use client";

import React, { useState } from "react";

const Page = () => {
  const [videoLink, setVideoLink] = useState("");
  const [embedLink, setEmbedLink] = useState("");
  const [transcription, setTranscription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLoad = () => {
    const videoId = new URL(videoLink).searchParams.get("v");
    if (videoId) {
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      setEmbedLink(embedUrl);
    }
  };

  const handleTranscribe = async () => {
    setIsLoading(true);
    try {
      const videoId = new URL(videoLink).searchParams.get("v");
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoId }),
      });

      if (!response.ok) {
        throw new Error("Failed to transcribe video");
      }

      const data = await response.json();
      const transcriptContent = await fetch(data.transcriptFilename).then(res => res.text());
      setTranscription(transcriptContent);
    } catch (error) {
      console.error("Error transcribing video:", error);
      setTranscription("Error occurred while transcribing the video.");
    } finally {
      setIsLoading(false);
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
        disabled={isLoading}
      >
        {isLoading ? "Transcribing..." : "Transcribe"}
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
