import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Question, CorrectAnswer } from '@/types';
import { Heart, BookmarkCheck, CheckCircle2, XCircle } from 'lucide-react';

interface MCQCardProps {
  question: Question;
  showAnswer?: boolean;
  userAnswer?: CorrectAnswer | null;
  onAnswerSelect?: (answer: CorrectAnswer) => void;
  onFavorite?: () => void;
  onMarkReview?: () => void;
  isFavorited?: boolean;
  isMarkedForReview?: boolean;
  showExplanation?: boolean;
  isDisabled?: boolean;
}

export default function MCQCard({
  question,
  showAnswer = false,
  userAnswer,
  onAnswerSelect,
  onFavorite,
  onMarkReview,
  isFavorited = false,
  isMarkedForReview = false,
  showExplanation = false,
  isDisabled = false,
}: MCQCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<CorrectAnswer | null>(userAnswer || null);

  const options: Array<{ key: CorrectAnswer; text: string; imageUrl: string | null }> = [
    { key: 'A', text: question.option_a, imageUrl: question.option_a_image_url },
    { key: 'B', text: question.option_b, imageUrl: question.option_b_image_url },
    { key: 'C', text: question.option_c, imageUrl: question.option_c_image_url },
    { key: 'D', text: question.option_d, imageUrl: question.option_d_image_url },
  ];

  const handleOptionClick = (key: CorrectAnswer) => {
    if (isDisabled || showAnswer) return;
    setSelectedAnswer(key);
    onAnswerSelect?.(key);
  };

  const getOptionStyle = (key: CorrectAnswer) => {
    if (!showAnswer && selectedAnswer === key) {
      return 'border-primary bg-primary/10';
    }
    if (showAnswer) {
      if (key === question.correct_answer) {
        return 'border-success bg-success/10';
      }
      if (selectedAnswer === key && key !== question.correct_answer) {
        return 'border-destructive bg-destructive/10';
      }
    }
    return 'border-border hover:border-primary/50';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-lg font-medium leading-relaxed">{question.question_text}</p>
            {question.question_image_url && (
              <img
                src={question.question_image_url}
                alt="Question"
                className="mt-4 rounded-lg max-w-full h-auto"
              />
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            {onFavorite && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onFavorite}
                className={isFavorited ? 'text-destructive' : ''}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </Button>
            )}
            {onMarkReview && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMarkReview}
                className={isMarkedForReview ? 'text-warning' : ''}
              >
                <BookmarkCheck className={`w-5 h-5 ${isMarkedForReview ? 'fill-current' : ''}`} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => handleOptionClick(option.key)}
            disabled={isDisabled}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${getOptionStyle(
              option.key
            )} ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
          >
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="shrink-0 mt-0.5">
                {option.key}
              </Badge>
              <div className="flex-1">
                <p className="font-medium">{option.text}</p>
                {option.imageUrl && (
                  <img
                    src={option.imageUrl}
                    alt={`Option ${option.key}`}
                    className="mt-2 rounded-lg max-w-full h-auto"
                  />
                )}
              </div>
              {showAnswer && option.key === question.correct_answer && (
                <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
              )}
              {showAnswer &&
                selectedAnswer === option.key &&
                option.key !== question.correct_answer && (
                  <XCircle className="w-5 h-5 text-destructive shrink-0" />
                )}
            </div>
          </button>
        ))}
      </CardContent>

      {showAnswer && showExplanation && question.explanation && (
        <>
          <Separator />
          <CardFooter className="flex-col items-start pt-6">
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Explanation</h4>
            <p className="text-sm leading-relaxed">{question.explanation}</p>
            {question.explanation_image_url && (
              <img
                src={question.explanation_image_url}
                alt="Explanation"
                className="mt-4 rounded-lg max-w-full h-auto"
              />
            )}
          </CardFooter>
        </>
      )}
    </Card>
  );
}
