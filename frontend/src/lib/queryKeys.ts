// Query keys for React Query
export const queryKeys = {
    notebooks: {
        all: ['notebooks'] as const,
        list: (page: number = 1) => [...queryKeys.notebooks.all, 'list', page] as const,
        detail: (id: string | number) => [...queryKeys.notebooks.all, 'detail', id] as const,
        documents: (id: string | number) => [...queryKeys.notebooks.all, 'documents', id] as const,
        chapters: (sessionId: string | number, documentId: number) =>
            [...queryKeys.notebooks.all, 'chapters', sessionId, documentId] as const,
        summary: (sessionId: string | number, documentId: number, scope: string, format: string, chapterIndex?: number) =>
            [...queryKeys.notebooks.all, 'summary', sessionId, documentId, scope, format, chapterIndex] as const,
    },
};
