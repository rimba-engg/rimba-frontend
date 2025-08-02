import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { api } from "@/lib/api";
import { AlertCircle } from "lucide-react";
import { InsightLoader } from '@/components/ui/loader';

interface SuggestedQuestionsProps {
  onQuestionClick: (question: string) => void;
}

interface SuggestedQuestionsResponse {
  status: string;
  data: {
    questions: string[];
    agent: string;
  };
  message: string;
}

export function SuggestedQuestions({ onQuestionClick }: SuggestedQuestionsProps) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestedQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch suggested questions from API
        const response = await api.get<SuggestedQuestionsResponse>('/vertex/suggested-questions/');
        setQuestions(response.data?.questions || []);
      } catch (err) {
        console.error('Failed to fetch suggested questions:', err);
        setError('Failed to load suggested questions');
        
        // Fallback to some default questions if API fails
        setQuestions([
          "What can you help me with?",
          "How do I get started?",
          "What are the main features?",
          "Can you explain the basics?",
          "What's new in recent updates?",
          "How can I improve my workflow?"
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedQuestions();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto mb-6">
        <div className="text-center py-8">
          <InsightLoader size="default" />
        </div>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto mb-6">
        <div className="text-center py-8">
          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-400" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-20 mb-6">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">Try asking one of these questions to get started:</p>
        {error && (
          <p className="text-xs text-amber-600 mt-1">Using fallback questions</p>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        {questions.map((question, index) => (
          <Button
            key={index}
            variant="outline"
            className="justify-start text-left h-auto py-3 px-4 text-sm font-normal hover:bg-gray-50 transition-colors rounded-3xl"
            onClick={() => onQuestionClick(question)}
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
} 