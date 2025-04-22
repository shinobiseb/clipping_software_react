import { ChangeEvent, useState } from 'react'
import { FaScissors } from "react-icons/fa6";
import { MdOutlineReplay } from "react-icons/md";
import { RiSkipBackFill } from "react-icons/ri";
import { RiSkipForwardFill } from "react-icons/ri";
import { MdFileUpload } from "react-icons/md";
import { PacmanLoader } from 'react-spinners';
import { FaPlay } from "react-icons/fa";
import { FaPause } from "react-icons/fa6";

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
    reactVideo.currentTime = targetTime/1000;
    reactVideo.pause()
  }

  const [ loading, setLoading ] = useState(false)

  return loading ?
    <div>
      <PacmanLoader
        color='#D94100'
      />
    </div>
    : (
    <div className='flex flex-col items-center w-full'>
      <section className='flex flex-row w-full md:w-1/2 justify-evenly bg-black px-5 py-2 rounded-xl'>
        <button 
        onClick={()=> {
          seekClip(timeStampSeconds[0])
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
        onClick={()=> reactVideo?.pause()}
        className='clip-controls'
        >
          <FaPause />
        </button>
        <button 
        onClick={()=>playClip()}
        className='clip-controls'
        >
          <FaPlay size={12}/>
        </button>
        <button 
        onClick={()=> {
          seekClip(timeStampSeconds[1])
        }}
        className='clip-controls'> 
          <RiSkipForwardFill/>
        </button>
      </section>
      <section 
      className='w-full flex flex-col justify-center items-center'>
        <span 
        className='text-sm mt-3'>Clip Length: <span className='loading-message'>{Math.round((timeStampSeconds[1]- timeStampSeconds[0])/1000)} seconds</span></span>
      <button 
      className="prim-button mt-1 flex items-center justify-center w-full" onClick={()=>{
        trimVideo()
        setLoading(true)
        }}>
        <FaScissors 
        className='relative right-2'/> Trim Video
      </button>
      <label 
      className="sec-button flex items-center justify-center w-full" htmlFor="UploadClip">
        <MdFileUpload size={20} className='relative right-2'/>
        Another Clip
      </label>
      <input onChange={handleFileChange} className="hidden" accept="video/*" type="file" id="UploadClip"/>
      </section>
    </div>
  )
}
