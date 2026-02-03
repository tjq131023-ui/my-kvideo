/**
 * PopularFeatures - Main component for popular movies section
 * Displays Douban movie recommendations with tag filtering and infinite scroll
 */

'use client';

import { TagManager } from './TagManager';
import { MovieGrid } from './MovieGrid';
import { useTagManager } from './hooks/useTagManager';
import { usePopularMovies } from './hooks/usePopularMovies';

interface PopularFeaturesProps {
  onSearch?: (query: string) => void;
}

export function PopularFeatures({ onSearch }: PopularFeaturesProps) {
  const {
    tags,
    selectedTag,
    contentType,
    newTagInput,
    showTagManager,
    justAddedTag,
    setContentType,
    setSelectedTag,
    setNewTagInput,
    setShowTagManager,
    setJustAddedTag,
    handleAddTag,
    handleDeleteTag,
    handleRestoreDefaults,
    handleDragEnd,
    isLoadingTags,
  } = useTagManager();

  const {
    movies,
    loading,
    hasMore,
    prefetchRef,
    loadMoreRef,
  } = usePopularMovies(selectedTag, tags, contentType);

  const handleMovieClick = (movie: any) => {
    if (onSearch) {
      onSearch(movie.title);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Content Type Toggle (Capsule Liquid Glass - Fixed & Centered) */}
      <div className="mb-10 flex justify-center">
        <div className="relative w-80 p-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-full grid grid-cols-2 backdrop-blur-2xl shadow-lg ring-1 ring-white/10 overflow-hidden">
          {/* Sliding Indicator */}
          <div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[var(--accent-color)] rounded-full transition-transform duration-400 cubic-bezier(0.4, 0, 0.2, 1) shadow-[0_0_15px_rgba(0,122,255,0.4)]"
            style={{
              transform: `translateX(${contentType === 'movie' ? '4px' : 'calc(100% + 4px)'})`,
            }}
          />

          <button
            onClick={() => setContentType('movie')}
            className={`relative z-10 py-2.5 text-sm font-bold transition-colors duration-300 cursor-pointer flex justify-center items-center ${contentType === 'movie' ? 'text-white' : 'text-[var(--text-color-secondary)] hover:text-[var(--text-color)]'
              }`}
          >
            电影
          </button>
          <button
            onClick={() => setContentType('tv')}
            className={`relative z-10 py-2.5 text-sm font-bold transition-colors duration-300 cursor-pointer flex justify-center items-center ${contentType === 'tv' ? 'text-white' : 'text-[var(--text-color-secondary)] hover:text-[var(--text-color)]'
              }`}
          >
            电视剧
          </button>
        </div>
      </div>
      <TagManager
        tags={tags}
        selectedTag={selectedTag}
        showTagManager={showTagManager}
        newTagInput={newTagInput}
        justAddedTag={justAddedTag}
        onTagSelect={(tagId) => {
          if (tagId === 'custom_高级' || tags.find(t => t.id === tagId)?.label === '高级') {
            window.location.href = '/premium';
            return;
          }
          setSelectedTag(tagId);
        }}
        onTagDelete={handleDeleteTag}
        onToggleManager={() => setShowTagManager(!showTagManager)}
        onRestoreDefaults={handleRestoreDefaults}
        onNewTagInputChange={setNewTagInput}
        onAddTag={handleAddTag}
        onDragEnd={handleDragEnd}
        onJustAddedTagHandled={() => setJustAddedTag(false)}
        isLoadingTags={isLoadingTags}
      />

      <MovieGrid
        movies={movies}
        loading={loading}
        hasMore={hasMore}
        onMovieClick={handleMovieClick}
        prefetchRef={prefetchRef}
        loadMoreRef={loadMoreRef}
      />
    </div>
  );
}
