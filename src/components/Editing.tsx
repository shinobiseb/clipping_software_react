import React from 'react'
import ReactPlayer from 'react-player'
import Slider from './Slider'

type editingProps = {
    vidSrc: string,
    stopAtEnd(seconds: number): void,
    setIsPlaying: (value: React.SetStateAction<boolean>) => void,
    reactVideoComponentRef: React.RefObject<null>,
    isClipTrimmed: boolean, 
    reactVideo: HTMLVideoElement | null | undefined,
    setThumbsAndMouse: (thumb: "start" | "end", isMouseUp: boolean) => void,
    timeStampSeconds: [number, number];
    setTimeStampSeconds:React.Dispatch<React.SetStateAction<[number, number]>>;
    videoLength: number;
    setTimeStamps: React.Dispatch<React.SetStateAction<{
        startTime: string;
        endTime: string;
    }>>

}

export default function Editing( { 
    vidSrc, 
    stopAtEnd, 
    setIsPlaying, 
    reactVideoComponentRef,
    isClipTrimmed,
    reactVideo,
    setThumbsAndMouse,
    timeStampSeconds,
    setTimeStampSeconds,
    videoLength,
    setTimeStamps
}: 
    editingProps ) {

  return (
    <section className=''>
        <ReactPlayer 
        id="ReactVideoOuterDiv" 
        width={"100%"}
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
          setTimestamps={setTimeStamps} 
          videoLength={videoLength}
          />
        }
        </section>
  )
}
