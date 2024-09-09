import { NextResponse } from "next/server";
import axios from "axios";
import ytdl from "ytdl-core";
import { PassThrough } from "stream";

const streamToBuffer = (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
};

export async function POST(request) {
  const formData = await request.formData();
  const videoUrl = formData.get("file");
  const apiKEY = process.env.OPENAI_API_KEY
  console.log("API Key:", apiKEY); 

  if (!apiKEY) {
    return NextResponse.json(
      {
        message:
          "You need to set your API Key as env variable or with the input.",
      },
      { status: 401, statusText: "Unauthorized" }
    );
  }

  if (!ytdl.validateURL(videoUrl)) {
    return NextResponse.json(
      {
        message: "Invalid YouTube URL.",
      },
      { status: 400, statusText: "Bad Request" }
    );
  }

  try {
    const audioStream = ytdl(videoUrl, {
      filter: "audioonly",
      quality: "highestaudio",
    });

    const audioBuffer = await streamToBuffer(audioStream);

    const openAIFormData = new FormData();
    openAIFormData.append(
      "file",
      new Blob([audioBuffer], { type: "audio/mpeg" }),
      "audio.mp3"
    );
    openAIFormData.append("model", "whisper-1");

    const { data } = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      openAIFormData,
      {
        headers: {
          Authorization: `Bearer ${apiKEY}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return NextResponse.json({ data });
  } catch (error) {
    console.error(error.response?.data?.error?.message || error.message);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
