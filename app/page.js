"use client"

import React, { useState } from 'react'

const Page = () => {
  const [videoLink, setVideoLink] = useState('')
  const [embedLink, setEmbedLink] = useState('')

  const handleLoad = () => {
    const embedUrl = videoLink.replace('watch?v=', 'embed/')
    setEmbedLink(embedUrl)
  }

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
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Load
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
    </div>
  )
}

export default Page