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

module.exports = {
  BOOK_LANGUAGES,
  BOOK_SUBJECTS,
  mergeCatalogOptions,
};
