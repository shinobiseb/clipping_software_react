import { ChangeEvent, ChangeEventHandler, useRef, useState } from 'react';
import RangeSlider, { InputEventHandler } from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';

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

  function handleRange(value: [number, number]) {
    let start = msToTime(value[0]);
    let end = msToTime(value[1]);

    console.log("Start: ", start, "End: ", end)

    setTimestamps({ startTime: start, endTime: end })
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
      <RangeSlider
        min={0}
        max={videoLength * 1000}
        onInput={handleRange}
        step={1}
        className='py-5 my-2'
      />
    </div>
  );
}
