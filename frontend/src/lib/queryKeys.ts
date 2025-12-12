// Query keys for React Query
export const queryKeys = {
    notebooks: {
        all: ['notebooks'] as const,
        list: (page: number = 1) => [...queryKeys.notebooks.all, 'list', page] as const,
        detail: (id: string | number) => [...queryKeys.notebooks.all, 'detail', id] as const,
        documents: (id: string | number) => [...queryKeys.notebooks.all, 'documents', id] as const,
    },
};
