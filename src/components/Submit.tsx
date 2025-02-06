import React from 'react'
import "../index.css"

export default function Submit() {
  return (
    <div className=' w-1/2 border flex h-50 bg-darkblue flex-col p-10 items-center justify-center'>
        <h3 className='mb-3'>Upload Clip here</h3>
        <ul className='flex justify-around w-full px-10'>
            <button id='uploadButton'>Select Clip</button>
            <button id='submit'>Submit Clip</button>
        </ul>
    </div>
  )
}
