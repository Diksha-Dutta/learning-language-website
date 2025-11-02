import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Award, MessageCircle, Camera, Settings, CheckCircle,
  Star, TrendingUp, Users, Heart, Zap, Lock, Trophy, LogOut, User,
  Menu, X, Bell, BellOff, Pause, Play, Upload, XCircle
} from 'lucide-react';
import CommunityView from './CommunityView';
import Quiz from './Quiz';

const App = () => {
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authView, setAuthView] = useState('login');
  const [authToken, setAuthToken] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(true);

 
  const [currentView, setCurrentView] = useState('home');
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [notificationTone, setNotificationTone] = useState('encouraging');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [graceDaysUsed, setGraceDaysUsed] = useState(0);
  const [graceDaysAvailable, setGraceDaysAvailable] = useState(1);
  const [lastActivityDate, setLastActivityDate] = useState(new Date().toISOString());
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [fundamentalView, setFundamentalView] = useState(null);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState(['spanish']);
  const [currentLanguage, setCurrentLanguage] = useState('spanish');
  const [progress, setProgress] = useState({
    spanish: { a1: 0, a2: 0, b1: 0 },
    french: { a1: 0, a2: 0, b1: 0 },
    german: { a1: 0, a2: 0, b1: 0 }
  });
  const [theme, setTheme] = useState('light');

  const API_URL = 'http://localhost:3000/api';

 
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
      checkAuth().finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);
  
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved || (prefersDark ? 'dark' : 'light');
    setTheme(initial);
    document.documentElement.classList.toggle('dark', initial === 'dark');
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const checkAuth = async () => {
    const token = authToken || localStorage.getItem('authToken');
    if (!token) {
      setAuthLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        updateLocalState(data.user);
      } else {
        handleLogout();
      }
    } catch (e) {
      console.error(e);
      handleLogout();
    } finally {
      setAuthLoading(false);
    }
  };

  const updateLocalState = (user) => {
    setStreak(user.currentStreak || 0);
    setXp(user.totalXP || 0);
    setProgress(user.progress || {
      spanish: { a1: 0, a2: 0, b1: 0 },
      french: { a1: 0, a2: 0, b1: 0 },
      german: { a1: 0, a2: 0, b1: 0 }
    });
    setSelectedLanguages(user.selectedLanguages || ['spanish']);
    setCurrentLanguage(user.currentLanguage || 'spanish');
    setNotificationTone(user.notificationTone || 'encouraging');
    setGraceDaysUsed(user.graceDaysUsed || 0);
    setGraceDaysAvailable(user.graceDaysAvailable || 1);
    setLastActivityDate(user.lastActivityDate || new Date().toISOString());
    
    
    const notifPref = localStorage.getItem('notificationsEnabled');
    if (notifPref) setNotificationsEnabled(notifPref === 'true');
  };

 
  const useGraceDay = async () => {
    if (graceDaysUsed >= graceDaysAvailable) {
      alert('No grace days available this month!');
      return;
    }

    if (!window.confirm('Use a grace day to protect your streak? (1 available per month)')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/progress/use-grace-day`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setGraceDaysUsed(data.user.graceDaysUsed);
        setLastActivityDate(new Date().toISOString());
        alert('Grace day used! Your streak is protected for today.');
      }
    } catch (error) {
   
      const newUsed = graceDaysUsed + 1;
      setGraceDaysUsed(newUsed);
      setLastActivityDate(new Date().toISOString());
      localStorage.setItem('graceDaysUsed', newUsed.toString());
      alert('Grace day used! Your streak is protected for today.');
    }
  };

 
  const isStreakAtRisk = () => {
    const lastDate = new Date(lastActivityDate);
    const today = new Date();
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 1;
  };


  const notificationMessages = {
    encouraging: [
      "🌟 You're doing amazing! Ready for today's lesson?",
      "💪 Keep that streak alive! Let's learn something new!",
      "🎯 Your language goals are waiting! Time to practice!",
      "✨ Every lesson brings you closer to fluency!",
      "🚀 You've got this! Let's continue your journey!"
    ],
    neutral: [
      "Time for your daily language practice",
      "Your lesson is ready",
      "Daily practice reminder",
      "Continue your learning session",
      "Language practice available"
    ],
    minimal: [
      "Practice available",
      "Lesson ready",
      "Daily reminder",
      "Time to learn",
      "Practice now"
    ]
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  };

  const sendNotification = (message) => {
    if (Notification.permission === 'granted') {
      new Notification('EthiLearn', {
        body: message,
        icon: '🦉',
        badge: '🦉',
        tag: 'ethilearn-reminder',
        requireInteraction: false
      });
    }
  };

  const scheduleNotification = () => {
    if (!notificationsEnabled) return;

    const messages = notificationMessages[notificationTone];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    const interval = setInterval(() => {
      if (notificationsEnabled && document.hidden) {
        sendNotification(randomMessage);
      }
    }, 24 * 60 * 60 * 1000); 

    return () => clearInterval(interval);
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsEnabled(true);
        localStorage.setItem('notificationsEnabled', 'true');
        sendNotification('Notifications enabled! We\'ll remind you to practice daily.');
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem('notificationsEnabled', 'false');
    }
  };

  useEffect(() => {
    if (notificationsEnabled) {
      const cleanup = scheduleNotification();
      return cleanup;
    }
  }, [notificationsEnabled, notificationTone]);

  
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await response.json();
      if (response.ok) {
        const token = data.token;
        localStorage.setItem('authToken', token);
        setAuthToken(token);
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        updateLocalState(data.user);
        setLoginForm({ email: '', password: '' });
      } else {
        setAuthError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthError('Cannot connect to server');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm)
      });
      const data = await response.json();
      if (response.ok) {
        const token = data.token;
        localStorage.setItem('authToken', token);
        setAuthToken(token);
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        updateLocalState(data.user);
        setRegisterForm({ name: '', email: '', password: '' });
      } else {
        setAuthError(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Register error:', error);
      setAuthError('Cannot connect to server');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('home');
    setStreak(0);
    setXp(0);
  };

  const completeLesson = async (lessonType, xpEarned) => {
    if (!authToken) return;
    
   
    setLastActivityDate(new Date().toISOString());
    
    try {
      const response = await fetch(`${API_URL}/progress/complete-lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          lessonType,
          lessonId: `${lessonType}-${Date.now()}`,
          xpEarned,
          language: currentLanguage
        })
      });
      if (response.ok) {
        const data = await response.json();
        setStreak(data.user.currentStreak);
        setXp(data.user.totalXP);
        setProgress(data.user.progress);
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  const updateSettings = async (settings) => {
    if (!authToken) return;
    try {
      const response = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(settings)
      });
      if (response.ok) {
        const data = await response.json();
        if (data.user) updateLocalState(data.user);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  
  const ScannerView = () => {
    const [scanning, setScanning] = useState(false);
    const [scannedText, setScannedText] = useState('');
    const [translation, setTranslation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [stream, setStream] = useState(null);
    const [useFile, setUseFile] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);

    const startCamera = async () => {
      try {
        setError('');
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
        setScanning(true);
      } catch (err) {
        setError('Camera access denied. Please enable camera permissions or upload an image.');
        console.error(err);
      }
    };

    const stopCamera = () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      setScanning(false);
    };

    const captureAndOCR = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      setLoading(true);
      setError('');

      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      canvas.toBlob(async (blob) => {
        await processImage(blob);
      });
    };

    const handleFileUpload = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setLoading(true);
      setError('');
      await processImage(file);
    };

    const processImage = async (imageBlob) => {
      try {
       
        
      
        await new Promise(resolve => setTimeout(resolve, 2000));

    
        const demoTexts = {
          spanish: 'Hola, ¿cómo estás?',
          french: 'Bonjour, comment allez-vous?',
          german: 'Hallo, wie geht es dir?'
        };

        const demoTranslations = {
          spanish: 'Hello, how are you?',
          french: 'Hello, how are you?',
          german: 'Hello, how are you?'
        };

        setScannedText(demoTexts[currentLanguage] || demoTexts.spanish);
        setTranslation(demoTranslations[currentLanguage] || demoTranslations.spanish);

        
        await completeLesson('scanner', 5);
        
        setLoading(false);
        stopCamera();
      } catch (err) {
        setError('Failed to process image. Please try again.');
        setLoading(false);
      }
    };

    const reset = () => {
      setScannedText('');
      setTranslation('');
      setError('');
      setUseFile(false);
      stopCamera();
    };

    return (
      <div className="space-y-6 max-w-2xl mx-auto p-4">
        <button
          onClick={() => setCurrentView('home')}
          className="text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium"
        >
          ← Back to Home
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-3">
            <Camera className="text-orange-500" size={28} />
            Text Scanner
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Scan real-world text like menus, signs, or books to learn vocabulary!
          </p>

          {!scanning && !scannedText && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <button
                  onClick={startCamera}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Camera size={24} />
                  Open Camera
                </button>

                <button
                  onClick={() => {
                    setUseFile(true);
                    fileInputRef.current?.click();
                  }}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Upload size={24} />
                  Upload Image
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 p-4 rounded-xl">
                  {error}
                </div>
              )}
            </div>
          )}

          {scanning && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-64 object-cover"
                  autoPlay
                  playsInline
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={captureAndOCR}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Capture & Scan'}
                </button>

                <button
                  onClick={stopCamera}
                  className="px-6 py-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Scanning text...
              </p>
            </div>
          )}

          {scannedText && !loading && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-6">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={24} />
                  Scanned Text
                </h3>
                <p className="text-xl text-gray-900 dark:text-gray-100 mb-4">
                  {scannedText}
                </p>
                <div className="border-t-2 border-blue-300 dark:border-blue-700 pt-4">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Translation:
                  </p>
                  <p className="text-lg text-gray-800 dark:text-gray-200">
                    {translation}
                  </p>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 p-4 rounded-xl">
                <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                  ✨ +5 XP earned! Keep scanning to learn more vocabulary.
                </p>
              </div>

              <button
                onClick={reset}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                Scan Another
              </button>
            </div>
          )}

          {!scanning && !scannedText && !loading && (
            <div className="mt-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-dashed border-yellow-300 dark:border-yellow-700 rounded-xl p-6">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong className="text-orange-600 dark:text-orange-400">💡 Tip:</strong> Point your camera at restaurant menus, street signs, or book pages to practice reading in {languageData[currentLanguage].name}!
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  
  const ConversationsView = () => {
    const [conversationStarted, setConversationStarted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const debounceRef = useRef(null);
    const synth = window.speechSynthesis;

    const conversationQuestions = {
      spanish: [
        { q: '¿Cómo te llamas?', a: ['me llamo', 'mi nombre es'] },
        { q: '¿De dónde eres?', a: ['soy de', 'vivo en'] },
        { q: '¿Dónde vives ahora?', a: ['vivo en', 'estoy en'] },
        { q: '¿Qué te gusta hacer?', a: ['me gusta', 'amo', 'disfruto'] },
        { q: '¿Cuántos años tienes?', a: ['tengo', 'años'] }
      ],
      french: [
        { q: 'Comment vous appelez-vous ?', a: ['je m\'appelle', 'mon nom est'] },
        { q: 'D\'où venez-vous ?', a: ['je viens de', 'je suis de'] },
        { q: 'Où habitez-vous ?', a: ['j\'habite à', 'je vis à'] },
        { q: 'Qu\'aimez-vous faire ?', a: ['j\'aime', 'j\'adore'] },
        { q: 'Quel âge avez-vous ?', a: ['j\'ai', 'ans'] }
      ],
      german: [
        { q: 'Wie heißen Sie?', a: ['ich heiße', 'mein name ist'] },
        { q: 'Woher kommen Sie?', a: ['ich komme aus', 'ich bin aus'] },
        { q: 'Wo wohnen Sie?', a: ['ich wohne in', 'ich lebe in'] },
        { q: 'Was machen Sie gern?', a: ['ich mag', 'ich liebe'] },
        { q: 'Wie alt sind Sie?', a: ['ich bin', 'jahre alt'] }
      ]
    };

    const questions = conversationQuestions[currentLanguage] || conversationQuestions.spanish;
    const currentQ = questions[currentQuestionIndex];

    const speak = (text) => {
      if (!synth) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = currentLanguage === 'spanish' ? 'es-ES' :
               currentLanguage === 'french' ? 'fr-FR' : 'de-DE';
      u.rate = 0.9;
      synth.speak(u);
    };

    const startListening = () => {
      setErrorMsg('');
      if (debounceRef.current) return;
      debounceRef.current = setTimeout(() => (debounceRef.current = null), 500);

      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        setErrorMsg('Speech recognition not supported – try Chrome.');
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.lang = currentLanguage === 'spanish' ? 'es-ES' :
                 currentLanguage === 'french' ? 'fr-FR' : 'de-DE';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.continuous = false;

      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript.toLowerCase().trim();
        setUserAnswer(transcript);
        checkAnswer(transcript);
      };

      rec.onerror = (e) => {
        setIsListening(false);
        let msg = 'Mic error: ';
        switch (e.error) {
          case 'not-allowed': msg += 'Permission denied – allow microphone.'; break;
          case 'network': msg += 'No internet.'; break;
          case 'no-speech': msg += 'No speech – speak louder.'; break;
          default: msg += 'Try again.';
        }
        setErrorMsg(msg);
      };

      rec.onend = () => setIsListening(false);

      try {
        rec.start();
        setIsListening(true);
      } catch (err) {
        setErrorMsg('Failed to start mic.');
      }
    };

    const checkAnswer = (answer) => {
      const correct = currentQ.a.some(k => answer.includes(k.toLowerCase()));
      setIsCorrect(correct);
      setShowResult(true);
      if (correct) {
        setTimeout(() => {
          if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(i => i + 1);
            setUserAnswer('');
            setShowResult(false);
            setTimeout(() => speak(questions[currentQuestionIndex + 1].q), 800);
          } else {
            completeConversation();
          }
        }, 1500);
      }
    };

    const completeConversation = async () => {
      await completeLesson('conversation', 50);
      alert('¡Conversación completada! +50 XP');
      setConversationStarted(false);
      setCurrentQuestionIndex(0);
    };

    const startConversation = () => {
      setConversationStarted(true);
      speak(currentQ.q);
    };

    useEffect(() => {
      if (conversationStarted && currentQ) speak(currentQ.q);
    }, [currentQuestionIndex, conversationStarted]);

    if (!conversationStarted) {
      return (
        <div className="space-y-6">
          <button onClick={() => setCurrentView('home')} className="text-green-900 dark:text-green-400 font-medium">
            ← Back to Home
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Practice Speaking</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Have a real conversation! Answer 5 questions aloud.
            </p>

            <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 p-6 rounded-lg mb-6">
              <p className="text-lg font-medium text-gray-800 dark:text-white">We'll ask in {languageData[currentLanguage].name}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">Speak clearly • No typing needed</p>
            </div>

            <button
              onClick={startConversation}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-3 mx-auto"
            >
              <MessageCircle size={24} />
              Start Conversation
            </button>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
              Earn 10 XP per correct answer • 50 XP bonus for completion
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <button onClick={() => setCurrentView('home')} className="text-green-900 dark:text-green-400 font-medium">
          ← Back to Home
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h3>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {languageData[currentLanguage].name}
            </span>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg text-center mb-6">
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-4">{currentQ.q}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">Tap mic & speak</p>
          </div>

          <div className="text-center space-y-4">
            <button
              onClick={startListening}
              disabled={isListening}
              className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg transition-all ${
                isListening ? 'bg-red-500 animate-pulse' : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              🎤
            </button>

            {userAnswer && (
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">You said:</p>
                <p className="font-bold text-gray-800 dark:text-white">"{userAnswer}"</p>
              </div>
            )}

            {showResult && (
              <div className={`p-4 rounded-lg font-bold text-lg ${isCorrect ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                {isCorrect ? '✓ Correct!' : '✗ Try again!'}
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 p-3 rounded-lg text-center">
                <p className="text-sm text-red-800 dark:text-red-300">{errorMsg}</p>
                <button onClick={startListening} className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded text-sm">
                  Retry
                </button>
              </div>
            )}

            <button onClick={() => speak(currentQ.q)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
              🔊 Repeat Question
            </button>
          </div>

          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-4 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              <strong>Tip:</strong> Include keywords like "me llamo", "vivo en", "j'habite"...
            </p>
          </div>
        </div>
      </div>
    );
  };

 
  const languageData = {
    spanish: {
      name: 'Spanish',
      flag: '🇪🇸',
      color: 'from-red-500 to-yellow-500',
      fundamentals: {
        grammar: {
          nouns: [
            { word: 'el libro', translation: 'the book', pronunciation: 'el LEE-bro' },
            { word: 'la casa', translation: 'the house', pronunciation: 'la KAH-sah' },
            { word: 'el perro', translation: 'the dog', pronunciation: 'el PEH-rro' },
            { word: 'la gata', translation: 'the cat', pronunciation: 'la GAH-tah' },
            { word: 'el agua', translation: 'the water', pronunciation: 'el AH-gwah' }
          ],
          pronouns: [
            { word: 'yo', translation: 'I', pronunciation: 'yoh' },
            { word: 'tú', translation: 'you (informal)', pronunciation: 'too' },
            { word: 'él', translation: 'he', pronunciation: 'el' },
            { word: 'ella', translation: 'she', pronunciation: 'EH-yah' },
            { word: 'nosotros', translation: 'we', pronunciation: 'noh-SOH-tros' }
          ],
          adjectives: [
            { word: 'grande', translation: 'big', pronunciation: 'GRAHN-deh' },
            { word: 'pequeño', translation: 'small', pronunciation: 'peh-KEH-nyo' },
            { word: 'bonito', translation: 'beautiful', pronunciation: 'boh-NEE-toh' }
          ]
        },
        alphabet: [
          { letter: 'A', pronunciation: 'ah', example: 'agua (water)' },
          { letter: 'B', pronunciation: 'beh', example: 'burro (donkey)' },
          { letter: 'C', pronunciation: 'seh', example: 'casa (house)' }
        ],
        numbers: [
          { number: '1', word: 'uno', pronunciation: 'OO-noh' },
          { number: '2', word: 'dos', pronunciation: 'dohs' },
          { number: '3', word: 'tres', pronunciation: 'trehs' }
        ],
        articles: [
          { word: 'el', translation: 'the (masc)', pronunciation: 'el', example: 'el libro' },
          { word: 'la', translation: 'the (fem)', pronunciation: 'lah', example: 'la casa' }
        ]
      }
    },
    french: {
      name: 'French',
      flag: '🇫🇷',
      color: 'from-blue-600 to-red-600',
      fundamentals: {
        grammar: {
          nouns: [
            { word: 'le livre', translation: 'the book', pronunciation: 'luh LEE-vruh' },
            { word: 'la maison', translation: 'the house', pronunciation: 'lah may-ZOHN' }
          ],
          pronouns: [
            { word: 'je', translation: 'I', pronunciation: 'zhuh' },
            { word: 'tu', translation: 'you', pronunciation: 'too' }
          ],
          adjectives: [
            { word: 'grand', translation: 'big', pronunciation: 'grahn' }
          ]
        },
        alphabet: [{ letter: 'A', pronunciation: 'ah', example: 'ami' }],
        numbers: [{ number: '1', word: 'un', pronunciation: 'uhn' }],
        articles: [{ word: 'le', translation: 'the', pronunciation: 'luh', example: 'le livre' }]
      }
    },
    german: {
      name: 'German',
      flag: '🇩🇪',
      color: 'from-gray-800 to-red-600',
      fundamentals: {
        grammar: {
          nouns: [
            { word: 'das Buch', translation: 'the book', pronunciation: 'dahs bookh' }
          ],
          pronouns: [
            { word: 'ich', translation: 'I', pronunciation: 'ikh' }
          ],
          adjectives: [
            { word: 'groß', translation: 'big', pronunciation: 'grohs' }
          ]
        },
        alphabet: [{ letter: 'A', pronunciation: 'ah', example: 'Apfel' }],
        numbers: [{ number: '1', word: 'eins', pronunciation: 'eyns' }],
        articles: [{ word: 'der', translation: 'the', pronunciation: 'dehr', example: 'der Hund' }]
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-500 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="bg-gradient-to-br from-green-400 to-green-500 w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 animate-pulse">
            <span className="text-5xl">🦉</span>
          </div>
          <h1 className="text-3xl font-black text-gray-800 dark:text-white">EthiLearn</h1>
          <p className="text-gray-700 dark:text-gray-300 mt-2">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-400 to-green-500 dark:from-green-900 dark:to-green-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-green-400 to-green-500 w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
              <span className="text-5xl">🦉</span>
            </div>
            <h1 className="text-3xl font-black text-gray-800 dark:text-white">EthiLearn</h1>
            <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">Ethical Language Learning</p>
          </div>

          {authError && (
            <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 p-3 rounded-xl mb-4 text-sm">
              {authError}
            </div>
          )}

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setAuthView('login'); setAuthError(''); }}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                authView === 'login' ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setAuthView('register'); setAuthError(''); }}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                authView === 'register' ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Sign Up
            </button>
          </div>

          {authView === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-green-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-green-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              >
                {authLoading ? 'Logging in...' : 'LOGIN'}
              </button>
            </form>
          )}

          {authView === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-green-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-green-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-green-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimum 6 characters</p>
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              >
                {authLoading ? 'Creating account...' : 'SIGN UP'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            <p>No guilt-tripping • Unlimited practice • Free streak pause</p>
          </div>
        </div>
      </div>
    );
  }

 
  const Sidebar = () => (
    <div className="hidden lg:flex flex-col w-80 p-6 space-y-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-4 rounded-lg text-center border border-orange-200 dark:border-orange-700">
          <Zap className="text-orange-500 mx-auto mb-2" size={28} />
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{streak}</p>
          <p className="text-xs text-orange-600 dark:text-orange-500">Day Streak</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-lg text-center border border-blue-200 dark:border-blue-700">
          <Star className="text-blue-500 mx-auto mb-2" size={28} />
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{xp}</p>
          <p className="text-xs text-blue-600 dark:text-blue-500">Total XP</p>
        </div>
      </div>

 
      {isStreakAtRisk() && graceDaysUsed < graceDaysAvailable && (
        <button
          onClick={useGraceDay}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Pause size={20} />
          Use Grace Day ({graceDaysAvailable - graceDaysUsed} left)
        </button>
      )}

      <div>
        <h3 className="font-semibold text-gray-700 dark:text-white flex items-center gap-2 mb-3">
          <TrendingUp size={20} />
          CEFR – {languageData[currentLanguage].name}
        </h3>
        {['a1', 'a2', 'b1'].map((lvl, i) => (
          <div key={lvl} className="mb-3">
            <div className="flex justify-between text-xs mb-1 text-gray-700 dark:text-gray-300">
              <span className="font-medium">{lvl.toUpperCase()} – {['Beginner', 'Elementary', 'Intermediate'][i]}</span>
              <span>{progress[currentLanguage]?.[lvl] || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${i === 0 ? 'bg-green-500' : i === 1 ? 'bg-blue-500' : 'bg-purple-500'}`}
                style={{ width: `${progress[currentLanguage]?.[lvl] || 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <button
          onClick={() => { setCurrentLesson('fundamentals'); setFundamentalView(null); setCurrentView('lesson'); }}
          className="w-full flex items-center gap-3 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition text-gray-800 dark:text-gray-200"
        >
          <BookOpen size={20} />
          <span className="font-medium">Fundamentals</span>
        </button>
        <button
          onClick={() => { setCurrentLesson('sentence'); setCurrentView('lesson'); }}
          className="w-full flex items-center gap-3 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition text-gray-800 dark:text-gray-200"
        >
          <BookOpen size={20} />
          <span className="font-medium">Core Lessons</span>
        </button>
        <button
          onClick={() => setCurrentView('conversations')}
          className="w-full flex items-center gap-3 p-3 bg-pink-100 dark:bg-pink-900/30 rounded-lg hover:bg-pink-200 dark:hover:bg-pink-900/50 transition text-gray-800 dark:text-gray-200"
        >
          <Users size={20} />
          <span className="font-medium">Conversations</span>
        </button>
        <button
          onClick={() => setCurrentView('scanner')}
          className="w-full flex items-center gap-3 p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition text-gray-800 dark:text-gray-200"
        >
          <Camera size={20} />
          <span className="font-medium">Scanner</span>
        </button>
        <button
          onClick={() => setCurrentView('community')}
          className="w-full flex items-center gap-3 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition text-gray-800 dark:text-gray-200"
        >
          <MessageCircle size={20} />
          <span className="font-medium">Community Forum</span>
        </button>
        <button
  onClick={() => setCurrentView('quiz')}
  className="w-full flex items-center gap-3 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition text-gray-800 dark:text-gray-200"
>
  <Trophy size={20} />
  <span className="font-medium">Daily Quiz</span>
</button>
      </div>
    </div>
  );


  const HomeView = () => (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 border-l-4 border-green-500">
        <p className="text-gray-800 dark:text-white">
          Welcome back, <span className="font-bold text-green-600 dark:text-green-400">{currentUser?.name || 'Learner'}</span>!
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Your Learning Journey</h2>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
            <div className="flex items-center justify-between mb-2">
              <Zap className="text-orange-500" size={24} />
              <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                {graceDaysAvailable - graceDaysUsed}/month
              </span>
            </div>
            <p className="text-3xl font-bold text-orange-700 dark:text-orange-400">{streak}</p>
            <p className="text-sm text-orange-600 dark:text-orange-500">Day Streak</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <Star className="text-blue-500 mb-2" size={24} />
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">{xp}</p>
            <p className="text-sm text-blue-600 dark:text-blue-500">Total XP</p>
          </div>

          <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/30 p-4 rounded-lg border border-pink-200 dark:border-pink-700">
            <Heart className="text-pink-500 mb-2" size={24} />
            <p className="text-3xl font-bold text-pink-700 dark:text-pink-400">∞</p>
            <p className="text-sm text-pink-600 dark:text-pink-500">Practice Mode</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700 dark:text-white flex items-center gap-2">
            <TrendingUp size={20} />
            CEFR Level Progress - {languageData[currentLanguage].name}
          </h3>

          <div className="space-y-3">
            {['a1', 'a2', 'b1'].map((level, idx) => (
              <div key={level}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {level.toUpperCase()} - {['Beginner', 'Elementary', 'Intermediate'][idx]}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {progress[currentLanguage]?.[level] || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      idx === 0 ? 'bg-green-500' : idx === 1 ? 'bg-blue-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${progress[currentLanguage]?.[level] || 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Choose Your Learning Path</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              setCurrentLesson('fundamentals');
              setFundamentalView(null);
              setCurrentView('lesson');
            }}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg hover:shadow-lg transition-all"
          >
            <BookOpen className="mb-2" size={24} />
            <p className="font-semibold">Fundamentals</p>
            <p className="text-xs opacity-90">Alphabet & Grammar</p>
          </button>

          <button
            onClick={() => {
              setCurrentLesson('sentence');
              setCurrentView('lesson');
            }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg hover:shadow-lg transition-all"
          >
            <BookOpen className="mb-2" size={24} />
            <p className="font-semibold">Core Lessons</p>
            <p className="text-xs opacity-90">Grammar & Vocabulary</p>
          </button>

          <button
            onClick={() => setCurrentView('conversations')}
            className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-4 rounded-lg hover:shadow-lg transition-all"
          >
            <Users className="mb-2" size={24} />
            <p className="font-semibold">Conversations</p>
            <p className="text-xs opacity-90">Real-world dialogues</p>
          </button>

          <button
            onClick={() => setCurrentView('scanner')}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg hover:shadow-lg transition-all"
          >
            <Camera className="mb-2" size={24} />
            <p className="font-semibold">Text Scanner</p>
            <p className="text-xs opacity-90">Translate real objects</p>
          </button>
        </div>
      </div>
    </div>
  );

  const FundamentalsView = () => {
    const lang = languageData[currentLanguage].fundamentals;
    const sections = {
      grammar: { title: 'Grammar', data: lang.grammar },
      alphabet: { title: 'Alphabet', data: lang.alphabet },
      numbers: { title: 'Numbers', data: lang.numbers },
      articles: { title: 'Articles', data: lang.articles },
    };
    const current = sections[fundamentalView];

    if (!current) {
      return (
        <div className="space-y-4">
          {Object.entries(sections).map(([key, { title }]) => (
            <button
              key={key}
              onClick={() => setFundamentalView(key)}
              className="w-full p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all"
            >
              {title}
            </button>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <button
          onClick={() => setFundamentalView(null)}
          className="text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1"
        >
          ← Back to fundamentals
        </button>

        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{current.title}</h3>

        {fundamentalView === 'grammar' ? (
          <div className="space-y-6">
            {Object.entries(current.data).map(([cat, items]) => (
              <div key={cat}>
                <h4 className="font-semibold capitalize text-lg mb-3 text-gray-800 dark:text-white">{cat}</h4>
                <div className="grid grid-cols-1 gap-3">
                  {items.map((it, i) => (
                    <div
                      key={i}
                      className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex justify-between items-center shadow-sm border border-gray-200 dark:border-gray-700"
                    >
                      <div>
                        <span className="font-bold text-gray-800 dark:text-white">{it.word}</span>
                        {'translation' in it && (
                          <span className="text-gray-700 dark:text-gray-300 ml-3">– {it.translation}</span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 italic">{it.pronunciation}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {current.data.map((it, i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex justify-between items-center shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div>
                  <span className="font-bold text-gray-800 dark:text-white">
                    {it.letter ?? it.number ?? it.word}
                  </span>
                  {'example' in it && (
                    <span className="text-gray-700 dark:text-gray-300 ml-3">– {it.example}</span>
                  )}
                  {'translation' in it && (
                    <span className="text-gray-700 dark:text-gray-300 ml-3">– {it.translation}</span>
                  )}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 italic">{it.pronunciation}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const lessonQuestions = {
    spanish: [
      {
        question: 'I love learning languages',
        answers: ['Me encanta aprender idiomas', 'Me gusta aprender lenguas', 'Amo aprender idiomas'],
        correct: 0,
        explanation: '"Me encanta" expresses stronger enthusiasm than "me gusta"'
      },
      {
        question: 'The book is on the table',
        answers: ['El libro está en la mesa', 'El libro es en la mesa', 'La libro está en la mesa'],
        correct: 0,
        explanation: 'Use "está" for location, not "es". "El" is the correct article for "libro"'
      },
      {
        question: 'I want to eat',
        answers: ['Quiero comer', 'Quiero comiendo', 'Queriendo comer'],
        correct: 0,
        explanation: 'Use infinitive "comer" after "quiero", not gerund'
      },
      {
        question: 'She is very happy',
        answers: ['Ella está muy feliz', 'Ella es muy feliz', 'Ella estar muy feliz'],
        correct: 0,
        explanation: 'Use "está" for temporary states like emotions'
      },
      {
        question: 'We have two cats',
        answers: ['Tenemos dos gatos', 'Tenemos dos gatas', 'Tenimos dos gatos'],
        correct: 0,
        explanation: '"Gatos" is used for mixed or unspecified gender groups'
      }
    ],
    french: [
      {
        question: 'I love learning languages',
        answers: ['J\'adore apprendre les langues', 'J\'aime apprendre les langues', 'Je adore apprendre langues'],
        correct: 0,
        explanation: '"J\'adore" expresses stronger passion than "j\'aime"'
      },
      {
        question: 'The book is on the table',
        answers: ['Le livre est sur la table', 'La livre est sur la table', 'Le livre sur la table'],
        correct: 0,
        explanation: '"Le livre" (masculine) with "est" for the verb "to be"'
      },
      {
        question: 'I want to eat',
        answers: ['Je veux manger', 'Je veux mangeant', 'Je vouloir manger'],
        correct: 0,
        explanation: 'Use infinitive "manger" after conjugated "veux"'
      },
      {
        question: 'She is very happy',
        answers: ['Elle est très heureuse', 'Elle est très heureux', 'Elle être très heureuse'],
        correct: 0,
        explanation: 'Feminine form "heureuse" agrees with "elle"'
      },
      {
        question: 'We have two cats',
        answers: ['Nous avons deux chats', 'Nous avons deux chattes', 'Nous avoir deux chats'],
        correct: 0,
        explanation: '"Chats" is used for mixed or unspecified gender groups'
      }
    ],
    german: [
      {
        question: 'I love learning languages',
        answers: ['Ich liebe es, Sprachen zu lernen', 'Ich liebe lernen Sprachen', 'Ich liebend Sprachen lernen'],
        correct: 0,
        explanation: 'German uses "zu" + infinitive construction after certain verbs'
      },
      {
        question: 'The book is on the table',
        answers: ['Das Buch ist auf dem Tisch', 'Das Buch ist auf der Tisch', 'Der Buch ist auf dem Tisch'],
        correct: 0,
        explanation: '"Das Buch" (neuter) with dative "dem Tisch" after "auf"'
      },
      {
        question: 'I want to eat',
        answers: ['Ich will essen', 'Ich will essend', 'Ich wollen essen'],
        correct: 0,
        explanation: 'Modal verb "will" + infinitive "essen"'
      },
      {
        question: 'She is very happy',
        answers: ['Sie ist sehr glücklich', 'Sie sein sehr glücklich', 'Sie ist sehr glückliche'],
        correct: 0,
        explanation: 'Predicate adjectives don\'t take endings in German'
      },
      {
        question: 'We have two cats',
        answers: ['Wir haben zwei Katzen', 'Wir haben zwei Katze', 'Wir habt zwei Katzen'],
        correct: 0,
        explanation: 'Plural "Katzen" and "haben" for "wir"'
      }
    ]
  };

const LessonView = () => {
  const correctAnswer = 0;
  const questions = lessonQuestions[currentLanguage] || lessonQuestions.spanish;
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index);
    setIsCorrectAnswer(index === currentQuestion.correct);
    setShowAnswerFeedback(true);
    
    // If correct, automatically move to completion after a short delay
    if (index === currentQuestion.correct) {
      setTimeout(() => {
        setLessonCompleted(true);
      }, 1500); // 1.5 second delay to show the success message
    }
  };

  const handleContinue = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Move to next question
      await completeLesson(currentLesson || 'sentence', 10);
      setCurrentQuestionIndex(prev => prev + 1);
      setLessonCompleted(false);
      setSelectedAnswer(null);
      setShowAnswerFeedback(false);
    } else {
      // Completed all questions
      await completeLesson(currentLesson || 'sentence', 10);
      setCurrentQuestionIndex(0);
      setLessonCompleted(false);
      setSelectedAnswer(null);
      setShowAnswerFeedback(false);
      setCurrentView('home');
    }
  };

  const handleTryAgain = () => {
    setSelectedAnswer(null);
    setShowAnswerFeedback(false);
    setIsCorrectAnswer(false);
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => {
          setCurrentView('home');
          setLessonCompleted(false);
          setSelectedAnswer(null);
          setShowAnswerFeedback(false);
          setCurrentQuestionIndex(0);
          setFundamentalView(null);
        }}
        className="text-green-900 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium"
      >
        ← Back to Home
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {languageData[currentLanguage].name} Lesson
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Question {currentQuestionIndex + 1}/{questions.length}
            </span>
            <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400">
              <Heart size={20} />
              <span className="font-semibold">Unlimited Practice</span>
            </div>
          </div>
        </div>

        {currentLesson === 'fundamentals' && <FundamentalsView />}

        {currentLesson === 'sentence' && !lessonCompleted && (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Translate this sentence:</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-6">{currentQuestion.question}</p>

              <div className="space-y-3">
                {currentQuestion.answers.map((answer, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showAnswerFeedback && isCorrectAnswer}
                    className={`w-full p-4 rounded-lg text-left transition-all ${
                      selectedAnswer === index
                        ? showAnswerFeedback
                          ? index === currentQuestion.correct
                            ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'
                            : 'bg-red-100 dark:bg-red-900/30 border-2 border-red-500'
                          : 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                        : 'bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500'
                    } ${showAnswerFeedback && isCorrectAnswer ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-800 dark:text-white">{answer}</span>
                      {selectedAnswer === index && showAnswerFeedback && (
                        <span className="text-xl">
                          {index === currentQuestion.correct ? '✓' : '✗'}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {showAnswerFeedback && !isCorrectAnswer && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 p-4 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-300 mb-3">
                  <strong>Not quite!</strong> Try again. Hint: {currentQuestion.explanation}
                </p>
                <button
                  onClick={handleTryAgain}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-all text-sm"
                >
                  Try Again
                </button>
              </div>
            )}

            {showAnswerFeedback && isCorrectAnswer && (
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 p-4 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-300">
                  <strong>Perfect!</strong> {currentQuestion.explanation}
                </p>
              </div>
            )}

            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 p-4 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-300">
                <strong>Ad-Free Learning:</strong> No interruptions during your lesson.
              </p>
            </div>
          </div>
        )}

        {currentLesson === 'sentence' && lessonCompleted && (
          <div className="text-center space-y-6">
            <div className="inline-block bg-green-100 dark:bg-green-900/30 p-6 rounded-full">
              <CheckCircle className="text-green-600 dark:text-green-400" size={64} />
            </div>
            <h3 className="text-2xl font-bold text-green-700 dark:text-green-400">Great Job!</h3>
            <p className="text-gray-700 dark:text-gray-300">You earned 10 XP</p>

            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 p-4 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                <strong>Cultural Note:</strong> {currentQuestion.explanation}
              </p>
            </div>

            <button
              onClick={handleContinue}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-all"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question →' : 'Complete Lesson'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
  const SettingsView = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Settings</h2>

        <div className="space-y-6">
          
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-3">Notifications</label>
            <button
              onClick={toggleNotifications}
              className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                notificationsEnabled 
                  ? 'bg-green-50 dark:bg-green-900/30 border-green-500 dark:border-green-600' 
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3">
                {notificationsEnabled ? <Bell className="text-green-600" size={24} /> : <BellOff className="text-gray-400" size={24} />}
                <div className="text-left">
                  <p className="font-medium text-gray-800 dark:text-white">
                    {notificationsEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {notificationsEnabled ? 'You\'ll get daily practice reminders' : 'No reminders'}
                  </p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full transition-all ${notificationsEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </div>
            </button>
          </div>

     
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-3">Notification Tone</label>
            <div className="space-y-2">
              {['encouraging', 'neutral', 'minimal'].map(tone => (
                <label key={tone} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border border-gray-200 dark:border-gray-600">
                  <input
                    type="radio"
                    name="tone"
                    checked={notificationTone === tone}
                    onChange={() => {
                      setNotificationTone(tone);
                      updateSettings({ notificationTone: tone });
                    }}
                    className="w-4 h-4"
                  />
                  <div>
                    <span className="capitalize font-medium text-gray-800 dark:text-white">{tone}</span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {tone === 'encouraging' && 'Motivating and supportive messages'}
                      {tone === 'neutral' && 'Simple informational reminders'}
                      {tone === 'minimal' && 'Brief, no-frills notifications'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

        
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-xl p-4">
            <h3 className="font-bold text-purple-800 dark:text-purple-300 mb-2 flex items-center gap-2">
              <Pause size={20} />
              Grace Days
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              Protect your streak when life gets busy. Use a grace day to pause without losing progress.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">Available this month:</span>
              <span className="font-bold text-purple-700 dark:text-purple-400">
                {graceDaysAvailable - graceDaysUsed} / {graceDaysAvailable}
              </span>
            </div>
          </div>

          <div className="border-t dark:border-gray-700 pt-6">
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );

 
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-400 to-green-500 dark:from-gray-900 dark:to-gray-800">

   
      <div className="hidden lg:flex items-center justify-between bg-white dark:bg-gray-900 shadow-md px-6 py-4 sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-green-400 to-green-500 w-12 h-12 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🦉</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">EthiLearn</h1>
          <div className="relative ml-6">
            <button
              onClick={() => setShowLanguageSelector(!showLanguageSelector)}
              className="flex items-center gap-1 text-sm font-bold text-gray-700 dark:text-gray-300"
            >
              {languageData[currentLanguage].flag} {languageData[currentLanguage].name}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showLanguageSelector && (
              <div className="absolute left-0 mt-2 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                {Object.entries(languageData).map(([k, { flag, name }]) => (
                  <button
                    key={k}
                    onClick={() => {
                      setCurrentLanguage(k);
                      updateSettings({ currentLanguage: k });
                      setShowLanguageSelector(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2 ${currentLanguage === k ? 'bg-blue-100 dark:bg-blue-900/50 font-bold' : ''}`}
                  >
                    {flag} {name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-yellow-400 px-4 py-2 rounded-xl shadow-md">
            <span className="text-white font-black">{xp} XP</span>
          </div>
          <button onClick={() => setCurrentView('settings')} className="p-1">
            <User size={22} className="text-gray-700 dark:text-gray-300" />
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
            {theme === 'dark' ? '🌞' : '🌙'}
          </button>
        </div>
      </div>

    
      <div className="lg:hidden bg-white dark:bg-gray-800 shadow-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-green-400 to-green-500 w-12 h-12 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🦉</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-800 dark:text-white">EthiLearn</h1>
              <button
                onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                className="flex items-center gap-1 text-xs font-bold text-gray-700 dark:text-gray-300"
              >
                {languageData[currentLanguage].flag} {languageData[currentLanguage].name}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-yellow-400 px-3 py-1 rounded-lg shadow-md">
              <span className="text-white font-black text-sm">{xp} XP</span>
            </div>
            <button onClick={() => setCurrentView('settings')} className="p-1">
              <User size={22} className="text-gray-700 dark:text-gray-300" />
            </button>
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
              {theme === 'dark' ? '🌞' : '🌙'}
            </button>
          </div>
        </div>
        {showLanguageSelector && (
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(languageData).map(([k, { flag, name }]) => (
              <button
                key={k}
                onClick={() => {
                  setCurrentLanguage(k);
                  updateSettings({ currentLanguage: k });
                  setShowLanguageSelector(false);
                }}
                className={`px-3 py-1 rounded-lg text-sm ${currentLanguage === k ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
              >
                {flag} {name}
              </button>
            ))}
          </div>
        )}
      </div>

     
      <div className="max-w-7xl mx-auto p-4 pb-24 lg:pb-8">
       
        <div className="hidden lg:flex gap-6">
          <Sidebar />
          <div className="flex-1 max-w-3xl">
            {currentView === 'home' && <HomeView />}
            {currentView === 'lesson' && <LessonView />}
            {currentView === 'quiz' && (
  <Quiz
    authToken={authToken}
    currentUser={currentUser}
    currentLanguage={currentLanguage}
  />
)}
            {currentView === 'conversations' && <ConversationsView />}
            {currentView === 'scanner' && <ScannerView />}
            {currentView === 'community' && (
              <CommunityView
                authToken={authToken}
                currentUser={currentUser}
                setCurrentView={setCurrentView}
              />
            )}
            {currentView === 'settings' && <SettingsView />}
          </div>
        </div>

       
        <div className="lg:hidden">
          {currentView === 'home' && <HomeView />}
          {currentView === 'lesson' && <LessonView />}
          {currentView === 'quiz' && (
  <Quiz
    authToken={authToken}
    currentUser={currentUser}
    currentLanguage={currentLanguage}
  />
)}
          {currentView === 'conversations' && <ConversationsView />}
          {currentView === 'scanner' && <ScannerView />}
          {currentView === 'community' && (
            <CommunityView
              authToken={authToken}
              currentUser={currentUser}
              setCurrentView={setCurrentView}
            />
          )}
          {currentView === 'settings' && <SettingsView />}
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-gray-200 dark:border-gray-800 shadow-2xl">
        <div className="max-w-2xl mx-auto flex justify-around p-3">
          <button
            onClick={() => setCurrentView('home')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${currentView === 'home' ? 'text-blue-500' : 'text-gray-400'}`}
          >
            <BookOpen size={28} strokeWidth={2.5} />
            <span className="text-xs font-bold">LEARN</span>
          </button>
          <button
  onClick={() => setCurrentView('quiz')}
  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${currentView === 'quiz' ? 'text-blue-500' : 'text-gray-400'}`}
>
  <Trophy size={28} strokeWidth={2.5} />
  <span className="text-xs font-bold">QUIZ</span>
</button>

          <button
            onClick={() => setCurrentView('community')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${currentView === 'community' ? 'text-blue-500' : 'text-gray-400'}`}
          >
            <MessageCircle size={28} strokeWidth={2.5} />
            <span className="text-xs font-bold">FORUM</span>
          </button>

          <button
            onClick={() => setCurrentView('scanner')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${currentView === 'scanner' ? 'text-blue-500' : 'text-gray-400'}`}
          >
            <Camera size={28} strokeWidth={2.5} />
            <span className="text-xs font-bold">SCAN</span>
          </button>

          <button
            onClick={() => setCurrentView('settings')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${currentView === 'settings' ? 'text-blue-500' : 'text-gray-400'}`}
          >
            <Settings size={28} strokeWidth={2.5} />
            <span className="text-xs font-bold">SETTINGS</span>
          </button>
        </div>
      </div>

   <footer className="hidden sm:block mt-auto bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
  <div className="text-center text-sm rounded-2xl p-4 shadow-md">
    <p className="text-gray-800 dark:text-white mb-2">Ethical Design Features</p>
    <p className="text-gray-700 dark:text-gray-300 font-semibold">
      No guilt • Unlimited hearts • Clear progress • User control
    </p>
  </div>
</footer>

    </div>
  );
};

export default App;