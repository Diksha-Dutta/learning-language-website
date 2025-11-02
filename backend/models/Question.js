// models/Question.js
import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:    { type: String, required: true, trim: true },
  body:     { type: String, trim: true },
  category: { type: String, default: 'Grammar' },
}, { timestamps: true });

export default mongoose.model('Question', questionSchema);