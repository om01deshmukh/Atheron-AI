"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onresult: (event: any) => void;
    onend: () => void;
    onerror: (event: any) => void;
}

declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

export function useSpeechRecognition() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                if (recognitionRef.current) {
                    recognitionRef.current.continuous = true;
                    recognitionRef.current.interimResults = true;
                    recognitionRef.current.lang = "en-US";
                }
            }
        }
    }, []);

    const startListening = useCallback(() => {
        // Check ref synchronously to avoid React state race conditions
        if (recognitionRef.current && !isListening) {
            try {
                setTranscript("");
                setError(null);
                // Sometimes the browser thinks it's started even if our state says no
                // catching the specific error is the safest way
                recognitionRef.current.start();
                setIsListening(true);
            } catch (err: any) {
                if (err.name === 'InvalidStateError') {
                    console.warn("Speech recognition already started, ignoring.");
                    // If it's already started, we should probably consider ourselves listening
                    setIsListening(true);
                } else {
                    console.error("Speech recognition start error:", err);
                }
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
                // Don't set isListening(false) here immediately, wait for onend
                // But for push-to-talk UI feedback, we might want to.
                // Let's rely on onend for the final source of truth, but we can optimistically update if needed.
                // For now, let's keep reliance on onend to avoid flip-flopping.
            } catch (err) {
                console.error("Speech recognition stop error:", err);
            }
        }
    }, []);

    useEffect(() => {
        if (!recognitionRef.current) return;

        recognitionRef.current.onresult = (event: any) => {
            let finalTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    // We can handle interim results if needed, but for now focusing on final
                    // If we want real-time feedback we can append interim
                }
            }
            if (finalTranscript) {
                setTranscript(prev => prev ? prev + " " + finalTranscript : finalTranscript);
            }
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
            // "aborted" often happens if you stop immediately or simply stop. It's not a real error for us.
            if (event.error === 'aborted') {
                console.log("Speech recognition aborted (harmless).");
                setIsListening(false);
                return;
            }
            console.error("Speech recognition error:", event.error);
            setError(event.error);
            setIsListening(false);
        };

        // Cleanup listeners not needed as they are assigned to the ref instance which persists
    }, []);

    const resetTranscript = useCallback(() => {
        setTranscript("");
    }, []);

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        resetTranscript,
        error,
        hasRecognition: typeof window !== "undefined" && !!(window.webkitSpeechRecognition || window.SpeechRecognition)
    };
}
