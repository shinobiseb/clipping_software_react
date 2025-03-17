import { ChangeEvent } from 'react'
import { FaScissors } from "react-icons/fa6";
import { MdOutlineReplay } from "react-icons/md";
import { RiSkipBackFill } from "react-icons/ri";
import { RiSkipForwardFill } from "react-icons/ri";


type ActionProps = {
  trimVideo: () => Promise<void>,
  handleFileChange: (e: ChangeEvent<HTMLInputElement>)=> void,
  timeStampSeconds: [number, number],
  reactVideo: HTMLVideoElement | null | undefined;
}

export default function Actions( { 
  trimVideo, 
  handleFileChange, 
  timeStampSeconds,
  reactVideo
  } : ActionProps ) {

  function playClip(){
    if(!reactVideo) return;
    reactVideo.play()
  }

  function seekClip(targetTime : number){
    if(!reactVideo) return;
    reactVideo.currentTime = targetTime;
    reactVideo.pause()
  }

  return (
    <div className='flex flex-col items-center'>
      <section className='flex flex-row w-full justify-evenly'>
        <button 
        onClick={()=> {
          seekClip(timeStampSeconds[0])
          playClip()
        }}
        className='clip-controls'> 
          <RiSkipBackFill/>
        </button>
        <button 
        onClick={()=> {
          seekClip(timeStampSeconds[0])
          playClip()
        }}
        className='clip-controls'> 
          <MdOutlineReplay/>
        </button>
        
        <button 
        onClick={()=> {
          seekClip(timeStampSeconds[1])
          playClip()
        }}
        className='clip-controls'> 
          <RiSkipForwardFill/>
        </button>
      </section>
      
      <span className='text-sm mt-2'>Clip Length: <span className='loading-message'>{Math.round((timeStampSeconds[1]- timeStampSeconds[0])/1000)} seconds</span></span>
      <button className="prim-button mt-1 flex items-center justify-center w-full" onClick={trimVideo}>
        <FaScissors className='relative right-2'/> Trim Video
      </button>
      <label className="sec-button" htmlFor="UploadClip">
        Select Another Clip
      </label>
      <input onChange={handleFileChange} className="hidden" accept="video/*" type="file" id="UploadClip"/>
    </div>
  )
}
