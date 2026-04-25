import ReactPlayer from 'react-player';
import Slider from './Slider';
import { motion } from 'framer-motion';

interface EditingProps {
  vidSrc: string;
  stopAtEnd: (seconds: number) => void;
  setIsPlaying: (playing: boolean) => void;
  reactVideoComponentRef: React.RefObject<ReactPlayer> | React.RefObject<null>;
  isClipTrimmed: boolean;
  setThumbsAndMouse: (thumb: "start" | "end", isMouseUp: boolean) => void;
  timeStampSeconds: [number, number];
  setTimeStampSeconds: React.Dispatch<React.SetStateAction<[number, number]>>;
  videoLength: number;
  setTimeStamps: React.Dispatch<React.SetStateAction<{ startTime: string; endTime: string }>>;
}

export default function Editing({
  vidSrc,
  stopAtEnd,
  reactVideoComponentRef,
  isClipTrimmed,
  setThumbsAndMouse,
  timeStampSeconds,
  setTimeStampSeconds,
  videoLength,
  setTimeStamps
}: EditingProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full sm:w-3/4 max-w-3xl">
      <div id="ReactVideoOuterDiv">
        <ReactPlayer
          key={vidSrc}
          ref={reactVideoComponentRef}
          url={vidSrc}
          width="100%"
          height="auto"
          controls
          onProgress={(state) => stopAtEnd(state.playedSeconds)}
          progressInterval={100}
        />
      </div>

      {!isClipTrimmed && (
        <Slider
          videoPlayer={reactVideoComponentRef.current?.getInternalPlayer() as HTMLVideoElement}
          setThumbsAndMouse={setThumbsAndMouse}
          timestamps={timeStampSeconds}
          setTimeStampSeconds={setTimeStampSeconds}
          setTimestamps={setTimeStamps}
          videoLength={videoLength}
        />
      )}
    </motion.div>
  );
}