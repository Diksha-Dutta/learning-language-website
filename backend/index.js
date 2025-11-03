
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import dotenv from 'dotenv';
import Question from './models/Question.js';
import Answer   from './models/Answer.js';


dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const JWT_SECRET = process.env.JWT_SECRET || 'ethilearn-dev-secret-change-in-production';


console.log('🔧 Configuration:');
console.log('- Port:', PORT);
console.log('- JWT Secret:', JWT_SECRET ? '✓ Set' : '✗ Missing');
console.log('- MongoDB URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/ethilearn');


app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());


const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ethilearn';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log('📊 Database:', mongoose.connection.name);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('🔍 Troubleshooting:');
    console.error('   1. Is MongoDB running? Try: mongod');
    console.error('   2. Check connection string:', MONGODB_URI);
    console.error('   3. Check if port 27017 is available');
    process.exit(1);
  });


mongoose.connection.on('error', err => {
  console.error('MongoDB runtime error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});


const progressSchema = new mongoose.Schema({
  a1: { type: Number, default: 0, min: 0, max: 100 },
  a2: { type: Number, default: 0, min: 0, max: 100 },
  b1: { type: Number, default: 0, min: 0, max: 100 }
}, { _id: false });



const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  currentStreak: { type: Number, default: 0 },
  lastActiveDate: { type: Date },
  lastActivityDate: { type: Date }, 
  totalXP: { type: Number, default: 0 },
  graceDaysUsed: { type: Number, default: 0 }, 
  graceDaysAvailable: { type: Number, default: 1 }, 
  lastGraceDayReset: { type: Date }, 
  selectedLanguages: { 
    type: [String], 
    default: ['spanish'],
    enum: ['spanish', 'french', 'german']
  },
  currentLanguage: { 
    type: String, 
    default: 'spanish',
    enum: ['spanish', 'french', 'german']
  },
  notificationTone: { 
    type: String, 
    default: 'encouraging',
    enum: ['encouraging', 'neutral', 'minimal']
  },
  progress: {
    spanish: { type: progressSchema, default: () => ({ a1: 0, a2: 0, b1: 0 }) },
    french:  { type: progressSchema, default: () => ({ a1: 0, a2: 0, b1: 0 }) },
    german:  { type: progressSchema, default: () => ({ a1: 0, a2: 0, b1: 0 }) }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    console.error('JWT verification error:', err.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};


const updateStreak = async (user) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
  if (lastActive) {
    lastActive.setHours(0, 0, 0, 0);
  }

  if (!lastActive || lastActive < today) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastActive && lastActive.getTime() === yesterday.getTime()) {
   
      user.currentStreak += 1;
    } else if (!lastActive || lastActive.getTime() < yesterday.getTime()) {
     
      user.currentStreak = 1;
    }
    
    user.lastActiveDate = today;
  }

  return user.currentStreak;
};


const formatUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  currentStreak: user.currentStreak,
  totalXP: user.totalXP,
  selectedLanguages: user.selectedLanguages,
  currentLanguage: user.currentLanguage,
  notificationTone: user.notificationTone,
  progress: user.progress,
  graceDaysUsed: user.graceDaysUsed || 0,       
  graceDaysAvailable: user.graceDaysAvailable || 1, 
  lastActivityDate: user.lastActivityDate          
});


app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});


app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

   
    const hashedPassword = await bcrypt.hash(password, 10);

 
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    await user.save();

   
    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    console.log('✅ New user registered:', email);

    res.status(201).json({ 
      token, 
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});


app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

   
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

  
    await updateStreak(user);
    await user.save();

   
    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    console.log('✅ User logged in:', email);

    res.json({ 
      token, 
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});


app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

  
    await updateStreak(user);
    await user.save();

    res.json({ user: formatUserResponse(user) });
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


