import { ChangeEvent } from 'react'
import { DropzoneInputProps } from 'react-dropzone'

type heroProps = {
  handleFileChange: (e: ChangeEvent<HTMLInputElement>)=> void;
  getInputProps: <T extends DropzoneInputProps>(props?: T) => T
}

export default function Hero( { handleFileChange, getInputProps } : heroProps ) {
  return (
    <div className='flex flex-col w-full h-full items-center justify-center'>
        <h1 className='text-9xl font-bold '><span className='text-orange'>SP</span>Cut</h1>
        <p className='italic animate-pulse'>Drag a Clip or hit the "Select A Clip" button to get started</p>
        <label className="sec-button mt-3" htmlFor="UploadClip">
        Select A Clip
        </label>
        <input onChange={handleFileChange} className="hidden" accept="video/*" type="file" id="UploadClip" />
        <input {...getInputProps()}/>
    </div>
  )
}
