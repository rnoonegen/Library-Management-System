import { useState } from 'react';
import BookImageLightbox from 'components/books/BookImageLightbox';

const PLACEHOLDER = (
  <div className="book-image-placeholder" aria-hidden="true">
    <span>📚</span>
  </div>
);

export default function BookImageCarousel({
  images = [],
  className = '',
  compact = false,
  expandable = false,
}) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const list = images.filter(Boolean);
  const hasMultiple = list.length > 1;
  const safeIndex = list.length ? Math.min(index, list.length - 1) : 0;

  const goPrev = (e) => {
    e?.stopPropagation();
    setIndex((i) => (i <= 0 ? list.length - 1 : i - 1));
  };

  const goNext = (e) => {
    e?.stopPropagation();
    setIndex((i) => (i >= list.length - 1 ? 0 : i + 1));
  };

  const openLightbox = (e) => {
    if (!expandable || !list.length) return;
    e?.stopPropagation();
    setLightboxOpen(true);
  };

  const rootClass = [
    'book-image-carousel',
    compact ? 'is-compact' : '',
    expandable && list.length ? 'is-expandable' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (!list.length) {
    return <div className={rootClass}>{PLACEHOLDER}</div>;
  }

  return (
    <>
      <div className={rootClass}>
        {expandable ? (
          <button
            type="button"
            className="book-image-carousel-trigger"
            onClick={openLightbox}
            aria-label="View full image"
          >
            <img
              src={list[safeIndex]}
              alt=""
              className="book-image-carousel-img"
            />
          </button>
        ) : (
          <img
            src={list[safeIndex]}
            alt=""
            className="book-image-carousel-img"
          />
        )}
        {hasMultiple && (
          <>
            <button
              type="button"
              className="book-image-carousel-arrow book-image-carousel-arrow-prev"
              onClick={goPrev}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              type="button"
              className="book-image-carousel-arrow book-image-carousel-arrow-next"
              onClick={goNext}
              aria-label="Next image"
            >
              ›
            </button>
            <div className="book-image-carousel-dots" aria-hidden="true">
              {list.map((_, i) => (
                <span
                  key={i}
                  className={`book-image-carousel-dot${i === safeIndex ? ' is-active' : ''}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {lightboxOpen && (
        <BookImageLightbox
          images={list}
          startIndex={safeIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
