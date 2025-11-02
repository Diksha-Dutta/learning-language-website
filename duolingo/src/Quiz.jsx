import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Award, Star, Zap, Lock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const Quiz = ({ authToken, currentUser, currentLanguage }) => {
  const [quizState, setQuizState] = useState('home');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(300);
  const [startTime, setStartTime] = useState(null);
  const [attemptsToday, setAttemptsToday] = useState(0);
  const [todaysPassed, setTodaysPassed] = useState(false);
  const [consecutiveDays, setConsecutiveDays] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:3000/api';

  const quizQuestions = {
    spanish: [
      {
        question: "What is the correct translation of 'I am learning Spanish'?",
        options: [
          "Estoy aprendiendo español",
          "Soy aprendiendo español",
          "Estar aprendiendo español",
          "Yo aprender español"
        ],
        correct: 0
      },
      {
        question: "Which verb form is correct: 'Nosotros _____ en Madrid'",
        options: ["vivemos", "vivimos", "viven", "viver"],
        correct: 1
      },
      {
        question: "How do you say 'The book is interesting' in Spanish?",
        options: [
          "El libro está interesante",
          "El libro es interesante",
          "La libro es interesante",
          "El libro ser interesante"
        ],
        correct: 1
      },
      {
        question: "What's the plural of 'el lápiz' (the pencil)?",
        options: ["los lápiz", "los lápizes", "los lápices", "las lápices"],
        correct: 2
      },
      {
        question: "Complete: 'Me gusta _____ música'",
        options: ["el", "la", "los", "las"],
        correct: 1
      },
      {
        question: "Which is the correct preterite form: 'Yo _____ ayer' (I went)",
        options: ["voy", "fui", "iba", "iré"],
        correct: 1
      },
      {
        question: "How do you say 'I would like' in Spanish?",
        options: ["Me gustaría", "Me gusta", "Me gustaba", "Me gustó"],
        correct: 0
      },
      {
        question: "What does 'hace frío' mean?",
        options: ["It's hot", "It's cold", "It's windy", "It's sunny"],
        correct: 1
      },
      {
        question: "Complete: '¿_____ años tienes?'",
        options: ["Cuánto", "Cuántos", "Cuánta", "Cuántas"],
        correct: 1
      },
      {
        question: "Which is correct: 'Ella _____ profesora'",
        options: ["está", "es", "ser", "estar"],
        correct: 1
      }
    ],
    french: [
      {
        question: "What is the correct translation of 'I am learning French'?",
        options: [
          "J'apprends le français",
          "Je suis apprendre français",
          "J'apprendre français",
          "Je apprends français"
        ],
        correct: 0
      },
      {
        question: "Which verb form is correct: 'Nous _____ à Paris'",
        options: ["habitons", "habites", "habitent", "habiter"],
        correct: 0
      },
      {
        question: "How do you say 'The book is interesting' in French?",
        options: [
          "Le livre est intéressant",
          "La livre est intéressant",
          "Le livre être intéressant",
          "Le livre est intéressante"
        ],
        correct: 0
      },
      {
        question: "What's the plural of 'le journal' (newspaper)?",
        options: ["les journals", "les journaux", "les journales", "las journaux"],
        correct: 1
      },
      {
        question: "Complete: 'J'aime _____ musique'",
        options: ["le", "la", "les", "l'"],
        correct: 1
      },
      {
        question: "Which is the correct past tense: 'Je _____ hier' (I went)",
        options: ["vais", "suis allé", "allais", "irai"],
        correct: 1
      },
      {
        question: "How do you say 'I would like' in French?",
        options: ["Je voudrais", "Je veux", "Je voulais", "Je voudrai"],
        correct: 0
      },
      {
        question: "What does 'il fait froid' mean?",
        options: ["It's hot", "It's cold", "It's windy", "It's sunny"],
        correct: 1
      },
      {
        question: "Complete: '_____ âge as-tu?'",
        options: ["Quel", "Quelle", "Quels", "Quelles"],
        correct: 0
      },
      {
        question: "Which is correct: 'Elle _____ professeur'",
        options: ["a", "est", "être", "avoir"],
        correct: 1
      }
    ],
    german: [
      {
        question: "What is the correct translation of 'I am learning German'?",
        options: [
          "Ich lerne Deutsch",
          "Ich bin lernen Deutsch",
          "Ich lernt Deutsch",
          "Ich lernend Deutsch"
        ],
        correct: 0
      },
      {
        question: "Which verb form is correct: 'Wir _____ in Berlin'",
        options: ["wohnt", "wohnen", "wohnst", "wohne"],
        correct: 1
      },
      {
        question: "How do you say 'The book is interesting' in German?",
        options: [
          "Das Buch ist interessant",
          "Der Buch ist interessant",
          "Die Buch ist interessant",
          "Das Buch sein interessant"
        ],
        correct: 0
      },
      {
        question: "What's the plural of 'das Kind' (child)?",
        options: ["die Kinds", "die Kinder", "die Kindes", "das Kinder"],
        correct: 1
      },
      {
        question: "Complete: 'Ich mag _____ Musik'",
        options: ["der", "die", "das", "den"],
        correct: 1
      },
      {
        question: "Which is the correct past tense: 'Ich _____ gestern' (I went)",
        options: ["gehe", "bin gegangen", "ging", "gehen"],
        correct: 1
      },
      {
        question: "How do you say 'I would like' in German?",
        options: ["Ich möchte", "Ich mag", "Ich will", "Ich wollte"],
        correct: 0
      },
      {
        question: "What does 'es ist kalt' mean?",
        options: ["It's hot", "It's cold", "It's windy", "It's sunny"],
        correct: 1
      },
      {
        question: "Complete: '_____ alt bist du?'",
        options: ["Was", "Wie", "Wer", "Wo"],
        correct: 1
      },
      {
        question: "Which is correct: 'Sie _____ Lehrerin'",
        options: ["hat", "ist", "sein", "haben"],
        correct: 1
      }
    ]
  };

  const questions = quizQuestions[currentLanguage] || quizQuestions.spanish;

  useEffect(() => {
    if (authToken) {
      loadQuizData();
    }
  }, [authToken]);

  useEffect(() => {
    if (quizState === 'taking' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (quizState === 'taking' && timeLeft === 0) {
      finishQuiz();
    }
  }, [quizState, timeLeft]);

  const loadQuizData = async () => {
    try {
      // Load attempts for today
      const attemptsRes = await fetch(`${API_URL}/quiz/attempts/today`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (attemptsRes.ok) {
        const attemptsData = await attemptsRes.json();
        setAttemptsToday(attemptsData.attemptsCount);
        setTodaysPassed(attemptsData.passed);
      }

      // Load streak
      const streakRes = await fetch(`${API_URL}/quiz/streak`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (streakRes.ok) {
        const streakData = await streakRes.json();
        setConsecutiveDays(streakData.consecutiveDays);
        setUnlockedBadges(streakData.unlockedBadges || []);
      }

      // Load leaderboard
      const leaderboardRes = await fetch(`${API_URL}/quiz/leaderboard`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (leaderboardRes.ok) {
        const leaderboardData = await leaderboardRes.json();
        setLeaderboard(leaderboardData);
      }
    } catch (error) {
      console.error('Error loading quiz data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    if (attemptsToday >= 3) {
      alert('You\'ve used all 3 attempts for today. Come back tomorrow!');
      return;
    }
    if (todaysPassed) {
      alert('You\'ve already passed today\'s quiz!');
      return;
    }
    setQuizState('taking');
    setCurrentQuestion(0);
    setAnswers([]);
    setTimeLeft(300);
    setStartTime(Date.now());
  };

  const selectAnswer = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const finishQuiz = async () => {
    const score = calculateScore();
    const passed = score >= 75;
    const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 300 - timeLeft;
    
    // Prepare answers data
    const answersData = answers.map((answer, index) => ({
      questionIndex: index,
      userAnswer: answer,
      correct: answer === questions[index].correct
    }));

    try {
      const response = await fetch(`${API_URL}/quiz/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          language: currentLanguage,
          score,
          passed,
          answers: answersData,
          timeSpent
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update local state
        setAttemptsToday(prev => prev + 1);
        
        if (passed) {
          setTodaysPassed(true);
          if (data.streak) {
            setConsecutiveDays(data.streak.consecutiveDays);
            setUnlockedBadges(data.streak.unlockedBadges || []);
          }
        }

        // Reload leaderboard
        await loadLeaderboard();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please check your connection.');
    }

    setQuizState('results');
  };

  const loadLeaderboard = async () => {
    try {
      const response = await fetch(`${API_URL}/quiz/leaderboard`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === questions[index].correct) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canTakeQuiz = () => {
    return attemptsToday < 3 && !todaysPassed;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // HOME VIEW
  if (quizState === 'home') {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Trophy size={40} />
              <div>
                <h2 className="text-3xl font-bold">Daily Quiz Challenge</h2>
                <p className="text-purple-100">Test your knowledge & compete!</p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <Zap className="mx-auto mb-1" size={24} />
              <p className="text-2xl font-bold">{consecutiveDays}</p>
              <p className="text-xs">Day Streak</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
              <Clock size={20} className="mx-auto mb-2" />
              <p className="text-sm font-semibold">5 Minutes</p>
              <p className="text-xs opacity-90">Time Limit</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
              <CheckCircle size={20} className="mx-auto mb-2" />
              <p className="text-sm font-semibold">75% Pass</p>
              <p className="text-xs opacity-90">Minimum Score</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
              <AlertCircle size={20} className="mx-auto mb-2" />
              <p className="text-sm font-semibold">{3 - attemptsToday}/3</p>
              <p className="text-xs opacity-90">Attempts Left</p>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Trophy className="text-yellow-500" size={24} />
            Top Performers (Last 7 Days)
          </h3>
          {leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    index === 0
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white'
                      : index === 1
                      ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800'
                      : 'bg-gradient-to-r from-orange-300 to-orange-400 text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                    <div>
                      <p className="font-bold">{entry.name}</p>
                      <p className="text-sm opacity-90">Quiz Master</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{entry.score}%</p>
                    <p className="text-xs opacity-90">Score</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Trophy size={48} className="mx-auto mb-2 opacity-30" />
              <p>No scores yet. Be the first to compete!</p>
            </div>
          )}
        </div>

        {/* Streak Rewards */}
        {consecutiveDays > 0 && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-green-800 dark:text-green-300 mb-4 flex items-center gap-2">
              <Award size={24} />
              Streak Rewards Progress
            </h3>
            <div className="space-y-3">
              {[
                { days: 3, badge: 'bronze', icon: '🎖️', name: 'Bronze Badge' },
                { days: 7, badge: 'silver', icon: '🥈', name: 'Silver Badge' },
                { days: 14, badge: 'gold', icon: '🥇', name: 'Gold Badge' },
                { days: 30, badge: 'diamond', icon: '💎', name: 'Diamond Badge' }
              ].map(({ days, badge, icon, name }) => (
                <div key={days} className="flex items-center gap-3">
                  {unlockedBadges.includes(badge) ? (
                    <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
                  ) : (
                    <Lock className="text-gray-400" size={24} />
                  )}
                  <div className="flex-1">
                    <p className={`font-semibold ${unlockedBadges.includes(badge) ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}`}>
                      {days} Day Streak - {icon} {name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {unlockedBadges.includes(badge) ? 'Unlocked!' : `${days - consecutiveDays} days to go`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Start Quiz Button */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          {todaysPassed ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Quiz Completed for Today!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You've already passed today's quiz. Come back tomorrow for a new challenge!
              </p>
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-4 rounded-lg">
                <p className="text-green-800 dark:text-green-300 font-semibold">
                  🎉 Keep your streak alive by coming back tomorrow!
                </p>
              </div>
            </div>
          ) : !canTakeQuiz() ? (
            <div className="text-center py-8">
              <XCircle className="mx-auto mb-4 text-red-500" size={64} />
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                No Attempts Left
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You've used all 3 attempts for today. Practice more and try again tomorrow!
              </p>
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 p-4 rounded-lg">
                <p className="text-blue-800 dark:text-blue-300 font-semibold">
                  💡 Tip: Review your lessons to improve your score tomorrow!
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  Ready to Take the Quiz?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Answer 10 questions in 5 minutes. You need 75% to pass.
                </p>
              </div>
              <button
                onClick={startQuiz}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
              >
                <Trophy size={24} />
                Start Quiz ({3 - attemptsToday} attempts left)
              </button>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                ⚡ Quick tip: Review fundamentals before starting!
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // TAKING QUIZ VIEW
  if (quizState === 'taking') {
    const currentQ = questions[currentQuestion];

    return (
      <div className="space-y-6">
        {/* Timer and Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Clock className={timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-blue-500'} size={24} />
              <span className={`text-2xl font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-gray-800 dark:text-white'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Question</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">
                {currentQuestion + 1}/{questions.length}
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
            {currentQ.question}
          </h3>

          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => selectAnswer(index)}
                className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                  answers[currentQuestion] === index
                    ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-blue-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    answers[currentQuestion] === index
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {answers[currentQuestion] === index && (
                      <CheckCircle className="text-white" size={16} />
                    )}
                  </div>
                  <span className="text-gray-800 dark:text-white font-medium">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex gap-3">
            <button
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
              className="flex-1 py-3 px-6 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={nextQuestion}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-xl transition-all"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={finishQuiz}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Trophy size={20} />
                Finish Quiz
              </button>
            )}
          </div>

          {/* Question Navigator */}
          <div className="grid grid-cols-10 gap-2 mt-4">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`aspect-square rounded-lg text-xs font-bold transition-all ${
                  answers[index] !== undefined
                    ? 'bg-green-500 text-white'
                    : currentQuestion === index
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // RESULTS VIEW
  if (quizState === 'results') {
    const score = calculateScore();
    const passed = score >= 75;
    const correct = answers.filter((answer, index) => answer === questions[index].correct).length;

    return (
      <div className="space-y-6">
        <div className={`rounded-2xl shadow-lg p-8 text-center ${
          passed
            ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white'
            : 'bg-gradient-to-br from-red-500 to-pink-500 text-white'
        }`}>
          <div className="mb-6">
            {passed ? (
              <Trophy className="mx-auto mb-4 animate-bounce" size={80} />
            ) : (
              <XCircle className="mx-auto mb-4" size={80} />
            )}
            <h2 className="text-4xl font-bold mb-2">
              {passed ? 'Congratulations! 🎉' : 'Keep Trying! 💪'}
            </h2>
            <p className="text-xl opacity-90">
              {passed ? 'You passed the quiz!' : 'You didn\'t pass this time'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <Star size={24} className="mx-auto mb-2" />
              <p className="text-3xl font-bold">{score}%</p>
              <p className="text-sm opacity-90">Your Score</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <CheckCircle size={24} className="mx-auto mb-2" />
              <p className="text-3xl font-bold">{correct}/{questions.length}</p>
              <p className="text-sm opacity-90">Correct</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <Zap size={24} className="mx-auto mb-2" />
              <p className="text-3xl font-bold">{consecutiveDays}</p>
              <p className="text-sm opacity-90">Day Streak</p>
            </div>
          </div>

          {passed && (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6">
              <p className="text-lg font-semibold">
                {consecutiveDays === 3 && '🎖️ 3-Day Streak! You unlocked the Bronze Badge!'}
                {consecutiveDays === 7 && '🥈 7-Day Streak! You unlocked the Silver Badge!'}
                {consecutiveDays === 14 && '🥇 14-Day Streak! You unlocked the Gold Badge!'}
                {consecutiveDays === 30 && '💎 30-Day Streak! You unlocked the Diamond Badge!'}
                {consecutiveDays < 3 && `Keep it up! ${3 - consecutiveDays} more days to unlock Bronze Badge!`}
                {consecutiveDays > 3 && consecutiveDays < 7 && `Amazing! ${7 - consecutiveDays} more days to Silver!`}
                {consecutiveDays > 7 && consecutiveDays < 14 && `Outstanding! ${14 - consecutiveDays} more days to Gold!`}
                {consecutiveDays > 14 && consecutiveDays < 30 && `Incredible! ${30 - consecutiveDays} more days to Diamond!`}
                {consecutiveDays > 30 && '💎 You are a Quiz Legend!'}
              </p>
            </div>
          )}

          <button
            onClick={() => {
              setQuizState('home');
              setAnswers([]);
              setCurrentQuestion(0);
              loadQuizData();
            }}
            className="bg-white text-gray-800 hover:bg-gray-100 font-bold py-4 px-8 rounded-xl shadow-lg transition-all"
          >
            Back to Home
          </button>
        </div>

        {/* Detailed Results */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            Review Your Answers
          </h3>
          <div className="space-y-4">
            {questions.map((q, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === q.correct;
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    isCorrect
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-2">
                    {isCorrect ? (
                      <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0" size={24} />
                    ) : (
                      <XCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={24} />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 dark:text-white mb-2">
                        {index + 1}. {q.question}
                      </p>
                      {!isCorrect && (
                        <>
                          <p className="text-sm text-red-700 dark:text-red-300 mb-1">
                            ❌ Your answer: {userAnswer !== undefined ? q.options[userAnswer] : 'No answer'}
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            ✓ Correct answer: {q.options[q.correct]}
                          </p>
                        </>
                      )}
                      {isCorrect && (
                        <p className="text-sm text-green-700 dark:text-green-300">
                          ✓ {q.options[q.correct]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
            {passed ? '🎯 What\'s Next?' : '📚 Keep Learning!'}
          </h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {passed ? (
              <>
                <li>✓ Come back tomorrow to continue your streak</li>
                <li>✓ Practice more lessons to improve your skills</li>
                <li>✓ Challenge yourself with conversations</li>
              </>
            ) : (
              <>
                <li>• You have {3 - attemptsToday} attempts remaining today</li>
                <li>• Review fundamentals and core lessons</li>
                <li>• Practice with conversations before retrying</li>
              </>
            )}
          </ul>
        </div>
      </div>
    );
  }

  return null;
};

export default Quiz;