'use client';

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

interface DashboardPaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsShown: number;
    itemName?: string;
    onPageChange: (page: number) => void;
}

export default function DashboardPagination({
    currentPage,
    totalPages,
    totalItems,
    itemsShown,
    itemName = 'items',
    onPageChange,
}: DashboardPaginationProps) {
    if (totalPages <= 1 && totalItems <= itemsShown) {
        return null;
    }

    // Generate page numbers to display with ellipsis
    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push('ellipsis');
            }

            // Show pages around current
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push('ellipsis');
            }

            // Always show last page
            pages.push(totalPages);
        }

        return pages;
    };

    const handlePageClick = (page: number) => (e: React.MouseEvent) => {
        e.preventDefault();
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 mt-8">
            {/* Pagination controls */}
            {totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={handlePageClick(currentPage - 1)}
                                aria-disabled={currentPage === 1}
                                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                        </PaginationItem>

                        {getPageNumbers().map((page, index) => (
                            <PaginationItem key={index}>
                                {page === 'ellipsis' ? (
                                    <PaginationEllipsis />
                                ) : (
                                    <PaginationLink
                                        href="#"
                                        onClick={handlePageClick(page)}
                                        isActive={currentPage === page}
                                        className="cursor-pointer"
                                    >
                                        {page}
                                    </PaginationLink>
                                )}
                            </PaginationItem>
                        ))}

                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={handlePageClick(currentPage + 1)}
                                aria-disabled={currentPage === totalPages}
                                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}

            {/* Total count */}
            <div className="text-sm text-muted-foreground">
                Showing {itemsShown} of {totalItems} {itemName}
            </div>
        </div>
    );
}
