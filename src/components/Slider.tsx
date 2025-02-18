import { ChangeEvent, useRef, useState } from 'react';
import MultiRangeSlider, { ChangeResult } from 'multi-range-slider-react';

type SliderProps = {
  videoLength: number;
  setTimestamps: React.Dispatch<
    React.SetStateAction<{
      startTime: string;
      endTime: string;
    }>
  >;
};

export default function Slider({ videoLength, setTimestamps }: SliderProps) {

  function setVideoTimeStampFunction(
    timeId: 'startTime' | 'endTime',
    time: string,
    setFun: React.Dispatch<
      React.SetStateAction<{
        startTime: string;
        endTime: string;
      }>
    >
  ) {
    setFun((prev) => ({
      ...prev,
      [timeId]: time,
    }));
  }


  function handleSlider(e: ChangeEvent<HTMLInputElement>) {
    const ms = Number(e.target.value);
    const time = msToTime(ms);

    console.log(time)

    if (e.target.id === 'startSlider') {
      setVideoTimeStampFunction('startTime', time, setTimestamps);
    } else if (e.target.id === 'endSlider') {
      setVideoTimeStampFunction('endTime', time, setTimestamps);
    }
  }

  function handleRange(e: ChangeResult){
    let start = msToTime(e.minValue);
    let end = msToTime(e.maxValue);

    setTimestamps((prev) => {
      if (prev.startTime === start && prev.endTime === end) {
        return prev; // Prevents re-render if values haven't changed
      }
      return { startTime: start, endTime: end };
    })
    console.log(start, end)
  }

  function msToTime(duration: number) {
    let milliseconds: string = Math.floor((duration % 1000) / 100).toString();
    let seconds: string = Math.floor((duration / 1000) % 60).toString();
    let minutes: string = Math.floor((duration / (1000 * 60)) % 60).toString();
    let hours: string = Math.floor((duration / (1000 * 60 * 60)) % 24).toString();

    hours = hours.padStart(2, '0');
    minutes = minutes.padStart(2, '0');
    seconds = seconds.padStart(2, '0');

    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  return (
    <div className="w-full justify-center flex flex-col items-center">
      <MultiRangeSlider
        label='false'
        ruler='false'
        canMinMaxValueSame={false}
        min={0}
        max={videoLength*1000}
        step={1}
        onInput={handleRange}
        className='w-full border-0'
        barLeftColor='white'
        barRightColor='white'
        barInnerColor='green'
        id='Slider'
      />
      {/* <input
        ref={startRef}
        onChange={handleSlider}
        defaultValue={0}
        min={0}
        max={videoLength * 1000}
        className="w-full"
        type="range"
        id="startSlider"
      />
      <input
        ref={endRef}
        onChange={handleSlider}
        defaultValue={0}
        min={0}
        max={videoLength * 1000}
        className="w-full"
        type="range"
        id="endSlider"
      /> */}
    </div>
  );
}
