'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Loader2, Home, RotateCcw } from 'lucide-react';
import { queryKeys } from '@/lib/queryKeys';
import { quizService } from '@/services/quizService';
import { Quiz, QuizQuestion } from '@/types';
import { cn } from '@/lib/utils';

export default function QuizPage() {
    const router = useRouter();
    const params = useParams();
    const sessionId = params.id as string;
    const quizId = parseInt(params.quizId as string);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [showResults, setShowResults] = useState(false);

    // Fetch quiz with questions
    const { data: quiz, isLoading, error } = useQuery<Quiz>({
        queryKey: queryKeys.notebooks.quiz(sessionId, quizId),
        queryFn: () => quizService.getQuiz(sessionId, quizId),
        enabled: !!sessionId && !!quizId,
    });

    const questions = quiz?.questions || [];
    const currentQuestion = questions[currentIndex] as QuizQuestion | undefined;
    const isLastQuestion = currentIndex === questions.length - 1;
    const isMultipleChoice = currentQuestion?.question_type === 'multiple_choice';

    const handleOptionClick = (optionIndex: number) => {
        if (isSubmitted) return;

        if (isMultipleChoice) {
            setSelectedAnswers((prev) =>
                prev.includes(optionIndex)
                    ? prev.filter((i) => i !== optionIndex)
                    : [...prev, optionIndex]
            );
        } else {
            setSelectedAnswers([optionIndex]);
        }
    };

    const handleSubmit = () => {
        if (selectedAnswers.length === 0 || !currentQuestion) return;

        setIsSubmitted(true);

        // Check if correct
        const correctAnswers = currentQuestion.correct_answers;
        const isCorrect =
            selectedAnswers.length === correctAnswers.length &&
            selectedAnswers.every((a) => correctAnswers.includes(a));

        if (isCorrect) {
            setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
        }
        setScore((prev) => ({ ...prev, total: prev.total + 1 }));
    };

    const handleNext = () => {
        if (isLastQuestion) {
            setShowResults(true);
        } else {
            setCurrentIndex((prev) => prev + 1);
            setSelectedAnswers([]);
            setIsSubmitted(false);
        }
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setSelectedAnswers([]);
        setIsSubmitted(false);
        setScore({ correct: 0, total: 0 });
        setShowResults(false);
    };

    const handleBackToNotebook = () => {
        router.push(`/notebook/${sessionId}`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-purple-500" size={48} />
                    <p className="text-muted-foreground">Đang tải quiz...</p>
                </div>
            </div>
        );
    }

    if (error || !quiz) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6 text-center">
                        <XCircle className="mx-auto text-red-500 mb-4" size={48} />
                        <h3 className="text-lg font-semibold mb-2">Không thể tải quiz</h3>
                        <p className="text-muted-foreground mb-4">Quiz không tồn tại hoặc đã bị xóa.</p>
                        <Button onClick={handleBackToNotebook}>
                            <ArrowLeft className="mr-2" size={16} />
                            Quay lại notebook
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (quiz.status !== 'completed') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6 text-center">
                        <Loader2 className="mx-auto animate-spin text-blue-500 mb-4" size={48} />
                        <h3 className="text-lg font-semibold mb-2">Quiz đang được tạo</h3>
                        <p className="text-muted-foreground mb-4">Vui lòng đợi trong giây lát...</p>
                        <Button variant="outline" onClick={handleBackToNotebook}>
                            <ArrowLeft className="mr-2" size={16} />
                            Quay lại và đợi
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Show results
    if (showResults) {
        const percentage = Math.round((score.correct / score.total) * 100);
        const isPassed = percentage >= 70;

        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4">
                <Card className="w-full max-w-lg">
                    <CardHeader className="text-center">
                        <div className={cn(
                            "w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4",
                            isPassed ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"
                        )}>
                            {isPassed ? (
                                <CheckCircle2 className="text-green-600 dark:text-green-400" size={48} />
                            ) : (
                                <XCircle className="text-red-600 dark:text-red-400" size={48} />
                            )}
                        </div>
                        <CardTitle className="text-2xl">
                            {isPassed ? 'Chúc mừng!' : 'Cần cải thiện'}
                        </CardTitle>
                        <CardDescription>
                            {quiz.title}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <div className="text-5xl font-bold mb-2" style={{ color: isPassed ? '#22c55e' : '#ef4444' }}>
                            {percentage}%
                        </div>
                        <p className="text-muted-foreground mb-4">
                            Bạn đã trả lời đúng {score.correct}/{score.total} câu hỏi
                        </p>
                        <Progress value={percentage} className="h-3" />
                    </CardContent>
                    <CardFooter className="flex gap-2 justify-center">
                        <Button variant="outline" onClick={handleRestart}>
                            <RotateCcw className="mr-2" size={16} />
                            Làm lại
                        </Button>
                        <Button onClick={handleBackToNotebook}>
                            <Home className="mr-2" size={16} />
                            Về Notebook
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // Quiz question view
    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
            {/* Fixed Header */}
            <div className="shrink-0 p-4 pb-0">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <Button variant="ghost" size="sm" onClick={handleBackToNotebook}>
                            <ArrowLeft className="mr-2" size={16} />
                            Thoát
                        </Button>
                        <Badge variant="secondary" className="text-sm">
                            {currentIndex + 1} / {questions.length}
                        </Badge>
                    </div>
                    <Progress value={((currentIndex + 1) / questions.length) * 100} className="mb-4 h-2" />
                </div>
            </div>

            {/* Scrollable Content - use calc for explicit height since ScrollArea doesn't work with flex-1 */}
            <ScrollArea className="h-[calc(100vh-100px)]">
                <div className="p-4 pt-0">
                    <div className="max-w-3xl mx-auto">
                        {/* Question Card */}
                        {currentQuestion && (
                            <Card className="shadow-lg">
                                <CardHeader>
                                    <div className="flex items-start gap-3">
                                        <Badge
                                            variant={isMultipleChoice ? 'default' : 'secondary'}
                                            className="shrink-0"
                                        >
                                            {isMultipleChoice ? 'Nhiều đáp án' : 'Một đáp án'}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-lg leading-relaxed mt-2">
                                        {currentQuestion.question_text}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {currentQuestion.options.map((option, idx) => {
                                        const isSelected = selectedAnswers.includes(idx);
                                        const isCorrect = currentQuestion.correct_answers.includes(idx);
                                        const showAsCorrect = isSubmitted && isCorrect;
                                        const showAsIncorrect = isSubmitted && isSelected && !isCorrect;

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleOptionClick(idx)}
                                                disabled={isSubmitted}
                                                className={cn(
                                                    "w-full p-4 rounded-lg border-2 text-left transition-all",
                                                    "hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20",
                                                    isSelected && !isSubmitted && "border-purple-500 bg-purple-50 dark:bg-purple-900/20",
                                                    showAsCorrect && "border-green-500 bg-green-50 dark:bg-green-900/20",
                                                    showAsIncorrect && "border-red-500 bg-red-50 dark:bg-red-900/20",
                                                    isSubmitted && !showAsCorrect && !showAsIncorrect && "opacity-60",
                                                    isSubmitted && "cursor-default"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 font-medium text-sm",
                                                        isSelected && !isSubmitted && "border-purple-500 bg-purple-500 text-white",
                                                        showAsCorrect && "border-green-500 bg-green-500 text-white",
                                                        showAsIncorrect && "border-red-500 bg-red-500 text-white",
                                                        !isSelected && !isSubmitted && "border-gray-300"
                                                    )}>
                                                        {showAsCorrect ? (
                                                            <CheckCircle2 size={16} />
                                                        ) : showAsIncorrect ? (
                                                            <XCircle size={16} />
                                                        ) : (
                                                            String.fromCharCode(65 + idx)
                                                        )}
                                                    </div>
                                                    <span className={cn(
                                                        showAsCorrect && "text-green-700 dark:text-green-400 font-medium",
                                                        showAsIncorrect && "text-red-700 dark:text-red-400"
                                                    )}>
                                                        {option}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}

                                    {/* Explanation */}
                                    {isSubmitted && currentQuestion.explanation && (
                                        <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                                                Giải thích:
                                            </p>
                                            <p className="text-sm text-blue-700 dark:text-blue-400">
                                                {currentQuestion.explanation}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        {isMultipleChoice && !isSubmitted && (
                                            <span>Chọn tất cả đáp án đúng</span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {!isSubmitted ? (
                                            <Button
                                                onClick={handleSubmit}
                                                disabled={selectedAnswers.length === 0}
                                            >
                                                Kiểm tra
                                            </Button>
                                        ) : (
                                            <Button onClick={handleNext}>
                                                {isLastQuestion ? 'Xem kết quả' : 'Câu tiếp theo'}
                                                <ArrowRight className="ml-2" size={16} />
                                            </Button>
                                        )}
                                    </div>
                                </CardFooter>
                            </Card>
                        )}
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
