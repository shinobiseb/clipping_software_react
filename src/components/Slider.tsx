import { useEffect, useState } from 'react';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import '../assets/range-slider.css'

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
    if (thumbs.length < 2) return;

    const handleStartDown = () => setThumbsAndMouse("start", false);
    const handleStartUp = () => setThumbsAndMouse("start", true);
    const handleEndDown = () => setThumbsAndMouse("end", false);
    const handleEndUp = () => setThumbsAndMouse("end", true);

    const [startThumb, endThumb] = thumbs;

    startThumb.id = "startThumb";
    endThumb.id = "endThumb";

    startThumb.addEventListener("mousedown", handleStartDown);
    startThumb.addEventListener("mouseup", handleStartUp);
    endThumb.addEventListener("mousedown", handleEndDown);
    endThumb.addEventListener("mouseup", handleEndUp);

    return () => {
      startThumb.removeEventListener("mousedown", handleStartDown);
      startThumb.removeEventListener("mouseup", handleStartUp);
      endThumb.removeEventListener("mousedown", handleEndDown);
      endThumb.removeEventListener("mouseup", handleEndUp);
    };
  }, [setThumbsAndMouse]);

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
      />
    </div>
  );
}
