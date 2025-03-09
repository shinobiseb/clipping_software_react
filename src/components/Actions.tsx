import { ChangeEvent } from 'react'

type ActionProps = {
  trimVideo: () => Promise<void>,
  handleFileChange: (e: ChangeEvent<HTMLInputElement>)=> void,
  timeStampSeconds: [number, number]
}

export default function Actions( { trimVideo, handleFileChange, timeStampSeconds } : ActionProps ) {
  return (
    <div className='flex flex-col items-center'>
      <span className='mt-4 text-sm'>Clip Length: <span className='loading-message'>{Math.round((timeStampSeconds[1]- timeStampSeconds[0])/1000)} seconds</span></span>
      <button className="prim-button mt-1" onClick={trimVideo}>Trim Video</button>
      <label className="sec-button" htmlFor="UploadClip">
        Select Another Clip
      </label>
      <input onChange={handleFileChange} className="hidden" accept="video/*" type="file" id="UploadClip" />
    </div>
  )
}
