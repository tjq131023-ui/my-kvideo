import React from 'react';
import { createPortal } from 'react-dom';

interface DesktopSpeedMenuProps {
    showSpeedMenu: boolean;
    playbackRate: number;
    speeds: number[];
    onSpeedChange: (speed: number) => void;
    onToggleSpeedMenu: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    containerRef: React.RefObject<HTMLDivElement | null>;
}

export function DesktopSpeedMenu({
    showSpeedMenu,
    playbackRate,
    speeds,
    onSpeedChange,
    onToggleSpeedMenu,
    onMouseEnter,
    onMouseLeave,
    containerRef
}: DesktopSpeedMenuProps) {
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const [menuPosition, setMenuPosition] = React.useState({ top: 0, left: 0 });

    const [isFullscreen, setIsFullscreen] = React.useState(false);

    React.useEffect(() => {
        const updateFullscreen = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', updateFullscreen);
        updateFullscreen();
        return () => document.removeEventListener('fullscreenchange', updateFullscreen);
    }, []);

    React.useEffect(() => {
        if (showSpeedMenu && buttonRef.current && containerRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();

            setMenuPosition({
                top: buttonRect.bottom - containerRect.top + 10,
                left: buttonRect.right - containerRect.left
            });
        }
    }, [showSpeedMenu, containerRef]);

    // Auto-close menu on scroll
    React.useEffect(() => {
        if (!showSpeedMenu) return;
        const handleScroll = () => {
            if (showSpeedMenu) {
                onToggleSpeedMenu();
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [showSpeedMenu, onToggleSpeedMenu]);

    const handleToggle = () => {
        if (!showSpeedMenu && buttonRef.current && containerRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();

            setMenuPosition({
                top: buttonRect.bottom - containerRect.top + 10,
                left: buttonRect.right - containerRect.left
            });
        }
        onToggleSpeedMenu();
    };


    const MenuContent = (
        <div
            className={`absolute z-[9999] bg-[var(--glass-bg)] backdrop-blur-[25px] saturate-[180%] rounded-[var(--radius-2xl)] border border-[var(--glass-border)] shadow-[var(--shadow-md)] p-1 sm:p-1.5 w-fit min-w-[3.5rem] sm:min-w-[4.5rem] animate-in fade-in zoom-in-95 duration-200 ${isFullscreen ? 'max-h-[60vh] overflow-y-auto' : ''
                }`}
            style={{
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
                transform: 'translateX(-100%)', // Align right edge
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {speeds.map((speed) => (
                <button
                    key={speed}
                    onClick={() => onSpeedChange(speed)}
                    className={`w-full px-3 py-1 sm:px-4 sm:py-1.5 rounded-[var(--radius-2xl)] text-xs sm:text-sm font-medium transition-colors ${playbackRate === speed
                        ? 'bg-[var(--accent-color)] text-white'
                        : 'text-[var(--text-color)] hover:bg-[color-mix(in_srgb,var(--accent-color)_15%,transparent)]'
                        }`}
                >
                    {speed}x
                </button>
            ))}
        </div>
    );

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={handleToggle}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                className="group flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 text-white/90 font-medium text-xs sm:text-sm"
                aria-label="播放速度"
            >
                {playbackRate}x
            </button>

            {/* Speed Menu (Portal) */}
            {showSpeedMenu && typeof document !== 'undefined' && createPortal(MenuContent, containerRef.current || document.body)}
        </div>
    );
}
