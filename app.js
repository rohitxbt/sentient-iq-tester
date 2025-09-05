import React, { useState, useEffect } from 'react';
import { Brain, Zap, Trophy, Clock, Star, MessageCircle, Send, Loader2, Target, Timer, CheckCircle } from 'lucide-react';

const SentientIQTester = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [isActive, setIsActive] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [isAnswered, setIsAnswered] = useState(false);

  // MCQ Format IQ Questions
  const questions = [
    {
      id: 1,
      question: "What comes next in this sequence? 2, 4, 6, 8, ?",
      options: ["9", "10", "12", "14"],
      correctAnswer: "10",
      explanation: "Even numbers sequence: 2, 4, 6, 8, 10",
      type: "Number Pattern",
      difficulty: 1
    },
    {
      id: 2,
      question: "Cat is to Meow as Dog is to:",
      options: ["Run", "Bark", "Jump", "Sleep"],
      correctAnswer: "Bark",
      explanation: "Cat makes meow sound, Dog makes bark sound",
      type: "Word Relations",
      difficulty: 1
    },
    {
      id: 3,
      question: "Which one is different?",
      options: ["Apple", "Orange", "Car", "Banana"],
      correctAnswer: "Car",
      explanation: "Apple, Orange, and Banana are fruits. Car is a vehicle",
      type: "Classification",
      difficulty: 1
    },
    {
      id: 4,
      question: "Complete the pattern: 1, 3, 5, 7, ?",
      options: ["8", "9", "10", "11"],
      correctAnswer: "9",
      explanation: "Odd numbers sequence: 1, 3, 5, 7, 9",
      type: "Number Pattern",
      difficulty: 1
    },
    {
      id: 5,
      question: "If Tom is taller than Sam, and Sam is taller than Ali, who is the shortest?",
      options: ["Tom", "Sam", "Ali", "Cannot determine"],
      correctAnswer: "Ali",
      explanation: "Tom > Sam > Ali, so Ali is the shortest",
      type: "Logic",
      difficulty: 1
    },
    {
      id: 6,
      question: "What comes next? A, C, E, G, ?",
      options: ["H", "I", "J", "K"],
      correctAnswer: "I",
      explanation: "Skip one letter each time: A(skip B)C(skip D)E(skip F)G(skip H)I",
      type: "Letter Pattern",
      difficulty: 2
    },
    {
      id: 7,
      question: "What is 5 + 3 × 2?",
      options: ["16", "11", "13", "10"],
      correctAnswer: "11",
      explanation: "Order of operations: 3 × 2 = 6, then 5 + 6 = 11",
      type: "Math",
      difficulty: 2
    },
    {
      id: 8,
      question: "Book is to Read as Song is to:",
      options: ["Write", "Listen", "Dance", "Sing"],
      correctAnswer: "Listen",
      explanation: "You read a book, you listen to a song",
      type: "Word Relations",
      difficulty: 1
    },
    {
      id: 9,
      question: "Which number doesn't belong? 2, 4, 6, 9, 8",
      options: ["2", "4", "9", "8"],
      correctAnswer: "9",
      explanation: "All others are even numbers, 9 is odd",
      type: "Classification",
      difficulty: 1
    },
    {
      id: 10,
      question: "If all birds can fly and sparrow is a bird, then:",
      options: ["Sparrow cannot fly", "Sparrow can fly", "Sparrow is not a bird", "Cannot determine"],
      correctAnswer: "Sparrow can fly",
      explanation: "Logical deduction: All birds fly → Sparrow is bird → Sparrow can fly",
      type: "Logic",
      difficulty: 2
    }
  ];

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            setIsActive(false);
            setShowResult(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTest = () => {
    setTestStarted(true);
    setIsActive(true);
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(900);
    setShowResult(false);
    setAnswers([]);
    setSelectedAnswer('');
    setAiResponse('');
    setIsAnswered(false);
  };

  const handleAnswerSelect = (answer) => {
    if (!isAnswered) {
      setSelectedAnswer(answer);
    }
  };

  const submitAnswer = async () => {
    if (!selectedAnswer) return;

    setIsAnswered(true);
    setIsLoading(true);
    
    // Calculate score immediately
    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    const questionScore = isCorrect ? 10 : 0;
    setScore(prevScore => prevScore + questionScore);
    
    try {
      const response = await fetch('https://api.fireworks.ai/inference/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer fw_3ZTsr2Ea1vfDArT6gc1WGZpn',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'accounts/sentientfoundation/models/dobby-unhinged-llama-3-3-70b-new',
          messages: [
            {
              role: 'system',
              content: `You are an encouraging IQ test evaluator. The user selected "${selectedAnswer}" and the correct answer is "${questions[currentQuestion].correctAnswer}".

Provide encouraging feedback in this format:
${isCorrect ? 'Score: 10/10\nAnalysis: Correct! Great job!' : `Score: 0/10\nAnalysis: Incorrect. The right answer is "${questions[currentQuestion].correctAnswer}"`}
Feedback: [Give encouraging feedback and explain the reasoning]`
            },
            {
              role: 'user',
              content: `Question: ${questions[currentQuestion].question}
Selected Answer: ${selectedAnswer}
Correct Answer: ${questions[currentQuestion].correctAnswer}
Explanation: ${questions[currentQuestion].explanation}`
            }
          ],
          max_tokens: 200,
          temperature: 0.3
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiEvaluation = data.choices[0].message.content;
        setAiResponse(aiEvaluation);
      } else {
        throw new Error('API failed');
      }

    } catch (error) {
      // Fallback response
      setAiResponse(`Score: ${questionScore}/10
Analysis: ${isCorrect ? 'Correct answer! Well done!' : `Incorrect. The correct answer is "${questions[currentQuestion].correctAnswer}"`}
Feedback: ${questions[currentQuestion].explanation}`);
    }
    
    // Store answer
    setAnswers(prev => [...prev, {
      question: questions[currentQuestion].question,
      selectedAnswer: selectedAnswer,
      correctAnswer: questions[currentQuestion].correctAnswer,
      score: questionScore,
      isCorrect: isCorrect
    }]);

    setIsLoading(false);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer('');
      setAiResponse('');
      setIsAnswered(false);
    } else {
      setIsActive(false);
      setShowResult(true);
    }
  };

  const calculateIQ = (totalScore) => {
    const maxScore = questions.length * 10;
    const percentage = (totalScore / maxScore) * 100;
    
    let iq, level, color;
    if (percentage >= 90) { 
      iq = 135; level = 'Very Superior'; color = 'text-purple-400'; 
    } else if (percentage >= 80) { 
      iq = 125; level = 'Superior'; color = 'text-blue-400'; 
    } else if (percentage >= 70) { 
      iq = 115; level = 'Above Average'; color = 'text-emerald-400'; 
    } else if (percentage >= 60) { 
      iq = 110; level = 'High Average'; color = 'text-green-400'; 
    } else if (percentage >= 40) { 
      iq = 100; level = 'Average'; color = 'text-yellow-400'; 
    } else { 
      iq = 90; level = 'Below Average'; color = 'text-orange-400'; 
    }
    
    return { iq, level, color, percentage: Math.round(percentage) };
  };

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 max-w-lg w-full border border-slate-700 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Brain className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">AI IQ Test</h1>
            <p className="text-slate-300 text-lg">Sentient Intelligence Assessment</p>
          </div>
          
          <div className="bg-slate-700/30 rounded-2xl p-6 mb-6 border border-slate-600">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              Test Details
            </h3>
            <ul className="text-slate-300 space-y-2 text-sm">
              <li>• 10 Multiple Choice Questions</li>
              <li>• 15 minutes time limit</li>
              <li>• AI evaluation for each answer</li>
              <li>• Instant IQ score calculation</li>
              <li>• Covers: Logic, Math, Patterns, Words</li>
            </ul>
          </div>
            
          <button
            onClick={startTest}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
          >
            <Zap className="w-6 h-6" />
            Start IQ Test
          </button>
        </div>
      </div>
    );
  }

  if (showResult) {
    const results = calculateIQ(score);
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 max-w-4xl w-full border border-slate-700 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-14 h-14 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">IQ Test Complete! 🎉</h1>
            <p className="text-slate-300">Your intelligence has been analyzed by AI</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-700/30 rounded-2xl p-4 text-center border border-slate-600">
              <div className="text-3xl font-bold text-blue-400 mb-2">{results.iq}</div>
              <div className="text-slate-300 font-semibold text-sm">IQ Score</div>
            </div>
            <div className="bg-slate-700/30 rounded-2xl p-4 text-center border border-slate-600">
              <div className={`text-xl font-bold mb-2 ${results.color}`}>{results.level}</div>
              <div className="text-slate-300 font-semibold text-sm">Level</div>
            </div>
            <div className="bg-slate-700/30 rounded-2xl p-4 text-center border border-slate-600">
              <div className="text-3xl font-bold text-green-400 mb-2">{correctAnswers}/{questions.length}</div>
              <div className="text-slate-300 font-semibold text-sm">Correct</div>
            </div>
            <div className="bg-slate-700/30 rounded-2xl p-4 text-center border border-slate-600">
              <div className="text-3xl font-bold text-purple-400 mb-2">{results.percentage}%</div>
              <div className="text-slate-300 font-semibold text-sm">Accuracy</div>
            </div>
          </div>

          <div className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600 mb-6">
            <h3 className="text-white font-bold mb-4 text-xl">📊 AI Analysis:</h3>
            
            <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
              <h4 className="text-white font-semibold mb-3">Your Answer Sheet:</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {answers.map((answer, index) => (
                  <div key={index} className={`rounded-lg p-2 text-center text-sm ${answer.isCorrect ? 'bg-green-600/20 border border-green-600/30' : 'bg-red-600/20 border border-red-600/30'}`}>
                    <div className="text-white font-semibold">Q{index + 1}</div>
                    <div className={`text-xs ${answer.isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                      {answer.isCorrect ? '✓ Correct' : '✗ Wrong'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
              <h4 className="text-blue-300 font-semibold mb-2">🤖 AI Verdict:</h4>
              <p className="text-slate-200 text-sm">
                {results.iq >= 125 ? "Outstanding performance! You demonstrate excellent analytical thinking and problem-solving abilities. Your cognitive skills are well above average." :
                 results.iq >= 115 ? "Great job! You show strong reasoning capabilities and good intellectual potential. Keep challenging yourself!" :
                 results.iq >= 100 ? "Solid performance! Your intelligence is in the healthy average range. Practice more logical puzzles to sharpen your skills." :
                 "Good effort! Everyone has different strengths. Focus on practicing pattern recognition and logical reasoning to improve your score."}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            🔄 Take Test Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI IQ Test</h1>
              <p className="text-slate-300">Question {currentQuestion + 1} of {questions.length}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-white">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold">{score} points</span>
            </div>
            <div className="flex items-center gap-2">
              <Timer className={`w-5 h-5 ${timeLeft < 120 ? 'text-red-400' : 'text-green-400'}`} />
              <span className={`font-semibold text-lg ${timeLeft < 120 ? 'text-red-400' : 'text-white'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
          <div className="flex justify-between text-sm text-slate-300 mb-2">
            <span>Progress</span>
            <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Question Panel */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="px-4 py-2 bg-blue-600/20 text-blue-300 rounded-full text-sm font-medium border border-blue-600/30">
                {questions[currentQuestion].type}
              </div>
              <div className="flex">
                {[1].map((level) => (
                  <Star 
                    key={level} 
                    className="w-4 h-4 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-8 leading-relaxed">
              {questions[currentQuestion].question}
            </h2>
          </div>

          {/* MCQ Options */}
          <div className="space-y-3 mb-6">
            {questions[currentQuestion].options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === questions[currentQuestion].correctAnswer;
              const showResult = isAnswered;
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={isAnswered}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all transform hover:scale-[1.02] ${
                    showResult
                      ? isCorrect
                        ? 'bg-green-600/20 border-green-600 text-green-300'
                        : isSelected
                        ? 'bg-red-600/20 border-red-600 text-red-300'
                        : 'bg-slate-700/30 border-slate-600 text-slate-300'
                      : isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : 'bg-slate-700/30 border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      showResult && isCorrect
                        ? 'border-green-500 bg-green-500'
                        : showResult && isSelected && !isCorrect
                        ? 'border-red-500 bg-red-500'
                        : isSelected
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-slate-500'
                    }`}>
                      {(showResult && isCorrect) || (isSelected && !showResult) ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : null}
                    </div>
                    <span className="font-medium text-lg">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
            
          <button
            onClick={submitAnswer}
            disabled={isLoading || !selectedAnswer || isAnswered}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            {isLoading ? 'AI Analyzing...' : isAnswered ? 'Answer Submitted' : 'Submit Answer'}
          </button>
        </div>

        {/* AI Response Panel */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">AI Evaluation</h3>
          </div>
          
          {aiResponse ? (
            <div className="space-y-6">
              <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
                <pre className="text-slate-200 whitespace-pre-wrap text-sm leading-relaxed">
                  {aiResponse}
                </pre>
              </div>
              
              <button
                onClick={nextQuestion}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-4 px-6 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all transform hover:scale-105"
              >
                {currentQuestion < questions.length - 1 ? 'Next Question →' : 'View IQ Results →'}
              </button>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-700/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-400">Select an answer to get AI evaluation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SentientIQTester;
