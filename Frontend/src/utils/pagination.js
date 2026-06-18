export const PAGE_SIZE = 12;

export function buildPageNumbers(page, totalPages, maxVisible = 5) {
  let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }
  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i += 1) {
    pageNumbers.push(i);
  }
  return { startPage, endPage, pageNumbers };
}

export function filterByBookTitle(items, search, titleKey = 'book_title') {
  const term = search.trim().toLowerCase();
  if (!term) return items;
  return items.filter((item) =>
    String(item[titleKey] || '').toLowerCase().includes(term),
  );
}

export function paginateItems(items, page, pageSize = PAGE_SIZE) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, total);
  const paginatedItems = items.slice((safePage - 1) * pageSize, safePage * pageSize);
  return {
    items: paginatedItems,
    total,
    totalPages,
    page: safePage,
    start,
    end,
    ...buildPageNumbers(safePage, totalPages),
  };
}
