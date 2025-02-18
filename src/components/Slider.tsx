import { useEffect, useState } from 'react';
import RangeSlider from 'react-range-slider-input';
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
  const [range, setRange] = useState<[number, number]>([0, videoLength * 1000]);

  // Update range when videoLength changes
  useEffect(() => {
    setRange([0, videoLength * 1000]);
  }, [videoLength]);

  function handleRange(value: [number, number]) {
    const start = msToTime(value[0]);
    const end = msToTime(value[1]);

    setRange(value); // Update state
    setTimestamps({ startTime: start, endTime: end });
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
        value={range}
        step={1}
        className="py-5 my-2"
      />
    </div>
  );
}
