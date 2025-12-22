import { ChangeEvent } from 'react'
import { DropzoneInputProps } from 'react-dropzone'
import { MdFileUpload } from "react-icons/md";
import { MdContactPage } from "react-icons/md";

type heroProps = {
  handleFileChange: (e: ChangeEvent<HTMLInputElement>)=> void;
  getInputProps: <T extends DropzoneInputProps>(props?: T) => T
}

export default function Hero( { handleFileChange, getInputProps } : heroProps ) {
  return (
    <div className='flex flex-col w-full h-full items-center justify-center'>
        <h1 className='text-7xl sm:text-9xl font-bold '><span className='text-orange'>SP</span>Cut</h1>
        <p className='px-10 text-sm text-center italic sm:animate-pulse'>Drag a Clip or hit the "Select A Clip" button to get started</p>
        <label className="sec-button mt-3 flex flex-row items-center justify-center" htmlFor="UploadClip">
          <MdFileUpload size={20} className='relative right-2'/>
        Select A Clip
        </label>
        <input onChange={handleFileChange} className="hidden" accept="video/*" type="file" id="UploadClip" />
        <input {...getInputProps()}/>
        <a href="https://www.sebpatin.com/" className='absolute top-10 right-10'><MdContactPage size={50} color=''/></a>
    </div>
  )
}
