import { useEffect, useState } from 'react';

export default function BookImageLightbox({ images = [], startIndex = 0, onClose }) {
  const list = images.filter(Boolean);
  const [index, setIndex] = useState(() =>
    list.length ? Math.min(startIndex, list.length - 1) : 0,
  );
  const safeIndex = list.length ? Math.min(index, list.length - 1) : 0;
  const hasMultiple = list.length > 1;

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasMultiple) {
        setIndex((i) => (i <= 0 ? list.length - 1 : i - 1));
      }
      if (e.key === 'ArrowRight' && hasMultiple) {
        setIndex((i) => (i >= list.length - 1 ? 0 : i + 1));
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, hasMultiple, list.length]);

  if (!list.length) return null;

  const goPrev = (e) => {
    e.stopPropagation();
    setIndex((i) => (i <= 0 ? list.length - 1 : i - 1));
  };

  const goNext = (e) => {
    e.stopPropagation();
    setIndex((i) => (i >= list.length - 1 ? 0 : i + 1));
  };

  return (
    <div
      className="book-image-lightbox"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Book image viewer"
    >
      <button type="button" className="book-image-lightbox-close" onClick={onClose} aria-label="Close">
        ×
      </button>
      <div className="book-image-lightbox-content" onClick={(e) => e.stopPropagation()}>
        <img src={list[safeIndex]} alt="" className="book-image-lightbox-img" />
        {hasMultiple && (
          <>
            <button
              type="button"
              className="book-image-lightbox-arrow book-image-lightbox-arrow-prev"
              onClick={goPrev}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              type="button"
              className="book-image-lightbox-arrow book-image-lightbox-arrow-next"
              onClick={goNext}
              aria-label="Next image"
            >
              ›
            </button>
            <div className="book-image-lightbox-counter">
              {safeIndex + 1} / {list.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
