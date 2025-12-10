// Query keys for React Query
export const queryKeys = {
  notebooks: {
    all: ['notebooks'] as const,
    list: () => [...queryKeys.notebooks.all, 'list'] as const,
    detail: (id: string | number) => [...queryKeys.notebooks.all, 'detail', id] as const,
    documents: (id: string | number) => [...queryKeys.notebooks.all, 'documents', id] as const,
  },
};
