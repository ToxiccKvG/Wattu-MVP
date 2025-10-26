

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Composant de pagination réutilisable
 * 
 * @param {number} currentPage - Page actuelle (1-indexed)
 * @param {number} totalPages - Nombre total de pages
 * @param {number} totalItems - Nombre total d'items
 * @param {number} itemsPerPage - Nombre d'items par page
 * @param {Function} onPageChange - Callback appelé lors du changement de page
 * @param {Function} onItemsPerPageChange - Callback appelé lors du changement d'items par page
 * @param {Array<number>} pageSizeOptions - Options pour le nombre d'items par page (default: [10, 25, 50, 100])
 * 
 * @example
 * <Pagination
 *   currentPage={1}
 *   totalPages={10}
 *   totalItems={156}
 *   itemsPerPage={10}
 *   onPageChange={(page) => setCurrentPage(page)}
 *   onItemsPerPageChange={(size) => setItemsPerPage(size)}
 * />
 */
function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions = [10, 25, 50, 100]
}) {
  // Calculer les items affichés
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Générer les numéros de pages visibles
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 7; // Nombre max de pages visibles

    if (totalPages <= maxVisible) {
      // Si peu de pages, afficher toutes
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logique complexe pour afficher [1, ..., 4, 5, 6, ..., 10]
      if (currentPage <= 4) {
        // Début: [1, 2, 3, 4, 5, ..., 10]
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Fin: [1, ..., 6, 7, 8, 9, 10]
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Milieu: [1, ..., 4, 5, 6, ..., 10]
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-200">
      {/* Infos pagination */}
      <div className="text-sm text-neutral-600">
        Affichage <span className="font-semibold">{startItem}</span> à{' '}
        <span className="font-semibold">{endItem}</span> sur{' '}
        <span className="font-semibold">{totalItems}</span> résultats
      </div>

      {/* Contrôles pagination */}
      <div className="flex items-center gap-2">
        {/* Items par page */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-600">Par page:</span>
          <Select
            value={String(itemsPerPage)}
            onValueChange={(value) => onItemsPerPageChange(Number(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map(size => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Séparateur */}
        <div className="h-6 w-px bg-neutral-300 mx-2" />

        {/* Boutons navigation */}
        <div className="flex items-center gap-1">
          {/* Première page */}
          <Button
            size="icon"
            variant="outline"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="h-8 w-8"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Page précédente */}
          <Button
            size="icon"
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Numéros de pages */}
          <div className="hidden sm:flex items-center gap-1">
            {visiblePages.map((page, index) => {
              if (page === '...') {
                return (
                  <span key={`ellipsis-${index}`} className="px-2 text-neutral-400">
                    ...
                  </span>
                );
              }

              return (
                <Button
                  key={page}
                  size="icon"
                  variant={currentPage === page ? 'default' : 'outline'}
                  onClick={() => onPageChange(page)}
                  className="h-8 w-8"
                >
                  {page}
                </Button>
              );
            })}
          </div>

          {/* Page actuelle (mobile) */}
          <div className="sm:hidden px-3 py-1 text-sm font-medium text-neutral-700">
            {currentPage} / {totalPages}
          </div>

          {/* Page suivante */}
          <Button
            size="icon"
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Dernière page */}
          <Button
            size="icon"
            variant="outline"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="h-8 w-8"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Pagination;

