import React from 'react'

export default function Hero() {
  return (
    <div className='flex flex-col w-full h-full items-center my-3'>
        <h1 className='text-9xl font-bold '><span className='text-orange'>SP</span>Cut</h1>
        <p className='italic animate-pulse'>Drag a Clip or hit the "Select A Clip" button to get Started</p>
    </div>
  )
}
