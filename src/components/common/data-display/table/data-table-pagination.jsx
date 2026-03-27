export function DataTablePagination({
  rowsCount,
  totalCount,
  currentPage,
  totalPages,
  paginationItems,
  onFirst,
  onPrev,
  onPageClick,
  onNext,
  onLast,
}) {
  return (
    <div className="flex flex-col gap-3 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
      <span>
        Showing {rowsCount}
        {totalCount ? ` of ${totalCount}` : ""} rows
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-md border px-2 py-1 disabled:opacity-50"
          onClick={onFirst}
          disabled={currentPage === 0}
        >
          First
        </button>

        <button
          type="button"
          className="rounded-md border px-2 py-1 disabled:opacity-50"
          onClick={onPrev}
          disabled={currentPage === 0}
        >
          Prev
        </button>

        {paginationItems.map((item) =>
          typeof item === "number" ? (
            <button
              key={item}
              type="button"
              className={`rounded-md border px-2 py-1 ${
                item === currentPage
                  ? "bg-foreground text-background"
                  : "hover:bg-muted"
              }`}
              onClick={() => onPageClick(item)}
            >
              {item + 1}
            </button>
          ) : (
            <span key={item} className="px-1">
              ...
            </span>
          )
        )}

        <span>
          Page {currentPage + 1} of {totalPages}
        </span>

        <button
          type="button"
          className="rounded-md border px-2 py-1 disabled:opacity-50"
          onClick={onNext}
          disabled={currentPage + 1 >= totalPages}
        >
          Next
        </button>

        <button
          type="button"
          className="rounded-md border px-2 py-1 disabled:opacity-50"
          onClick={onLast}
          disabled={currentPage + 1 >= totalPages}
        >
          Last
        </button>
      </div>
    </div>
  );
}