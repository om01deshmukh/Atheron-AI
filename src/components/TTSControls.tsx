"use client";

import { useTTS } from "@/hooks/useTTS";
import { Play, Pause, Square, Volume2 } from "lucide-react";

interface TTSControlsProps {
  text: string;
}

export default function TTSControls({ text }: TTSControlsProps) {
  const {
    start,
    pause,
    resume,
    stop,
    isSpeaking,
    isPaused,
    rate,
    setRate,
  } = useTTS(text);

  return (
    <div className="flex items-center gap-2 mt-2 text-gray-400">
      {!isSpeaking && (
        <button
          onClick={start}
          title="Read aloud"
          className="hover:text-[#20b8cd] transition-colors p-1"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      )}

      {isSpeaking && !isPaused && (
        <button
          onClick={pause}
          title="Pause"
          className="hover:text-[#20b8cd] transition-colors p-1"
        >
          <Pause className="w-4 h-4" />
        </button>
      )}

      {isSpeaking && isPaused && (
        <button
          onClick={resume}
          title="Resume"
          className="hover:text-[#20b8cd] transition-colors p-1"
        >
          <Play className="w-4 h-4" />
        </button>
      )}

      {isSpeaking && (
        <button
          onClick={stop}
          title="Stop"
          className="hover:text-red-400 transition-colors p-1"
        >
          <Square className="w-4 h-4" fill="currentColor" />
        </button>
      )}

      {/* Speed Control */}
      {isSpeaking && (
        <select
          value={rate}
          onChange={(e) => setRate(parseFloat(e.target.value))}
          className="bg-[#202222] border border-[#313333] text-xs rounded px-1 py-0.5 text-gray-300 focus:outline-none focus:border-[#20b8cd] ml-1"
          title="Playback Speed"
        >
          <option value={0.5}>0.5x</option>
          <option value={0.75}>0.75x</option>
          <option value={1}>1x</option>
          <option value={1.25}>1.25x</option>
          <option value={1.5}>1.5x</option>
          <option value={2}>2x</option>
        </select>
      )}
    </div>
  );
}
