// Quiz type labels for display
// Extensible config for quiz types

export const quizTypeLabels: Record<string, string> = {
    single_choice: 'Một đáp án',
    multiple_choice: 'Nhiều đáp án',
    mixed: 'Kết hợp',
};

/**
 * Get display label for quiz type
 * Returns the raw type if no label found
 */
export function getQuizTypeLabel(quizType: string | undefined): string | undefined {
    if (!quizType) {
        return undefined;
    }
    return quizTypeLabels[quizType] || quizType;
}
