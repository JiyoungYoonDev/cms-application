export const EMPTY_ROWS = [];

export const getPageItems = (page) => {
  if (Array.isArray(page)) return page;
  return page?.content ?? page?.data ?? page?.items ?? page?.results ?? [];
};

export const getTotalCount = (page) =>
  page?.totalElements ??
  page?.total ??
  page?.page?.totalElements ??
  page?.page?.total ??
  null;

export const getPaginationItems = (currentPage, totalPages, windowSize = 5) => {
  if (totalPages <= 1) return [0];

  const safeWindow = Math.max(windowSize, 3);
  const items = [];
  const lastPage = totalPages - 1;
  const start = Math.max(currentPage - Math.floor(safeWindow / 2), 1);
  const end = Math.min(start + safeWindow - 1, lastPage - 1);

  items.push(0);

  if (start > 1) {
    items.push('ellipsis-start');
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (end < lastPage - 1) {
    items.push('ellipsis-end');
  }

  if (lastPage > 0) {
    items.push(lastPage);
  }

  return items;
};
