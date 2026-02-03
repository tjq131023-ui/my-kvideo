import { useCallback, useEffect, useRef, useMemo } from 'react';

interface UseProgressControlsProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    progressBarRef: React.RefObject<HTMLDivElement | null>;
    duration: number;
    setCurrentTime: (time: number) => void;
    isDraggingProgressRef: React.MutableRefObject<boolean>;
}

export function useProgressControls({
    videoRef,
    progressBarRef,
    duration,
    setCurrentTime,
    isDraggingProgressRef
}: UseProgressControlsProps) {
    const lastDragTimeRef = useRef<number>(0);

    const handleProgressClick = useCallback((e: any) => {
        if (!videoRef.current || !progressBarRef.current) return;
        const rect = progressBarRef.current.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const newTime = pos * duration;
        videoRef.current.currentTime = newTime;
        lastDragTimeRef.current = newTime; // Update ref to prevent snap-back on mouseup
        setCurrentTime(newTime);
    }, [videoRef, progressBarRef, duration, setCurrentTime]);

    const handleProgressMouseDown = useCallback((e: any) => {
        e.preventDefault();
        isDraggingProgressRef.current = true;
        handleProgressClick(e);
    }, [isDraggingProgressRef, handleProgressClick]);

    const handleProgressTouchStart = useCallback((e: any) => {
        // e.preventDefault(); // Do not prevent default immediately to allow scrolling if needed, or check logic
        // But for a slider, we usually want to capture the drag.
        e.preventDefault();
        isDraggingProgressRef.current = true;

        // Calculate new time immediately on touch start
        if (!videoRef.current || !progressBarRef.current) return;
        const rect = progressBarRef.current.getBoundingClientRect();
        const touch = e.touches[0];
        const pos = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
        const newTime = pos * duration;

        videoRef.current.currentTime = newTime;
        lastDragTimeRef.current = newTime;
        setCurrentTime(newTime);
    }, [videoRef, progressBarRef, duration, setCurrentTime, isDraggingProgressRef]);

    useEffect(() => {
        const handleProgressMouseMove = (e: MouseEvent) => {
            if (!isDraggingProgressRef.current || !progressBarRef.current || !videoRef.current) return;
            e.preventDefault();
            const rect = progressBarRef.current.getBoundingClientRect();
            const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const newTime = pos * duration;
            lastDragTimeRef.current = newTime;
            setCurrentTime(newTime);
        };

        const handleMouseUp = () => {
            if (isDraggingProgressRef.current) {
                isDraggingProgressRef.current = false;
                if (videoRef.current) {
                    videoRef.current.currentTime = lastDragTimeRef.current;
                }
            }
        };

        const handleProgressTouchMove = (e: TouchEvent) => {
            if (!isDraggingProgressRef.current || !progressBarRef.current || !videoRef.current) return;
            // e.preventDefault(); // Prevent scrolling while dragging progress

            const rect = progressBarRef.current.getBoundingClientRect();
            const touch = e.touches[0];
            const pos = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
            const newTime = pos * duration;
            lastDragTimeRef.current = newTime;
            setCurrentTime(newTime);
        };

        const handleTouchEnd = () => {
            if (isDraggingProgressRef.current) {
                isDraggingProgressRef.current = false;
                if (videoRef.current) {
                    videoRef.current.currentTime = lastDragTimeRef.current;
                }
            }
        };

        document.addEventListener('mousemove', handleProgressMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchmove', handleProgressTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
        document.addEventListener('touchcancel', handleTouchEnd);

        return () => {
            document.removeEventListener('mousemove', handleProgressMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleProgressTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
            document.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [duration, isDraggingProgressRef, progressBarRef, videoRef, setCurrentTime]);

    const progressActions = useMemo(() => ({
        handleProgressClick,
        handleProgressMouseDown,
        handleProgressTouchStart
    }), [handleProgressClick, handleProgressMouseDown, handleProgressTouchStart]);

    return progressActions;
}
