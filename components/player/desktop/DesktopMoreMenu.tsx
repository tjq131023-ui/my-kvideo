'use client';

import React from 'react';
import { Icons } from '@/components/ui/Icon';
import { usePlayerSettings } from '../hooks/usePlayerSettings';
import { settingsStore, AdFilterMode } from '@/lib/store/settings-store';

import { createPortal } from 'react-dom';

interface DesktopMoreMenuProps {
    showMoreMenu: boolean;
    isProxied?: boolean;
    onToggleMoreMenu: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onCopyLink: (type?: 'original' | 'proxy') => void;
    containerRef: React.RefObject<HTMLDivElement | null>;
}

export function DesktopMoreMenu({
    showMoreMenu,
    isProxied = false,
    onToggleMoreMenu,
    onMouseEnter,
    onMouseLeave,
    onCopyLink,
    containerRef
}: DesktopMoreMenuProps) {
    const {
        autoNextEpisode,
        autoSkipIntro,
        skipIntroSeconds,
        autoSkipOutro,
        skipOutroSeconds,
        showModeIndicator,
        adFilter,
        setAutoNextEpisode,
        setAutoSkipIntro,
        setSkipIntroSeconds,
        setAutoSkipOutro,
        setSkipOutroSeconds,
        setShowModeIndicator,
        setAdFilter,
        adFilterMode,
        setAdFilterMode,
        fullscreenType,
        setFullscreenType,
    } = usePlayerSettings();

    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const [menuPosition, setMenuPosition] = React.useState({ top: 0, left: 0 });
    const [isAdFilterOpen, setAdFilterOpen] = React.useState(false);

    const AD_FILTER_LABELS: Record<string, string> = {
        off: '关闭',
        keyword: '关键词',
        heuristic: '智能(Beta)',
        aggressive: '激进'
    };

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
        if (showMoreMenu && buttonRef.current && containerRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            setMenuPosition({
                top: buttonRect.bottom - containerRect.top + 10,
                left: buttonRect.left - containerRect.left
            });
        }
    }, [showMoreMenu, containerRef]);

    // Auto-close menu on scroll
    React.useEffect(() => {
        if (!showMoreMenu) return;
        const handleScroll = () => {
            if (showMoreMenu) {
                onToggleMoreMenu();
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [showMoreMenu, onToggleMoreMenu]);

    const handleToggle = () => {
        if (!showMoreMenu && buttonRef.current && containerRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            setMenuPosition({
                top: buttonRect.bottom - containerRect.top + 10,
                left: buttonRect.left - containerRect.left
            });
        }
        onToggleMoreMenu();
    };

    const MenuContent = (
        <div
            className={`absolute z-[9999] bg-[var(--glass-bg)] backdrop-blur-[25px] saturate-[180%] rounded-[var(--radius-2xl)] border border-[var(--glass-border)] shadow-[var(--shadow-md)] p-1.5 sm:p-2 w-fit min-w-[200px] sm:min-w-[240px] animate-in fade-in zoom-in-95 duration-200 ${isFullscreen ? 'max-h-[70vh] overflow-y-auto' : ''
                }`}
            style={{
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Copy Link Options */}
            {isProxied ? (
                <>
                    <button
                        onClick={() => onCopyLink('original')}
                        className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-left text-xs sm:text-sm text-[var(--text-color)] hover:bg-[color-mix(in_srgb,var(--accent-color)_15%,transparent)] rounded-[var(--radius-2xl)] transition-colors flex items-center gap-2 sm:gap-3 cursor-pointer"
                    >
                        <Icons.Link size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span>复制原链接</span>
                    </button>
                    <button
                        onClick={() => onCopyLink('proxy')}
                        className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-left text-xs sm:text-sm text-[var(--text-color)] hover:bg-[color-mix(in_srgb,var(--accent-color)_15%,transparent)] rounded-[var(--radius-2xl)] transition-colors flex items-center gap-2 sm:gap-3 mt-1 cursor-pointer"
                    >
                        <Icons.Link size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span>复制代理链接</span>
                    </button>
                </>
            ) : (
                <button
                    onClick={() => onCopyLink('original')}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-left text-xs sm:text-sm text-[var(--text-color)] hover:bg-[color-mix(in_srgb,var(--accent-color)_15%,transparent)] rounded-[var(--radius-2xl)] transition-colors flex items-center gap-2 sm:gap-3 cursor-pointer"
                >
                    <Icons.Link size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span>复制链接</span>
                </button>
            )}

            {/* Divider */}
            <div className="h-px bg-[var(--glass-border)] my-1.5 sm:my-2" />

            {/* Fullscreen Mode Selector */}
            <div className="px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-[var(--text-color)]">
                    <Icons.Settings size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span>全屏方式</span>
                </div>
                <div className="relative">
                    <button
                        onClick={() => {
                            setFullscreenType(fullscreenType === 'native' ? 'window' : 'native');
                        }}
                        className="flex items-center gap-1 sm:gap-1.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] text-[10px] sm:text-xs rounded-[var(--radius-2xl)] px-2 sm:px-2.5 py-1 sm:py-1.5 outline-none hover:border-[var(--accent-color)] hover:bg-[color-mix(in_srgb,var(--accent-color)_5%,transparent)] transition-all cursor-pointer whitespace-nowrap"
                    >
                        <span>{fullscreenType === 'native' ? '系统全屏' : '网页全屏'}</span>
                        <Icons.Maximize size={12} className="text-[var(--text-color-secondary)]" />
                    </button>
                </div>
            </div>

            {/* Show Mode Indicator Switch */}
            <div className="px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-[var(--text-color)]">
                    <Icons.Zap size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span>显示模式指示器</span>
                </div>
                <button
                    onClick={() => setShowModeIndicator(!showModeIndicator)}
                    className={`relative w-8 h-[18px] sm:w-10 sm:h-6 rounded-full transition-all duration-300 cursor-pointer flex-shrink-0 border border-white/20 ${showModeIndicator
                        ? 'bg-[var(--accent-color)] shadow-[0_0_15px_rgba(var(--accent-color-rgb),0.6)]'
                        : 'bg-white/5 hover:bg-white/10'
                        }`}
                    aria-checked={showModeIndicator}
                    role="switch"
                >
                    <span
                        className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 bg-white rounded-full transition-transform duration-300 shadow-[0_2px_4px_rgba(0,0,0,0.4)] ${showModeIndicator ? 'translate-x-3.5 sm:translate-x-4.5' : 'translate-x-0'
                            }`}
                    />
                </button>
            </div>

            {/* Ad Filter Mode Selector */}
            <div className="px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-[var(--text-color)]">
                    <Icons.ShieldAlert size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span>广告过滤</span>
                </div>
                {/* Custom Ad Filter Mode Selector */}
                <div className="relative">
                    <button
                        onClick={() => setAdFilterOpen(!isAdFilterOpen)}
                        className="flex items-center gap-1 sm:gap-1.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] text-[10px] sm:text-xs rounded-[var(--radius-2xl)] px-2 sm:px-2.5 py-1 sm:py-1.5 outline-none hover:border-[var(--accent-color)] hover:bg-[color-mix(in_srgb,var(--accent-color)_5%,transparent)] transition-all cursor-pointer whitespace-nowrap"
                    >
                        <span>{AD_FILTER_LABELS[adFilterMode] || '关闭'}</span>
                        <Icons.ChevronDown size={12} className={`text-[var(--text-color-secondary)] transition-transform duration-300 ${isAdFilterOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isAdFilterOpen && (
                        <>
                            <div className="fixed inset-0 z-10 cursor-default" onClick={() => setAdFilterOpen(false)} />
                            <div className="absolute right-0 top-full mt-2 w-28 sm:w-32 bg-[var(--glass-bg)] backdrop-blur-[25px] saturate-[180%] border border-[var(--glass-border)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-md)] p-1 overflow-hidden z-20 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                                {Object.entries(AD_FILTER_LABELS).map(([mode, label]) => (
                                    <button
                                        key={mode}
                                        onClick={() => {
                                            setAdFilterMode(mode as AdFilterMode);
                                            setAdFilterOpen(false);
                                        }}
                                        className={`text-left text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-[var(--radius-2xl)] hover:bg-[color-mix(in_srgb,var(--accent-color)_15%,transparent)] transition-colors w-full flex items-center justify-between group ${adFilterMode === mode ? 'text-[var(--accent-color)] font-medium bg-[color-mix(in_srgb,var(--accent-color)_5%,transparent)]' : 'text-[var(--text-color)]'
                                            }`}
                                    >
                                        <span>{label}</span>
                                        {adFilterMode === mode && <Icons.Check size={10} className="sm:w-[12px] sm:h-[12px] text-[var(--accent-color)]" />}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Auto Next Episode Switch */}
            <div className="px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-[var(--text-color)]">
                    <Icons.SkipForward size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span>自动下一集</span>
                </div>
                <button
                    onClick={() => setAutoNextEpisode(!autoNextEpisode)}
                    className={`relative w-8 h-[18px] sm:w-10 sm:h-6 rounded-full transition-all duration-300 cursor-pointer flex-shrink-0 border border-white/20 ${autoNextEpisode
                        ? 'bg-[var(--accent-color)] shadow-[0_0_15px_rgba(var(--accent-color-rgb),0.6)]'
                        : 'bg-white/5 hover:bg-white/10'
                        }`}
                    aria-checked={autoNextEpisode}
                    role="switch"
                >
                    <span
                        className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 bg-white rounded-full transition-transform duration-300 shadow-[0_2px_4px_rgba(0,0,0,0.4)] ${autoNextEpisode ? 'translate-x-3.5 sm:translate-x-4.5' : 'translate-x-0'
                            }`}
                    />
                </button>
            </div>

            {/* Skip Intro Switch */}
            <div className="px-3 py-2 sm:px-4 sm:py-2.5">
                <div className="flex items-center justify-between gap-4 sm:gap-6">
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-[var(--text-color)]">
                        <Icons.FastForward size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span>跳过片头</span>
                    </div>
                    <button
                        onClick={() => setAutoSkipIntro(!autoSkipIntro)}
                        className={`relative w-8 h-[18px] sm:w-10 sm:h-6 rounded-full transition-all duration-300 cursor-pointer flex-shrink-0 border border-white/20 ${autoSkipIntro
                            ? 'bg-[var(--accent-color)] shadow-[0_0_15px_rgba(var(--accent-color-rgb),0.6)]'
                            : 'bg-white/5 hover:bg-white/10'
                            }`}
                        aria-checked={autoSkipIntro}
                        role="switch"
                    >
                        <span
                            className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 bg-white rounded-full transition-transform duration-300 shadow-[0_2px_4px_rgba(0,0,0,0.4)] ${autoSkipIntro ? 'translate-x-3.5 sm:translate-x-4.5' : 'translate-x-0'
                                }`}
                        />
                    </button>
                </div>
                {/* Expandable Input */}
                {autoSkipIntro && (
                    <div className="mt-2 ml-6 sm:ml-7 flex items-center gap-1.5 sm:gap-2">
                        <span className="text-[10px] sm:text-xs text-[var(--text-color-secondary)]">时长:</span>
                        <input
                            type="number"
                            min="0"
                            max="600"
                            value={skipIntroSeconds}
                            onChange={(e) => setSkipIntroSeconds(parseInt(e.target.value) || 0)}
                            className="w-12 sm:w-16 px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs sm:text-sm text-center bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[var(--radius-2xl)] text-[var(--text-color)] focus:outline-none focus:border-[var(--accent-color)] no-spinner"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-[10px] sm:text-xs text-[var(--text-color-secondary)]">秒</span>
                    </div>
                )}
            </div>

            {/* Skip Outro Switch */}
            <div className="px-3 py-2 sm:px-4 sm:py-2.5">
                <div className="flex items-center justify-between gap-4 sm:gap-6">
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-[var(--text-color)]">
                        <Icons.Rewind size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span>跳过片尾</span>
                    </div>
                    <button
                        onClick={() => setAutoSkipOutro(!autoSkipOutro)}
                        className={`relative w-8 h-[18px] sm:w-10 sm:h-6 rounded-full transition-all duration-300 cursor-pointer flex-shrink-0 border border-white/20 ${autoSkipOutro
                            ? 'bg-[var(--accent-color)] shadow-[0_0_15px_rgba(var(--accent-color-rgb),0.6)]'
                            : 'bg-white/5 hover:bg-white/10'
                            }`}
                        aria-checked={autoSkipOutro}
                        role="switch"
                    >
                        <span
                            className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 bg-white rounded-full transition-transform duration-300 shadow-[0_2px_4px_rgba(0,0,0,0.4)] ${autoSkipOutro ? 'translate-x-3.5 sm:translate-x-4.5' : 'translate-x-0'
                                }`}
                        />
                    </button>
                </div>
                {/* Expandable Input */}
                {autoSkipOutro && (
                    <div className="mt-2 ml-6 sm:ml-7 flex items-center gap-1.5 sm:gap-2">
                        <span className="text-[10px] sm:text-xs text-[var(--text-color-secondary)]">剩余:</span>
                        <input
                            type="number"
                            min="0"
                            max="600"
                            value={skipOutroSeconds}
                            onChange={(e) => setSkipOutroSeconds(parseInt(e.target.value) || 0)}
                            className="w-12 sm:w-16 px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs sm:text-sm text-center bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[var(--radius-2xl)] text-[var(--text-color)] focus:outline-none focus:border-[var(--accent-color)] no-spinner"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-[10px] sm:text-xs text-[var(--text-color-secondary)]">秒</span>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={handleToggle}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                className="group flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95"
                aria-label="更多选项"
                title="更多选项"
            >
                <Icons.MoreHorizontal className="text-white/80 group-hover:text-white w-[20px] h-[20px] sm:w-[24px] sm:h-[24px]" />
            </button>

            {/* More Menu Dropdown (Portal) */}
            {showMoreMenu && typeof document !== 'undefined' && createPortal(MenuContent, containerRef.current || document.body)}
        </div>
    );
}