app.post('/api/progress/complete-lesson', authenticateToken, async (req, res) => {
  try {
    const { lessonType, lessonId, xpEarned, language } = req.body;
    
    if (!['spanish', 'french', 'german'].includes(language)) {
      return res.status(400).json({ error: 'Invalid language' });
    }

    if (!xpEarned || !language) {
      return res.status(400).json({ error: 'XP and language required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    
    await updateStreak(user);
    
    
    user.lastActivityDate = new Date(); 


    user.totalXP += xpEarned;

    
    if (user.progress[language]) {
      const levels = ['a1', 'a2', 'b1'];
      const randomLevel = levels[Math.floor(Math.random() * levels.length)];
      const currentProgress = user.progress[language][randomLevel] || 0;
      user.progress[language][randomLevel] = Math.min(100, currentProgress + 5);
      user.markModified('progress');
    }

    await user.save();

    console.log(`✅ Lesson completed by ${user.email}: +${xpEarned} XP`);

    res.json({ user: formatUserResponse(user) });
  } catch (error) {
    console.error('❌ Complete lesson error:', error);
    res.status(500).json({ error: 'Failed to complete lesson' });
  }
});

app.post('/api/progress/use-grace-day', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

  
    if (user.graceDaysUsed >= user.graceDaysAvailable) {
      return res.status(400).json({ error: 'No grace days available this month' });
    }

   
    const now = new Date();
    const lastReset = user.lastGraceDayReset ? new Date(user.lastGraceDayReset) : null;
    
    if (!lastReset || lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
      user.graceDaysUsed = 0;
      user.lastGraceDayReset = now;
    }

    
    user.graceDaysUsed += 1;
    user.lastActivityDate = new Date();

    await user.save();

    console.log(`✅ Grace day used by ${user.email}: ${user.graceDaysUsed}/${user.graceDaysAvailable}`);

    res.json({ 
      message: 'Grace day used successfully',
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('❌ Use grace day error:', error);
    res.status(500).json({ error: 'Failed to use grace day' });
  }
});


app.get('/api/community/questions', authenticateToken, async (req, res) => {
  try {
    const questions = await Question.find()
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(questions);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/community/questions', authenticateToken, async (req, res) => {
  try {
    const { title, body, category } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Title required' });

    const q = new Question({
      userId: req.user.id,
      title: title.trim(),
      body: body?.trim(),
      category,
    });
    await q.save();
    await q.populate('userId', 'name');
    res.status(201).json(q);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/community/questions/:id/answers', authenticateToken, async (req, res) => {
  try {
    const answers = await Answer.find({ questionId: req.params.id })
      .populate('userId', 'name')
      .sort({ createdAt: 1 });
    res.json(answers);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/community/questions/:id/answers', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'Answer required' });

    const a = new Answer({
      questionId: req.params.id,
      userId: req.user.id,
      text: text.trim(),
    });
    await a.save();
    await a.populate('userId', 'name');
    res.status(201).json(a);
  } catch (e) { res.status(500).json({ error: e.message }); }
});


app.delete('/api/community/questions/:id', authenticateToken, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

   
    if (question.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this question' });
    }

    
    await Answer.deleteMany({ questionId: req.params.id });
    
    
    await Question.findByIdAndDelete(req.params.id);

    console.log(`✅ Question deleted by ${req.user.id}`);
    res.json({ message: 'Question deleted successfully' });
  } catch (e) {
    console.error('❌ Delete question error:', e);
    res.status(500).json({ error: e.message });
  }
});


app.put('/api/community/questions/:id', authenticateToken, async (req, res) => {
  try {
    const { title, body, category } = req.body;
    
    if (!title?.trim()) {
      return res.status(400).json({ error: 'Title required' });
    }

    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

   
    
    if (question.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to edit this question' });
    }

    question.title = title.trim();
    question.body = body?.trim() || '';
    question.category = category || question.category;

    await question.save();
    await question.populate('userId', 'name');

    console.log(`✅ Question updated by ${req.user.id}`);
    res.json(question);
  } catch (e) {
    console.error('❌ Update question error:', e);
    res.status(500).json({ error: e.message });
  }
});


app.delete('/api/community/questions/:qid/answers/:aid', authenticateToken, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.aid);
    
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

   
    if (answer.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this answer' });
    }

    await Answer.findByIdAndDelete(req.params.aid);

    console.log(`✅ Answer deleted by ${req.user.id}`);
    res.json({ message: 'Answer deleted successfully' });
  } catch (e) {
    console.error('❌ Delete answer error:', e);
    res.status(500).json({ error: e.message });
  }
});


