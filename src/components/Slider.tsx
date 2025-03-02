import { useEffect, useState } from 'react';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';

type SliderProps = {
  videoLength: number;
  setTimeStampSeconds: React.Dispatch<React.SetStateAction<[number, number]>>;
  setTimestamps: React.Dispatch<
    React.SetStateAction<{
      startTime: string;
      endTime: string;
    }>
  >;
  timestamps: [number, number];
  setThumbsAndMouse: (thumb: "start" | "end", isMouseUp: boolean) => void;
  videoPlayer: HTMLVideoElement | null | undefined;
};

export default function Slider({ setThumbsAndMouse, videoLength, setTimestamps, setTimeStampSeconds }: SliderProps) {
  const [range, setRange] = useState<[number, number]>([0, videoLength * 1000]);

  useEffect(() => {
    const thumbs = document.querySelectorAll(".range-slider__thumb");
    
    if (thumbs.length >= 2) {
      thumbs[0].id = "startThumb";
      thumbs[1].id = "endThumb"; 

      const startThumb = document.getElementById("startThumb");
      const endThumb = document.getElementById("endThumb");

      if(startThumb){
        startThumb.addEventListener("mousedown", ()=>setThumbsAndMouse("start", false));
        startThumb.addEventListener("mouseup", ()=>setThumbsAndMouse("start", true));
      }
      if(endThumb){
        endThumb.addEventListener("mousedown", ()=> setThumbsAndMouse("end", false));
        endThumb.addEventListener("mouseup", ()=> setThumbsAndMouse("end", true));
      }

      return () => {
        if (startThumb) {
          startThumb.removeEventListener("mouseup", ()=>setThumbsAndMouse("start", true));
          startThumb.removeEventListener("mousedown", ()=>setThumbsAndMouse("start", false));
        }
        if (endThumb){
          endThumb.removeEventListener("mousedown", ()=> setThumbsAndMouse("end", false));
          endThumb.removeEventListener("mouseup", ()=> setThumbsAndMouse("end", true));
        } 
      };
    }
  }, []);

  // Update range when videoLength changes
  useEffect(() => {
    setRange([0, videoLength * 1000]);
  }, [videoLength]);

  function handleRange(value: [number, number]) {
    let startValue = value[0];
    let endValue = value[1];

    const start = msToTime(startValue);
    const end = msToTime(endValue);

    setRange(value); // Update state
    setTimestamps({ startTime: start, endTime: end });
    setTimeStampSeconds([startValue, endValue])
  }

  function msToTime(duration: number) {
    let milliseconds: string = Math.floor((duration % 1000) / 100).toString();
    let seconds: string = Math.floor((duration / 1000) % 60).toString();
    let minutes: string = Math.floor((duration / (1000 * 60)) % 60).toString();
    let hours: string = Math.floor((duration / (1000 * 60 * 60)) % 24).toString();

    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}.${milliseconds}`;
  }

  return (
    <div className="w-full flex flex-col items-center">
      <RangeSlider
        min={0}
        max={videoLength * 1000}
        onInput={handleRange}
        onRangeDragEnd={()=>handleRange}
        value={range}
        step={1}
        className="py-5 my-2"
      />
    </div>
  );
}
