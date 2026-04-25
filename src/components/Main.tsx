import { useRef, useState, useEffect, ChangeEvent } from 'react';
import { toBlobURL } from '@ffmpeg/util';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { useDropzone } from 'react-dropzone'
import { useCallback } from 'react';
import Hero from './Hero';
import DropZone from './DropZone';
import Editing from './Editing';
import Success from './Success';
import Actions from './Actions';
import { PacmanLoader } from 'react-spinners';

export default function Main() {
  const [loaded, setLoaded] = useState<boolean>(false);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const messageRef = useRef<HTMLParagraphElement | null>(null);
  const [timestamps, setTimestamps] = useState<{ startTime: string; endTime: string }>({
    startTime: '00:00:00.0',
    endTime: '00:00:00.0',
  });

  const reactVideoComponentRef = useRef(null);
  const [timeStampSeconds, setTimeStampSeconds] = useState<[number, number]>([0,0]);
  const [uploadedVidFile, setUploadedVidFile] = useState<File | null>(null);
  const [vidSrc, setVidSrc] = useState<string | null>(null);
  const [videoLength, setVideoLength] = useState<number>(0);
  const reactVideo = document.getElementById("ReactVideoOuterDiv")?.querySelector("video")
  const [ activeThumb, setThumbs] = useState< "start" | "end" | "none">("start")
  const [ isPlaying, setIsPlaying  ] = useState<boolean>(false)
  const [ isMouseUp, setIsMouseUp  ] = useState<boolean>(false)
  const [ isMetaDataLoaded, setIsMetaDataLoaded] = useState<boolean>(false)
  const [ isClipTrimmed, setIsClipTrimmed ] = useState(false)
  const [ isErrorTrimming, setIsErrorTrimming ] = useState(false)
  const [ videoFileType, setVideoFileType ] = useState<"mp4" | "mkv" | "mov" | "webm" >("mp4")

  //------------------------------------------//
  //-------------- USEEFFECTS ----------------//
  //------------------------------------------//

  useEffect(() => {
    loadFFMPEG();
    setIsMetaDataLoaded(false)
    console.log("Is MetaDataLoaded?: ", isMetaDataLoaded)
  }, []);

  useEffect(() => {
    if (uploadedVidFile) {
      loadVideoIntoPreview();
      console.log("Video File Type: ", videoFileType)
    }
    console.log("Is Playing?: ", isPlaying)
  }, [uploadedVidFile]);

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
  }, [handleFile])

  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'video/*': ['.mp4', '.mkv', '.mov', '.webm']
    },
    noClick: true,
  })

  function stopAtEnd( seconds : number){
    if(!reactVideo) return
    if(Math.round((timeStampSeconds[1]- timeStampSeconds[0])/1000) === 0) return
    if(seconds >= timeStampSeconds[1]/1000){
      reactVideo.pause()
    }
    return
  }
  
  function setThumbsAndMouse(thumb :  "start" | "end", isMouseUp: boolean){
    setThumbs(thumb)
    setIsMouseUp(isMouseUp)
  }

  async function loadVideoIntoPreview() {
    if (!uploadedVidFile) return;
    const videoURL = URL.createObjectURL(uploadedVidFile);
    console.log("Load Video into Preview Fired!")
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

  function handleFile(files: FileList | File[]) {
    const fileArray = files instanceof FileList ? Array.from(files) : files;
    
    if (fileArray.length > 0) {
      const file = fileArray;
      const detectedType = parseVideoType(file[0].type);
      console.log("New Type determined:", detectedType);
      setUploadedVidFile(file[0]);
      setVideoFileType(detectedType); 
      setIsClipTrimmed(false);
    }
  }

  function handleLoadedMetadata() {
    if (!videoRef.current) return
    if(Number.isNaN(videoRef.current.duration)) console.error("Video Length is NaN")
    setVideoLength(videoRef.current.duration);
    setIsMetaDataLoaded(true)
    console.log("Video Length: ", videoLength)
  }

  type VideoExtension = "mp4" | "mkv" | "mov" | "webm";

  function parseVideoType(type: string): VideoExtension {
    const subType = type.split('/');

    const mimeMap: Record<string, VideoExtension> = {
      'mp4': 'mp4',
      'x-matroska': 'mkv',
      'quicktime': 'mov',
      'webm': 'webm',
      'x-webm': 'webm' 
    };
  
    const result = mimeMap[subType[1]];
    console.log("MIME TYPE: ",result)
  
    if (!result) {
      console.error("Unsupported MIME type: ", type);
      throw new Error(`Unsupported video type: ${type}`);
    }
  
    return result;
  }

  const loadFFMPEG = async () => {
    if (ffmpegRef.current) return;

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    const ffmpeg = new FFmpeg();
    
    ffmpeg.on('log', ({ message }) => {
      console.log(message)
      if (message.includes("smaller")) {
        setIsErrorTrimming(true);
      }
    });

    try {
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      ffmpegRef.current = ffmpeg;
      setLoaded(true);
    } catch (err) {
      console.error("FFmpeg Load Error:", err);
    }
  };

  const writeInputVideo = async (video:File) => {
    const ffmpeg = ffmpegRef.current;
    if(!ffmpeg) return;
    const arrayBuffer = await video.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    await ffmpeg.writeFile(`input.${videoFileType}`, uint8Array);
  }

  const trimVideo = async () => {
    const ffmpeg = ffmpegRef.current;
    const video = uploadedVidFile;
    if (!ffmpeg || !video || !videoFileType) return;

    await writeInputVideo(video);

    const inputName = `input.${videoFileType}`;
    const outputName = `output.${videoFileType}`;

    let command = [
      '-ss', timestamps.startTime,
      '-to', timestamps.endTime,
      '-i', inputName,
      '-c', 'copy'
    ];

    command.push(outputName);

    await ffmpeg.exec(command);

    const data = await ffmpeg.readFile(outputName);

    // Map your state to the standard MIME subtypes
    const mimeMap: Record<string, string> = {
      mp4: 'video/mp4',
      webm: 'video/webm',
      mov: 'video/quicktime',
      mkv: 'video/x-matroska',
    };

    const mimeType = mimeMap[videoFileType] || 'video/mp4'; 

    const videoBlob = new Blob([data as BlobPart], { type: mimeType });
    const videoURL = URL.createObjectURL(videoBlob);

    setVidSrc(videoURL);
    setIsClipTrimmed(true);
  };

  return loaded ? (
    <main {...getRootProps()} 
    className="flex flex-col justify-center h-full w-full items-center main-cont">
      {
        isDragActive ?
        <DropZone/> :
        null
      }
      {
      vidSrc ? 
      <Editing
      vidSrc={vidSrc}
      stopAtEnd={stopAtEnd}
      setIsPlaying={setIsPlaying}
      reactVideoComponentRef={reactVideoComponentRef}
      isClipTrimmed={isClipTrimmed}
      setThumbsAndMouse={setThumbsAndMouse}
      timeStampSeconds={timeStampSeconds}
      videoLength={videoLength}
      setTimeStamps={setTimestamps}
      setTimeStampSeconds={setTimeStampSeconds}
      /> : 
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
        <div className='sm: w-1/3 flex flex-col justify-center items-center'>
          { 
            isErrorTrimming ?
            <div>
              Error
            </div> :
            isClipTrimmed ?
              <Success
              outputType={videoFileType}
              vidSrc={vidSrc}
              messageRef={messageRef}
              handleFileChange={handleFileChange}
              />
              :
              <Actions
              timeStampSeconds={timeStampSeconds}
              handleFileChange={handleFileChange}
              trimVideo={trimVideo}
              reactVideo={reactVideo}
              />
          }
        </div> : // ------------ Else Statement ------------
          <div className='flex flex-col h-full w-full items-center justify-center'>
            {
              isDragActive ?
              null :
              <Hero
              handleFileChange={handleFileChange}
              getInputProps={getInputProps}
              />
            }
          </div>
      }
      
    </main>
  ) : (
    <PacmanLoader
        color='#D94100'
    />
  );
}