app.put('/api/community/questions/:qid/answers/:aid', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text?.trim()) {
      return res.status(400).json({ error: 'Answer text required' });
    }

    const answer = await Answer.findById(req.params.aid);
    
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    
    if (answer.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to edit this answer' });
    }

    answer.text = text.trim();
    await answer.save();
    await answer.populate('userId', 'name');

    console.log(`✅ Answer updated by ${req.user.id}`);
    res.json(answer);
  } catch (e) {
    console.error('❌ Update answer error:', e);
    res.status(500).json({ error: e.message });
  }
});


const quizAttemptSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  language: {
    type: String,
    required: true,
    enum: ['spanish', 'french', 'german']
  },
  score: { 
    type: Number, 
    required: true,
    min: 0,
    max: 100
  },
  passed: { 
    type: Boolean, 
    required: true 
  },
  answers: [{
    questionIndex: Number,
    userAnswer: Number,
    correct: Boolean
  }],
  timeSpent: { 
    type: Number, 
    default: 0 
  }
}, { 
  timestamps: true 
});

quizAttemptSchema.index({ userId: 1, date: 1 });
quizAttemptSchema.index({ score: -1 });

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);


const quizStreakSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  consecutiveDays: { 
    type: Number, 
    default: 0 
  },
  lastCompletedDate: { 
    type: Date 
  },
  unlockedBadges: [{
    type: String,
    enum: ['bronze', 'silver', 'gold', 'diamond']
  }]
}, { 
  timestamps: true 
});

const QuizStreak = mongoose.model('QuizStreak', quizStreakSchema);


app.get('/api/quiz/attempts/today', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attempts = await QuizAttempt.find({
      userId: req.user.id,
      date: { $gte: today, $lt: tomorrow }
    }).sort({ createdAt: -1 });

    const passed = attempts.some(att => att.passed);
    
    res.json({
      attemptsCount: attempts.length,
      passed,
      attempts: attempts.map(att => ({
        score: att.score,
        passed: att.passed,
        timeSpent: att.timeSpent,
        createdAt: att.createdAt
      }))
    });
  } catch (error) {
    console.error('❌ Get attempts error:', error);
    res.status(500).json({ error: 'Failed to get attempts' });
  }
});


