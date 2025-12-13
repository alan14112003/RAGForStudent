// Quiz type labels for display
// Extensible config for quiz types

export const quizTypeLabels: Record<string, string> = {
    single_choice: 'Single Choice',
    multiple_choice: 'Multiple Choice',
    mixed: 'Mixed',
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
