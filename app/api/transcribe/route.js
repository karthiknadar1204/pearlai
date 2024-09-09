import ytdl from 'ytdl-core';
import { YoutubeTranscript } from 'youtube-transcript';
import fsSync from 'fs';
import { promises as fs } from 'fs';
import path from 'path';
import url from 'url';
import ffmpeg from 'fluent-ffmpeg';

const videoDir = 'videos';

if (!fsSync.existsSync(videoDir)) {
  fsSync.mkdirSync(videoDir);
}

export async function POST(req) {
  const { videoId, videoUrl, chunks } = await req.json();

  if (!videoId && !videoUrl) {
    return new Response(JSON.stringify({ message: 'Either video ID or video URL must be provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    console.log('Video download process started...');
    const { videoFilename, transcriptFilename } = await videoDownload({ videoId, videoUrl });

    console.log('Video downloaded, splitting process starting...');
    const videoSplitFiles = await Promise.all(
      chunks.map(async ({ start, duration }) => videoSplitter(videoFilename, Number(start), Number(duration)))
    );

    console.log('Video splitting complete');
    return new Response(JSON.stringify({
      videoFilename,
      transcriptFilename,
      videoSplitFiles,
      message: 'Files downloaded and split successfully',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in video or transcript processing:', error);
    return new Response(JSON.stringify({ message: 'An error occurred while downloading the video and transcript.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function videoDownload(opts) {
  const { videoId, videoUrl } = opts;

  return new Promise((resolve, reject) => {
    let finalVideoId = videoId;
    if (videoUrl) {
      const parsedUrl = url.parse(videoUrl.toString(), true);
      const queryParameters = parsedUrl.query;
      finalVideoId = queryParameters['v'];
    }

    if (!finalVideoId) {
      reject('Invalid video ID or URL');
      return;
    }

    const fileId = finalVideoId.toString();
    const videoFilename = path.join(videoDir, fileId + '.mp4');
    const transcriptFilename = path.join(videoDir, fileId + '.json');

    console.log('Starting video download...');
    const videoStream = ytdl(`https://www.youtube.com/watch?v=${finalVideoId}`);

    videoStream.pipe(fsSync.createWriteStream(videoFilename)).on('close', async () => {
      console.log('Video download complete');
      try {
        const transcripts = await YoutubeTranscript.fetchTranscript(finalVideoId.toString());
        console.log('Transcript fetched successfully');
        await fs.writeFile(transcriptFilename, JSON.stringify(transcripts));
        resolve({
          videoFilename,
          transcriptFilename,
        });
      } catch (err) {
        console.error('Error fetching transcript:', err);
        reject('Error downloading transcript: ' + err.message);
      }
    });

    videoStream.on('error', (err) => {
      console.error('Error downloading video:', err);
      reject('Error downloading video: ' + err.message);
    });
  });
}

async function videoSplitter(filename, start, duration) {
  const outputFilename = `${filename}-${start}-${duration}.mp4`;
  return new Promise((resolve, reject) => {
    ffmpeg(filename)
      .setStartTime(start)
      .setDuration(duration)
      .outputOptions('-c copy')
      .on('end', () => {
        resolve(outputFilename);
      })
      .on('error', (err) => {
        console.log('Error while splitting', err);
        reject(err);
      })
      .save(outputFilename);
  });
}
