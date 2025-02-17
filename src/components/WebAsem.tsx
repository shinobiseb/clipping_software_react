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
    const startRef = useRef<HTMLInputElement | null>(null);
    const endRef = useRef<HTMLInputElement | null>(null);
    const [uploadedVidFile, setUploadedVidFile] = useState<File | null>(null)
    const [vidSrc, setVidSrc] = useState<string | null>(null)
    const [videoLength, setVideoLength] = useState<number>(0)

    useEffect(()=> {
        load()
    }, [])

    useEffect(()=> {
        if(uploadedVidFile) {
            loadVideoIntoPreview()
            
        }
        
    }, [uploadedVidFile])

    async function loadVideoIntoPreview() {
        if (!uploadedVidFile) return;
        const videoURL = URL.createObjectURL(uploadedVidFile);
        if (videoRef.current) {
            videoRef.current.src = videoURL;
            videoRef.current
            setVidSrc(videoURL);
            console.log("Video Loaded", videoURL);
        } else {
            console.error("Video not loaded")
        }
    }


    function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        if(e.target.files) {
          setUploadedVidFile(e.target.files[0])
          if(!uploadedVidFile) return
          console.log("Video Uploaded")
        }
      }

    function handleSlider(e: ChangeEvent<HTMLInputElement>){
        const ms = Number(e.target.value);
        const time = msToTime(ms);
        console.log(time)
    }

    function handleLoadedMetadata(){
        if(videoRef.current){
            setVideoLength(videoRef.current?.duration)
        }
    }

    function msToTime(duration : number) {
        let milliseconds = Math.floor((duration % 1000) / 100);
        let seconds = Math.floor((duration / 1000) % 60);
        let minutes = Math.floor((duration / (1000 * 60)) % 60);
        let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

        hours = (hours < 10) ? 0 + hours : hours;
        minutes = (minutes < 10) ? 0 + minutes : minutes;
        seconds = (seconds < 10) ? 0 + seconds : seconds;

        return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
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
        const video = uploadedVidFile;
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
            <input onChange={handleSlider} defaultValue={0} min={0} max={videoLength*1000} className='w-1/4' type="range" name="" id=""/>
            <video 
            className='w-full hidden' 
            ref={videoRef} 
            controls
            onLoadedMetadata={handleLoadedMetadata}
            ></video>
            {vidSrc ? <ReactPlayer url={vidSrc} controls={true}/> : null}
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
            {uploadedVidFile ? <button className='rounded-xl px-2 py-2 cursor-pointer' onClick={trimVideo}>Trim Video</button> : null}
            <p ref={messageRef}></p>
        </main>
    ) : (
        <h3>Loading...</h3>
    );
}