const STORAGE_KEY = 'lms_book_images';
const MAX_IMAGES_PER_BOOK = 5;

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Quota exceeded or storage unavailable — silently skip.
  }
}

export function getBookImages(bookId) {
  if (!bookId) return [];
  const store = readStore();
  return Array.isArray(store[String(bookId)]) ? store[String(bookId)] : [];
}

export function setBookImages(bookId, images) {
  if (!bookId) return;
  const store = readStore();
  const trimmed = (images || []).slice(0, MAX_IMAGES_PER_BOOK);
  if (trimmed.length === 0) {
    delete store[String(bookId)];
  } else {
    store[String(bookId)] = trimmed;
  }
  writeStore(store);
}

export function removeBookImages(bookId) {
  if (!bookId) return;
  const store = readStore();
  delete store[String(bookId)];
  writeStore(store);
}

export function readImageFilesAsDataUrls(files) {
  const list = Array.from(files || []).filter((f) => f.type.startsWith('image/'));
  return Promise.all(
    list.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('Failed to read image'));
          reader.readAsDataURL(file);
        }),
    ),
  );
}

export { MAX_IMAGES_PER_BOOK };
