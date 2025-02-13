import { useRef, useState, useEffect, ChangeEvent } from 'react';
import { toBlobURL } from '@ffmpeg/util';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import Slider from './Slider';

export default function WebAsem() {
    const [loaded, setLoaded] = useState<boolean>(false);
    const ffmpegRef = useRef<FFmpeg | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const messageRef = useRef<HTMLParagraphElement | null>(null);
    const startRef = useRef<HTMLInputElement | null>(null);
    const endRef = useRef<HTMLInputElement | null>(null);
    const [uploadedVid, setUploadedVid] = useState<File | null>(null)
    const [vidSrc, setVidSrc] = useState<string | null>(null)

    useEffect(()=> {
        load()
    }, [])

    useEffect(()=> {
        if(uploadedVid) {
            loadVideoIntoPreview()
        }
    }, [uploadedVid])

    async function loadVideoIntoPreview() {
    if (!uploadedVid) return;
    const videoURL = URL.createObjectURL(uploadedVid);
    if (videoRef.current) {
        videoRef.current.src = videoURL;
        setVidSrc(videoURL);
        console.log("Video Loaded", videoURL);
    } else {
        console.error("Video not loaded")
    }
}


    function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        if(e.target.files) {
          setUploadedVid(e.target.files[0])
          if(!uploadedVid) return
          console.log("Video Uploaded")
        }
      }

    const load = async () => {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
        const ffmpeg = new FFmpeg();
        ffmpegRef.current = ffmpeg;
        ffmpeg.on('log', ({ message }: { message: string }) => {
            if(!messageRef.current) return
            messageRef.current.innerHTML = message;
            console.log(message);
        });

        // toBlobURL is used to bypass CORS issue, URLs with the same domain can be used directly.
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        setLoaded(true);
    };

    const trimVideo = async () => {
        const ffmpeg = ffmpegRef.current;
        if (!ffmpeg) return;
        const video = uploadedVid;
        if(!video) return;
        const arrayBuffer = await video.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        await ffmpeg.writeFile('input.mp4', uint8Array);
        if(!startRef.current || !endRef.current) {
            console.error("StartRef or EndRef Not Valid")
            return
        }
        const command = ['-ss', startRef.current.value, '-to', endRef.current.value,'-i', 'input.mp4', '-c', 'copy', 'output.mp4']
        console.log(command)
        await ffmpeg.exec(command);
        const data = await ffmpeg.readFile('output.mp4');
        if (videoRef.current) {
            let videoURL = URL.createObjectURL(new Blob([data], { type: 'video/mp4' }))
            videoRef.current.src = videoURL;
            setVidSrc(videoURL)
            console.log("Video Loaded", vidSrc)
        } 
    };

    return loaded ? (
        <main className='flex flex-col justify-evenly h-1/2 items-center'>
            {/* <Slider/> */}
            <input defaultValue={0} min={0} max={100} className='w-full' type="range" name="" id="" />
            <video className='w-full' ref={videoRef} controls></video>
            {/* {vidSrc ? <ReactPlayer url={vidSrc} controls={true}/> : null} */}
            <section>
                <label htmlFor="startTime">Start Time</label>
                <input ref={startRef} type="time" id='startTime' step="00.01"/>
                <label htmlFor="endTime">End Time</label>
                <input ref={endRef} type="time" id='endTime' step="00.01"/>
            </section>
            <section className="flex">
              <label className="rounded-xl px-2 py-2 cursor-pointer" htmlFor="UploadClip">Select Clip</label>
              <input onChange={handleFileChange} className="hidden" accept="video/*" type="file" name="uploadClip" id="UploadClip"/>
            </section>
            {uploadedVid ? <button className='rounded-xl px-2 py-2 cursor-pointer' onClick={trimVideo}>Trim Video</button> : null}
            <p ref={messageRef}></p>
        </main>
    ) : (
        <h3>Loading...</h3>
    );
}