const BOOK_FILTER_OTHER = "Other";

const BOOK_LANGUAGES = ["English", "Hindi", "Telugu", "Sanskrit"];

const BOOK_SUBJECTS = [
  "Mathematics",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Hindi",
  "Telugu",
  "Sanskrit",
  "History",
  "Geography",
  "Civics",
  "Economics",
  "Computer Science",
  "General Knowledge",
];

function mergeCatalogOptions(predefined, fromDatabase = []) {
  return [...new Set([...predefined, ...fromDatabase.filter(Boolean)])].sort((a, b) =>
    a.localeCompare(b),
  );
}

const BOOK_TYPES = ["borrow", "reference", "sell"];

const DEFAULT_BOOK_TYPE = "borrow";

module.exports = {
  BOOK_FILTER_OTHER,
  BOOK_LANGUAGES,
  BOOK_SUBJECTS,
  BOOK_TYPES,
  DEFAULT_BOOK_TYPE,
  mergeCatalogOptions,
};
