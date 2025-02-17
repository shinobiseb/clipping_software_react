import { useRef, useState, useEffect, ChangeEvent } from 'react';
import { toBlobURL } from '@ffmpeg/util';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import Slider from './Slider';
import ReactPlayer from 'react-player';

export default function WebAsem() {
  const [loaded, setLoaded] = useState<boolean>(false);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const messageRef = useRef<HTMLParagraphElement | null>(null);
  const [timestamps, setTimestamps] = useState<{ startTime: string; endTime: string }>({
    startTime: '00:00:00.0',
    endTime: '00:00:00.0',
  });
  const [uploadedVidFile, setUploadedVidFile] = useState<File | null>(null);
  const [vidSrc, setVidSrc] = useState<string | null>(null);
  const [videoLength, setVideoLength] = useState<number>(0);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (uploadedVidFile) {
      loadVideoIntoPreview();
    }
  }, [uploadedVidFile]);

  async function loadVideoIntoPreview() {
    if (!uploadedVidFile) return;
    const videoURL = URL.createObjectURL(uploadedVidFile);
    if (videoRef.current) {
      videoRef.current.src = videoURL;
      setVidSrc(videoURL);
      console.log('Video Loaded', videoURL);
    } else {
      console.error('Video not loaded');
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setUploadedVidFile(e.target.files[0]);
      console.log('Video Uploaded');
    }
  }

  function handleLoadedMetadata() {
    if (videoRef.current) {
      setVideoLength(videoRef.current.duration);
    }
  }

  const load = async () => {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    const ffmpeg = new FFmpeg();
    ffmpegRef.current = ffmpeg;
    ffmpeg.on('log', ({ message }: { message: string }) => {
      if (!messageRef.current) return;
      messageRef.current.innerHTML = message;
      console.log(message);
    });

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    setLoaded(true);
  };

  const trimVideo = async () => {
    const ffmpeg = ffmpegRef.current;
    if (!ffmpeg) return;
    const video = uploadedVidFile;
    if (!video) return;

    const arrayBuffer = await video.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    await ffmpeg.writeFile('input.mp4', uint8Array);

    if (!timestamps.startTime || !timestamps.endTime) {
      console.error('StartRef or EndRef Not Valid');
      console.table([timestamps.startTime, timestamps.endTime]);
      return;
    }

    const command = ['-ss', timestamps.startTime, '-to', timestamps.endTime, '-i', 'input.mp4', '-c', 'copy', 'output.mp4'];
    console.log(command);

    await ffmpeg.exec(command);
    const data = await ffmpeg.readFile('output.mp4');
    if (videoRef.current) {
      let videoURL = URL.createObjectURL(new Blob([data], { type: 'video/mp4' }));
      videoRef.current.src = videoURL;
      setVidSrc(videoURL);
      console.log('Video Loaded', vidSrc);
    }
  };

  return loaded ? (
    <main className="flex flex-col justify-evenly h-1/2 items-center">
      {vidSrc ? 
      <section>
        <ReactPlayer url={vidSrc} controls={true} />
        <Slider setTimestamps={setTimestamps} videoLength={videoLength} />
      </section> : null}
      
      <video className="w-full hidden" ref={videoRef} controls onLoadedMetadata={handleLoadedMetadata}></video>
      <section></section>
      <section className="flex">
        <label className="rounded-xl px-2 py-2 cursor-pointer" htmlFor="UploadClip">
          Select Clip
        </label>
        <input onChange={handleFileChange} className="hidden" accept="video/*" type="file" id="UploadClip" />
      </section>
      {uploadedVidFile ? <button className="rounded-xl px-2 py-2 cursor-pointer" onClick={trimVideo}>Trim Video</button> : null}
      <p className='mt-3' ref={messageRef}></p>
    </main>
  ) : (
    <h3>Loading...</h3>
  );
}
