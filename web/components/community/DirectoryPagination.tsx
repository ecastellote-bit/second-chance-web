import { Button } from "@/components/ui/Button";

export type DirectoryPaginationProps = {
  total: number;
  limit: number;
  offset: number;
  onPageChange: (nextOffset: number) => void;
};

export function DirectoryPagination({
  total,
  limit,
  offset,
  onPageChange,
}: DirectoryPaginationProps) {
  if (total <= limit) return null;

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const canGoPrev = offset > 0;
  const canGoNext = offset + limit < total;

  return (
    <nav
      className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between"
      aria-label="Paginación del directorio"
    >
      <p className="text-base font-medium text-[#243647]">
        Página {currentPage} de {totalPages}
      </p>

      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          disabled={!canGoPrev}
          onClick={() => onPageChange(Math.max(offset - limit, 0))}
          className="min-w-[140px]"
        >
          Anterior
        </Button>
        <Button
          type="button"
          variant="primary"
          size="lg"
          disabled={!canGoNext}
          onClick={() => onPageChange(offset + limit)}
          className="min-w-[140px]"
        >
          Siguiente
        </Button>
      </div>
    </nav>
  );
}
