import { ChangeEvent, useRef, useState } from 'react';
import RangeSlider from 'react-range-slider-input'
import 'react-range-slider-input/dist/style.css'

type SliderProps = {
  videoLength: number;
  setTimestamps: React.Dispatch<
    React.SetStateAction<{
      startTime: string;
      endTime: string;
    }>
  >;
};

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

export default function Slider({ videoLength, setTimestamps }: SliderProps) {
  // const startRef = useRef<HTMLInputElement | null>(null);
  // const endRef = useRef<HTMLInputElement | null>(null);
  const [values, setValues] = useState([0,100])

  const handleThumbDragStart = (index : number) => {
    console.log("Dragging thumb index:", index);
    console.log("Current value of thumb:", values[index]);
  };

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
      className='py-5 my-3' 
      min={0} 
      max={videoLength * 1000}/>

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
