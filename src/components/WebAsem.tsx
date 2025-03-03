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

  useEffect(() => {
    handleLoadedMetadata()
  }, [isMetaDataLoaded]);

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

  function playUntilEnd(){
    if(!reactVideo) return;
    if(activeThumb == "start") {
      reactVideo.play()
    } else {
      reactVideo.play()
    }
  }

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
      setIsClipTrimmed(false)
      setUploadedVidFile(e.target.files[0]);
      console.log('Video Uploaded');
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
      // Log messages to the console as well
      console.log("FFmpeg log:", message);
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

    await ffmpeg.exec(command);
    const data = await ffmpeg.readFile('output.mp4');
    if (!videoRef.current) {
      console.log("No videoRef: ", videoRef.current)
      return
    }
      let videoURL = URL.createObjectURL(new Blob([data], { type: 'video/mp4' }));
      setVidSrc(videoURL);
      setIsClipTrimmed(true)
      console.log('Video Loaded', vidSrc);
  };

  return loaded ? (
    <main className="flex flex-col justify-evenly h-1/2 items-center ">
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
      </section> : null}
      <video 
      className="w-full hidden" 
      ref={videoRef} 
      controls 
      onLoadedMetadata={handleLoadedMetadata}>
      </video>
      {uploadedVidFile ? // ------------ if Statement ------------
        <div>
            { isClipTrimmed ?
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
              <span className='mt-4 text-sm'>Video Length: <span className='loading-message'>{Math.round((timeStampSeconds[1]- timeStampSeconds[0])/1000+1)} seconds</span></span>
            </div>
            }
        </div> : // ------------ Else Statement ------------
        <div>
          <label className="prim-button" htmlFor="UploadClip">
          Select A Clip
          </label>
          <input onChange={handleFileChange} className="hidden" accept="video/*" type="file" id="UploadClip"/>
        </div>
      }
      
    </main>
  ) : (
    <h3>Loading...</h3>
  );
}
