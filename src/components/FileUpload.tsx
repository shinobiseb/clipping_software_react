import { ChangeEvent, useEffect, useRef, useState } from "react"
import "../index.css"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"

export default function FileUpload() {

  type statusType = 'idle' | 'uploading' | 'error' | 'success'

  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<statusType>('idle')
  const [ready, setReady] = useState(false)

  const ffmpegRef = useRef(new FFmpeg())

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if(e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const loadFFmpeg = async ()=> {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm'

    const ffmpeg = ffmpegRef.current;
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    setReady(true);
  }

  useEffect(()=>{
    loadFFmpeg();
  },[])

  return (
    <div className=' w-1/2 flex h-70 bg-darkblue flex-col p-10 items-center justify-center'>
        <h3 className='mb-3'>Upload Clip here</h3>
        <ul className='flex justify-around w-full px-5'>
            <section className="flex">
              <label className="rounded-xl px-2 py-2 cursor-pointer" htmlFor="UploadClip">Select Clip</label>
              <input onChange={handleFileChange} className="hidden" accept="video/*" type="file" name="uploadClip" id="UploadClip"/>
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
        <button className="rounded-xl px-2 py-2" id='submit'>Submit Clip</button>
        }
    </div>
  )
}
