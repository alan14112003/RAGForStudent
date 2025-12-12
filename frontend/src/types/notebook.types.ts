// Notebook UI related types
import { Notebook } from './chat.types';

export type MobileTab = 'sources' | 'chat' | 'studio';

export interface PaginatedNotebooks {
    items: Notebook[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}
