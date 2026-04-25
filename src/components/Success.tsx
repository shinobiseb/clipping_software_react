import React, { useState } from 'react'
import { ChangeEvent } from 'react'
import { MdDownload } from "react-icons/md";
import { MdFileUpload } from 'react-icons/md';

type successProps = {
    vidSrc: string | null,
    messageRef: React.RefObject<HTMLParagraphElement | null>,
    handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void
}



export default function Success( { vidSrc, messageRef, handleFileChange } : successProps ) {

  const [ clipName, setClipName ] = useState("output")

  const handleClipNameChange = ( e: ChangeEvent<HTMLInputElement>) => {
    setClipName(e.target.value)
  }

  return (
    <div  className='flex flex-col justify-center'>
      <p className='mt-3 text-center success-msg' ref={messageRef}>Clip Trimmed!</p>
      <input 
      onChange={handleClipNameChange}
      type="text" 
      name="clipName" 
      id="" 
      placeholder='Type Clip Name...' 
      className='border border-orange rounded-md px-2 py-1 w-full mt-2'/>
      <a 
      className='prim-button flex items-center justify-center' 
      href={vidSrc ? vidSrc : undefined} 
      download={`${clipName}`}
      >
      <MdDownload size={20} className='relative right-1'/>
      Download Clip</a>
      <label className="sec-button flex items-center justify-center" htmlFor="UploadClip">
        <MdFileUpload size={20} className='relative right-2'/>
        Another Clip
      </label>
      <input onChange={handleFileChange} className="sr-only" accept="video/*" type="file" id="UploadClip" />
    </div>
  )
}
