import { ChangeEvent, useState } from "react"
import "../index.css"

export default function FileUpload() {

  type statusType = 'idle' | 'uploading' | 'error' | 'success'

  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<statusType>('idle')

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if(e.target.files) {
      setFile(e.target.files[0])
    }
  }

  function fileSave(){
    
  }

  return (
    <div className=' w-1/2 flex h-70 bg-darkblue flex-col p-10 items-center justify-center'>
        <h3 className='mb-3'>Upload Clip here</h3>
        <ul className='flex justify-around w-full px-5'>
            <section className="flex">
              <label className="rounded-xl px-2 py-2 cursor-pointer" htmlFor="UploadClip">Select Clip</label>
              <input onChange={handleFileChange} className="hidden" accept="video/*" type="file" name="uploadClip" id="UploadClip" />
            </section>
        </ul>
        {file && (
          <div>
            <p>File name: {file.name}</p>
            <p>Size: {(file.size / 1024).toFixed(2)}KB</p>
            <p>Type: {file.type}</p>
          </div>
        )}
        {file && status !== 'uploading' && 
        <button onClick={fileSave} className="rounded-xl px-2 py-2" id='submit'>Submit Clip</button>
        }
    </div>
  )
}
