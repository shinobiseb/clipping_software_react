import { useRef, useState, useEffect, ChangeEvent } from 'react';
import { toBlobURL } from '@ffmpeg/util';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import Slider from './Slider';
import ReactPlayer from 'react-player';
import { useDropzone } from 'react-dropzone'
import { useCallback } from 'react';

export default function WebAsem() {
  const [loaded, setLoaded] = useState<boolean>(false);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const messageRef = useRef<HTMLParagraphElement | null>(null);
  const [timestamps, setTimestamps] = useState<{ startTime: string; endTime: string }>({
    startTime: '00:00:00.0',
    endTime: '00:00:00.0',
  });
  const reactVideoComponentRef = useRef(null)
  const [timeStampSeconds, setTimeStampSeconds] = useState<[number, number]>([0,0])
  const [uploadedVidFile, setUploadedVidFile] = useState<File | null>(null);
  const [vidSrc, setVidSrc] = useState<string | null>(null);
  const [videoLength, setVideoLength] = useState<number>(0);
  const reactVideo = document.getElementById("ReactVideoOuterDiv")?.querySelector("video")
  const [activeThumb, setThumbs] = useState< "start" | "end" | "none">("start")
  const [ isPlaying, setIsPlaying  ] = useState<boolean>(false)
  const [ isMouseUp, setIsMouseUp  ] = useState<boolean>(false)
  const [ isMetaDataLoaded, setIsMetaDataLoaded] = useState<boolean>(false)
  const [ isClipTrimmed, setIsClipTrimmed ] = useState(false)

  //-------------- USEEFFECTS --------------------//
  useEffect(() => {
    loadFFMPEG();
    setIsMetaDataLoaded(false)
  }, []);

  useEffect(() => {
    if (uploadedVidFile) {
      loadVideoIntoPreview();
    }
  }, [uploadedVidFile]);

  useEffect(()=> {
    console.log(isPlaying)
  }, [isPlaying])

  useEffect(()=> {
    if(!reactVideo) return;
    clearTimeout(timeoutID)
    if(!isMouseUp){
      reactVideo.pause()
    } else {
      playUntilEnd()
    }
  }, [isMouseUp])

  useEffect(() => {
    function seekPlayhead() {
      if (!reactVideo) return;
      if (activeThumb === "start") {
        reactVideo.currentTime = timeStampSeconds[0] / 1000;
      } else {
        reactVideo.currentTime = (timeStampSeconds[1]/1000) - 3;
      }
    }

    if (activeThumb) {
      seekPlayhead();
    }
  }, [activeThumb, timeStampSeconds]);

  let timeoutID : ReturnType<typeof setTimeout> | undefined;

  // --------- Functions --------- //

  function playUntilEnd(){
    if(!reactVideo) return;
    if(activeThumb == "start") {
      reactVideo.play()
    } else {
      reactVideo.play()
    }
  }

  //Handle Dropped Files
  const onDrop = useCallback((acceptedFiles : Array<File>) => {
    handleFile(acceptedFiles)
  }, [])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop,

  })

  function stopAtEnd( seconds : number){
    if(!reactVideo) return
    if(seconds >= timeStampSeconds[1]/1000){
      reactVideo.pause()
    } else {
      console.log("Playhead:", seconds, "End Point:", timeStampSeconds[1]/1000)
    }
  }
  
  function setThumbsAndMouse(thumb :  "start" | "end", isMouseUp: boolean){
    setThumbs(thumb)
    setIsMouseUp(isMouseUp)
  }

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
      handleFile(e.target.files)
    }
  }

  function handleFile( files : FileList | File[]){
  const fileArray = files instanceof FileList ? Array.from(files) : files;
    if (fileArray.length > 0) {
      setUploadedVidFile(fileArray[0]);
      setIsClipTrimmed(false)
      console.log('Video Loaded for Clipping');
    }
  }

  function handleLoadedMetadata() {
    if (!videoRef.current) return
    if(Number.isNaN(videoRef.current.duration)) console.error("Video Length is NaN")
    setVideoLength(videoRef.current.duration);
    setIsMetaDataLoaded(true)
    console.log("Video Length: ", videoLength)
  }

  const loadFFMPEG = async () => {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    const ffmpeg = new FFmpeg();
    ffmpegRef.current = ffmpeg;
    ffmpeg.on('log', ({ message }: { message: string }) => {
      if (messageRef.current) {
        if (message === "Aborted()") {
          messageRef.current.innerHTML = "Clip Trim Completed!";
        } else {
          messageRef.current.innerHTML = message;
        }
      }
      console.log("FFmpeg log:", message);
    });

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    setLoaded(true);
  };

  const writeInputVideo = async (video:File) => {
    const ffmpeg = ffmpegRef.current;
    if(!ffmpeg) return;
    const arrayBuffer = await video.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    await ffmpeg.writeFile('input.mp4', uint8Array);
  }

  const trimVideo = async () => {
    const ffmpeg = ffmpegRef.current;
    if (!ffmpeg) return;
    const video = uploadedVidFile;
    if (!video) return;

    await writeInputVideo(video)

    if (!timestamps.startTime || !timestamps.endTime) {
      console.error('StartRef or EndRef Not Valid');
      console.table([timestamps.startTime, timestamps.endTime]);
      return;
    }

    const command = ['-ss', timestamps.startTime, '-to', timestamps.endTime, '-i', 'input.mp4', '-c', 'copy', 'output.mp4'];

    await ffmpeg.exec(command);
    const data = await ffmpeg.readFile('output.mp4');
    let videoURL = URL.createObjectURL(new Blob([data], { type: 'video/mp4' }));
    setVidSrc(videoURL);
    setIsClipTrimmed(true)
    console.log("Trimmed Video Loaded: ", vidSrc);
  };

  // -------------------------------------------- //
  // ---------------- Return -------------------- //
  // -------------------------------------------- //

  return loaded ? (
    <main {...getRootProps()} className="flex flex-col justify-center h-full w-full items-center">
      {
                isDragActive ?
                <section className='flex p-10 border rounded-lg transition-opacity opacity-50 h-full w-full items-center justify-center absolute top-0 right-0 z-10 bg-gray-800 bg-opacity-5'>
                  <p>Drop Files Here</p>
                </section> :
                null
              }
      {vidSrc ? 
      <section>
        <ReactPlayer 
        id="ReactVideoOuterDiv" 
        playing={false}
        url={vidSrc} 
        onProgress={(state)=> stopAtEnd(state.playedSeconds)}
        onPlay={()=> setIsPlaying(true)}
        onPause={()=> setIsPlaying(false)}
        controls={true}
        ref={reactVideoComponentRef}
        />
        {
          isClipTrimmed ? 
          null : 
          <Slider 
          videoPlayer={reactVideo}
          setThumbsAndMouse={setThumbsAndMouse} 
          timestamps={timeStampSeconds} 
          setTimeStampSeconds={setTimeStampSeconds} 
          setTimestamps={setTimestamps} 
          videoLength={videoLength}
          />
        }
        </section> : 
        null
      }
      <video 
      className="w-full hidden" 
      ref={videoRef} 
      controls 
      onLoadedMetadata={handleLoadedMetadata}>
      </video>
      {
        uploadedVidFile ? // ------------ if Statement ------------
        <div  className='flex w-full items-start justify-center'>
          { 
            isClipTrimmed ?
            <div  className='flex flex-col'>
              <p className='mt-3 text-center' ref={messageRef}>Trim Clipped!</p>
              <a 
              className='prim-button' 
              href={vidSrc ? vidSrc : undefined} 
              download>Download Clip</a>
              <label className="sec-button" htmlFor="UploadClip">
                Select Another Clip
              </label>
              <input onChange={handleFileChange} className="hidden" accept="video/*" type="file" id="UploadClip" />
            </div> :
            <div className='flex flex-col items-center'>
              
              <button className="prim-button mt-1" onClick={trimVideo}>Trim Video</button>
              <label className="sec-button" htmlFor="UploadClip">
                Select Another Clip
              </label>
              <input onChange={handleFileChange} className="hidden" accept="video/*" type="file" id="UploadClip" />
              <span className='mt-4 text-sm'>Video Length: <span className='loading-message'>{Math.round((timeStampSeconds[1]- timeStampSeconds[0])/1000)} seconds</span></span>
            </div>
          }
        </div> : // ------------ Else Statement ------------
          <div className='flex flex-col h-full w-full items-center justify-center'>
              {
                isDragActive ?
                  null :
                  <section>
                    <label className="sec-button" htmlFor="UploadClip">
                    Select A Clip
                    </label>
                    <input onChange={handleFileChange} className="hidden" accept="video/*" type="file" id="UploadClip" />
                    <input {...getInputProps()}/>
                  </section>
              }
          </div>
      }
      
    </main>
  ) : (
    <h3>Loading...</h3>
  );
}
