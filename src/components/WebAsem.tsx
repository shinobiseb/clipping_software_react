import { useRef, useState } from 'react';
import { toBlobURL } from '@ffmpeg/util';
import { FFmpeg } from '@ffmpeg/ffmpeg';

export default function WebAsem() {
    const [loaded, setLoaded] = useState<boolean>(false);
    const ffmpegRef = useRef<FFmpeg | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const messageRef = useRef<HTMLParagraphElement | null>(null);

    const load = async () => {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
        const ffmpeg = new FFmpeg();
        ffmpegRef.current = ffmpeg;
        
        ffmpeg.on('log', ({ message }: { message: string }) => {
            if (messageRef.current) {
                messageRef.current.innerHTML = message;
                console.log(message);
            }
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
        
        const response = await fetch('https://raw.githubusercontent.com/ffmpegwasm/testdata/master/Big_Buck_Bunny_180_10s.webm');
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        await ffmpeg.writeFile('input.webm', uint8Array);
        await ffmpeg.exec(['-i', 'input.webm', 'output.mp4']);
        const data = await ffmpeg.readFile('output.mp4');
        
        if (videoRef.current) {
            videoRef.current.src = URL.createObjectURL(new Blob([data], { type: 'video/mp4' }));
        }
    };

    return loaded ? (
        <>
            <video ref={videoRef} controls></video><br />
            <button onClick={transcode}>Transcode webm to mp4</button>
            <p ref={messageRef}></p>
            <p>Open Developer Tools (Ctrl+Shift+I) to View Logs</p>
        </>
    ) : (
        <button onClick={load}>Load ffmpeg-core (~31 MB)</button>
    );
}