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
  setThumbs: React.Dispatch<React.SetStateAction<"start" | "end" | "none">>;
  videoPlayer: HTMLVideoElement | null | undefined;
};

export default function Slider({ videoPlayer,setThumbs, videoLength, setTimestamps, setTimeStampSeconds }: SliderProps) {
  const [range, setRange] = useState<[number, number]>([0, videoLength * 1000]);

  useEffect(() => {
    const thumbs = document.querySelectorAll(".range-slider__thumb");
    
    if (thumbs.length >= 2) {
      thumbs[0].id = "startThumb";
      thumbs[1].id = "endThumb"; 

      const startThumb = document.getElementById("startThumb");
      const endThumb = document.getElementById("endThumb");

      if(startThumb){
        startThumb.addEventListener("mousedown", ()=>setThumbs("start"));
        startThumb.addEventListener("mouseup", ()=>setThumbs("start"));
      }
      if(endThumb){
        endThumb.addEventListener("mousedown", ()=> setThumbs("end"));
        endThumb.addEventListener("mouseup", ()=> setThumbs("end"));
      }

      return () => {
        if (startThumb) {
          startThumb.removeEventListener("mouseup", ()=>setThumbs("start"));
          startThumb.removeEventListener("mousedown", ()=>setThumbs("start"));
        }
        if (endThumb){
          endThumb.removeEventListener("mousedown", ()=> setThumbs("end"));
          endThumb.removeEventListener("mouseup", ()=> setThumbs("end"));
        } 
      };
    }
  }, []);

  // Update range when videoLength changes
  useEffect(() => {
    setRange([0, videoLength * 1000]);
  }, [videoLength]);

  function handleThumbs(){
    
  }

  function handleRange(value: [number, number]) {
    let startValue = value[0];
    let endValue = value[1];

    if(endValue - startValue <= 1000) {
      console.log(startValue - endValue)
      endValue = endValue + 1000
    }

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
