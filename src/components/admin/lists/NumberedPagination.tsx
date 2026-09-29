import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

type PageItem = number | "ellipsis";

function getPageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, totalPages]);
  for (let p = page - 1; p <= page + 1; p++) {
    if (p >= 1 && p <= totalPages) pages.add(p);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const items: PageItem[] = [];
  sorted.forEach((p, index) => {
    if (index > 0 && p - sorted[index - 1] > 1) {
      items.push("ellipsis");
    }
    items.push(p);
  });
  return items;
}

interface NumberedPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  /** Plural item label for the summary, e.g. "students". */
  itemLabel?: string;
  className?: string;
}

export function NumberedPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  itemLabel,
  className,
}: NumberedPaginationProps) {
  if (!totalPages || total <= 0) {
    return null;
  }

  const from = total > 0 ? (page - 1) * limit + 1 : 0;
  const to = Math.min(page * limit, total);

  const goTo = (nextPage: number) => (event: React.MouseEvent) => {
    event.preventDefault();
    if (nextPage >= 1 && nextPage <= totalPages && nextPage !== page) {
      onPageChange(nextPage);
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-3 pt-5 sm:flex-row sm:justify-between", className)}>
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{from}</span> to{" "}
        <span className="font-medium text-foreground">{to}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span>
        {itemLabel ? ` ${itemLabel}` : ""}
        </p>
        {totalPages > 1 && (
          <Pagination className="mx-0 w-auto justify-center">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  aria-disabled={page === 1}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                  onClick={goTo(page - 1)}
                />
              </PaginationItem>
              {getPageItems(page, totalPages).map((item, index) =>
                item === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${index}`} className="hidden sm:block">
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={item}>
                    <PaginationLink
                      href="#"
                      isActive={item === page}
                      onClick={goTo(item)}
                      className={item === page ? "border-primary/40 font-semibold text-primary" : ""}
                    >
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-disabled={page === totalPages}
                  className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                  onClick={goTo(page + 1)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    );
  }