app.post('/api/quiz/submit', authenticateToken, async (req, res) => {
  try {
    const { language, score, passed, answers, timeSpent } = req.body;

    if (!language || score === undefined || passed === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

   
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttempts = await QuizAttempt.countDocuments({
      userId: req.user.id,
      date: { $gte: today, $lt: tomorrow }
    });

    if (todayAttempts >= 3) {
      return res.status(400).json({ error: 'Maximum attempts reached for today' });
    }

  
    const passedToday = await QuizAttempt.findOne({
      userId: req.user.id,
      date: { $gte: today, $lt: tomorrow },
      passed: true
    });

    if (passedToday) {
      return res.status(400).json({ error: 'Already passed today' });
    }

    const attempt = new QuizAttempt({
      userId: req.user.id,
      date: today,
      language,
      score,
      passed,
      answers: answers || [],
      timeSpent: timeSpent || 0
    });

    await attempt.save();

   
    let streakData = null;
    if (passed) {
      streakData = await updateQuizStreak(req.user.id);
    }

    console.log(`✅ Quiz submitted by ${req.user.id}: ${score}% (${passed ? 'PASSED' : 'FAILED'})`);

    res.json({
      message: 'Quiz submitted successfully',
      attempt: {
        score: attempt.score,
        passed: attempt.passed,
        timeSpent: attempt.timeSpent
      },
      streak: streakData
    });
  } catch (error) {
    console.error('❌ Submit quiz error:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});


app.get('/api/quiz/streak', authenticateToken, async (req, res) => {
  try {
    let streak = await QuizStreak.findOne({ userId: req.user.id });
    
    if (!streak) {
      streak = new QuizStreak({
        userId: req.user.id,
        consecutiveDays: 0,
        unlockedBadges: []
      });
      await streak.save();
    }

    res.json({
      consecutiveDays: streak.consecutiveDays,
      lastCompletedDate: streak.lastCompletedDate,
      unlockedBadges: streak.unlockedBadges
    });
  } catch (error) {
    console.error('❌ Get streak error:', error);
    res.status(500).json({ error: 'Failed to get streak' });
  }
});

app.get('/api/quiz/leaderboard', authenticateToken, async (req, res) => {
  try {
  
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const topScores = await QuizAttempt.aggregate([
      {
        $match: {
          date: { $gte: sevenDaysAgo },
          passed: true
        }
      },
      {
        $group: {
          _id: '$userId',
          bestScore: { $max: '$score' },
          language: { $first: '$language' }
        }
      },
      {
        $sort: { bestScore: -1 }
      },
      {
        $limit: 3
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          score: '$bestScore',
          language: 1
        }
      }
    ]);

    res.json(topScores);
  } catch (error) {
    console.error('❌ Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});


async function updateQuizStreak(userId) {
  try {
    let streak = await QuizStreak.findOne({ userId });
    
    if (!streak) {
      streak = new QuizStreak({
        userId,
        consecutiveDays: 1,
        lastCompletedDate: new Date(),
        unlockedBadges: []
      });
      await streak.save();
      return streak;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastCompleted = streak.lastCompletedDate ? new Date(streak.lastCompletedDate) : null;
    if (lastCompleted) {
      lastCompleted.setHours(0, 0, 0, 0);
    }

   
    if (lastCompleted && lastCompleted.getTime() === today.getTime()) {
      return streak;
    }

    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastCompleted && lastCompleted.getTime() === yesterday.getTime()) {
      
      streak.consecutiveDays += 1;
    } else if (!lastCompleted || lastCompleted.getTime() < yesterday.getTime()) {
      
      streak.consecutiveDays = 1;
      streak.unlockedBadges = [];
    }

    streak.lastCompletedDate = today;

   
    if (streak.consecutiveDays >= 3 && !streak.unlockedBadges.includes('bronze')) {
      streak.unlockedBadges.push('bronze');
    }
    if (streak.consecutiveDays >= 7 && !streak.unlockedBadges.includes('silver')) {
      streak.unlockedBadges.push('silver');
    }
    if (streak.consecutiveDays >= 14 && !streak.unlockedBadges.includes('gold')) {
      streak.unlockedBadges.push('gold');
    }
    if (streak.consecutiveDays >= 30 && !streak.unlockedBadges.includes('diamond')) {
      streak.unlockedBadges.push('diamond');
    }

    await streak.save();
    return streak;
  } catch (error) {
    console.error('Error updating quiz streak:', error);
    throw error;
  }
}
app.put('/api/settings', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    
    if (updates.notificationTone && ['encouraging', 'neutral', 'minimal'].includes(updates.notificationTone)) {
      user.notificationTone = updates.notificationTone;
    }
    if (updates.currentLanguage && ['spanish', 'french', 'german'].includes(updates.currentLanguage)) {
      user.currentLanguage = updates.currentLanguage;
    }
    if (updates.selectedLanguages && Array.isArray(updates.selectedLanguages)) {
      user.selectedLanguages = updates.selectedLanguages.filter(lang => 
        ['spanish', 'french', 'german'].includes(lang)
      );
    }

    await user.save();

    console.log(`✅ Settings updated for ${user.email}`);

    res.json({ 
      message: 'Settings updated successfully',
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('❌ Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});


if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));

  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}


app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});


app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});


app.listen(PORT, () => {
  console.log('🚀 EthiLearn backend running');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
});