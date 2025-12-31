import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy, CheckCircle, XCircle, Clock, ArrowLeft, Download, Share,
  TrendingUp, TrendingDown, Minus
} from "lucide-react";

interface ExamResultsProps {
  testTitle: string;
  subject: string;
  score: number;
  totalMarks: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  totalQuestions: number;
  timeTaken?: number;
  attemptId: string;
  onBack: () => void;
  onDownloadPdf?: () => void;
}

export function ExamResults({
  testTitle,
  subject,
  score,
  totalMarks,
  percentage,
  correctCount,
  incorrectCount,
  unansweredCount,
  totalQuestions,
  timeTaken,
  attemptId,
  onBack,
  onDownloadPdf,
}: ExamResultsProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const getGrade = (pct: number) => {
    if (pct >= 90) return { grade: "A+", color: "text-green-600", bg: "bg-green-100 dark:bg-green-950" };
    if (pct >= 80) return { grade: "A", color: "text-green-600", bg: "bg-green-100 dark:bg-green-950" };
    if (pct >= 70) return { grade: "B+", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-950" };
    if (pct >= 60) return { grade: "B", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-950" };
    if (pct >= 50) return { grade: "C", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-950" };
    if (pct >= 40) return { grade: "D", color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-950" };
    return { grade: "F", color: "text-red-600", bg: "bg-red-100 dark:bg-red-950" };
  };

  const gradeInfo = getGrade(percentage);
  const isPassing = percentage >= 40;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${gradeInfo.bg} mb-4`}>
            <span className={`text-4xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">{testTitle}</h1>
          <Badge variant="outline" className="mb-2">{subject}</Badge>
          <p className={`text-lg ${isPassing ? "text-green-600" : "text-red-600"}`}>
            {isPassing ? "Congratulations! You passed!" : "Keep practicing to improve!"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Your Score
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">
                {score} <span className="text-2xl text-muted-foreground">/ {totalMarks}</span>
              </div>
              <Progress value={percentage} className="h-3 mt-4" />
              <p className="text-lg font-medium mt-2">{percentage.toFixed(1)}%</p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-muted-foreground">Correct</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{correctCount}</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-muted-foreground">Incorrect</span>
                </div>
                <span className="text-2xl font-bold text-red-600">{incorrectCount}</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Minus className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-muted-foreground">Skipped</span>
                </div>
                <span className="text-2xl font-bold text-gray-500">{unansweredCount}</span>
              </div>
            </div>

            {timeTaken && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Time Taken</span>
                  </div>
                  <span className="font-medium">{formatTime(timeTaken)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button variant="outline" onClick={onBack} className="flex-1" data-testid="button-back-results">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tests
          </Button>
          {onDownloadPdf && (
            <Button onClick={onDownloadPdf} className="flex-1" data-testid="button-download-pdf">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
