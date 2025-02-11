import { useRef, useState, useEffect, ChangeEvent } from 'react';
import { toBlobURL } from '@ffmpeg/util';
import { FFmpeg } from '@ffmpeg/ffmpeg';

export default function WebAsem() {
    const [loaded, setLoaded] = useState<boolean>(false);
    const ffmpegRef = useRef<FFmpeg | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const messageRef = useRef<HTMLParagraphElement | null>(null);
    const [uploadedVid, setUploadedVid] = useState<File | null>(null)

    useEffect(()=> {
        load()
    }, [])

    function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        if(e.target.files) {
          setUploadedVid(e.target.files[0])
          if(!uploadedVid) return
          console.log(uploadedVid.name, uploadedVid.name)
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

    const transcode = async () => {
        const ffmpeg = ffmpegRef.current;
        if (!ffmpeg) return;
        if(!uploadedVid) console.error("No Video");
        
        const video = uploadedVid;
        if(!video) return;
        const arrayBuffer = await video.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        await ffmpeg.writeFile('input.webm', uint8Array);
        await ffmpeg.exec(['-i', 'input.webm', 'output.mp4']);
        const data = await ffmpeg.readFile('output.mp4');
        
        if (videoRef.current) {
            videoRef.current.src = URL.createObjectURL(new Blob([data], { type: 'video/mp4' }));
        }
    };

    return loaded ? (
        <main className='flex flex-col justify-evenly h-1/2 items-center'>
            <section className="flex">
              <label className="rounded-xl px-2 py-2 cursor-pointer" htmlFor="UploadClip">Select Clip</label>
              <input onChange={handleFileChange} className="hidden" accept="video/*" type="file" name="uploadClip" id="UploadClip"/>
            </section>
            <video ref={videoRef} controls></video><br />
            {uploadedVid ? <button onClick={transcode}>Transcode webm to mp4</button> : <p>Upload Video to Continue</p>}
            
            <p ref={messageRef}></p>
        </main>
    ) : (
        <h3>Loading...</h3>
    );
}