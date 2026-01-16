"use client";

import { useEffect, useRef } from "react";
import { Mic, MicOff } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface VoiceInputProps {
    onMessageSubmit: (text: string) => void;
    className?: string;
}

export default function VoiceInput({ onMessageSubmit, className = "" }: VoiceInputProps) {
    const { isListening, transcript, startListening, stopListening, resetTranscript, hasRecognition } = useSpeechRecognition();
    const transcriptRef = useRef("");

    // Keep ref in sync for the cleanup/submit
    useEffect(() => {
        transcriptRef.current = transcript;
    }, [transcript]);

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault(); // Prevent focus loss or other side effects
        startListening();
    };

    const handleMouseUp = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        stopListening();
        // Small delay to ensure final results are captured? 
        // Actually, Web Speech API might fire 'onend' or 'onresult' after stop() is called.
        // We'll rely on the transcript state being updated. 
        // However, the transcript state update might happen AFTER this function runs.

        // Better approach: When isListening goes from true -> false, we submit.
    };

    // Submit when listening stops and we have text
    useEffect(() => {
        // If we just stopped listening
        if (!isListening && transcriptRef.current) {
            const textToSubmit = transcriptRef.current;
            // Clear immediately to prevent duplicate submissions if this effect re-runs
            transcriptRef.current = "";
            resetTranscript();

            onMessageSubmit(textToSubmit);
        }
    }, [isListening, onMessageSubmit, resetTranscript]);

    if (!hasRecognition) return null;

    return (
        <button
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp} // Also stop if they drag out
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            className={`p-2 rounded-full transition-all duration-200 flex items-center justify-center ${isListening
                ? "bg-red-500/20 text-red-500 scale-110 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                : "text-gray-400 hover:text-[#20b8cd] hover:bg-[#20b8cd]/10"
                } ${className}`}
            title="Press and hold to speak"
            type="button"
        >
            <Mic className={`w-5 h-5 ${isListening ? "animate-pulse" : ""}`} />
        </button>
    );
}
