import React from 'react'
import { ChangeEvent } from 'react'

type successProps = {
    vidSrc: string | null,
    messageRef: React.RefObject<HTMLParagraphElement | null>,
    handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void
}

export default function Success( { vidSrc, messageRef, handleFileChange } : successProps ) {
  return (
    <div  className='flex flex-col'>
      <p className='mt-3 text-center success-msg' ref={messageRef}>Trim Clipped!</p>
      <a 
      className='prim-button' 
      href={vidSrc ? vidSrc : undefined} 
      download>Download Clip</a>
      <label className="sec-button" htmlFor="UploadClip">
        Select Another Clip
      </label>
      <input onChange={handleFileChange} className="sr-only" accept="video/*" type="file" id="UploadClip" />
    </div>
  )
}
