
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, User } from 'lucide-react';

const API = 'https://learning-language-website.onrender.com/api';

const CommunityView = ({ authToken, currentUser, setCurrentView }) => {
  const [questions, setQuestions] = useState([]);
  const [selectedQ, setSelectedQ] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newQ, setNewQ] = useState({ title: '', body: '', category: 'Grammar' });
  const [newAns, setNewAns] = useState('');
  const [loading, setLoading] = useState(false);
  const titleRef = useRef(null);


  const loadQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/community/questions`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      setQuestions(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

 
  const loadAnswers = async (qid) => {
    try {
      const res = await fetch(`${API}/community/questions/${qid}/answers`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      setAnswers(data);
    } catch (e) {
      console.error(e);
    }
  };

 
  const postQuestion = async () => {
    if (!newQ.title.trim()) return alert('Title is required');
    try {
      const res = await fetch(`${API}/community/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(newQ),
      });
      const q = await res.json();
      setQuestions([q, ...questions]);
      setNewQ({ title: '', body: '', category: 'Grammar' });
    } catch (e) {
      alert('Failed to post');
    }
  };

  
  const postAnswer = async () => {
    if (!newAns.trim()) return;
    try {
      const res = await fetch(`${API}/community/questions/${selectedQ._id}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ text: newAns }),
      });
      const a = await res.json();
      setAnswers([...answers, a]);
      setNewAns('');
    } catch (e) {
      alert('Failed to answer');
    }
  };

  
  const openQuestion = (q) => {
    setSelectedQ(q);
    loadAnswers(q._id);
  };

 
  const backToList = () => {
    setSelectedQ(null);
    setAnswers([]);
  };

  useEffect(() => {
    loadQuestions();
  }, []);

 
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.focus();
    }
  }, [newQ.title]);

  
  if (selectedQ) {
    return (
      <div className="space-y-4 p-4">
        <button onClick={backToList} className="text-blue-600 font-medium">
          ← All Questions
        </button>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-5">
          <h3 className="text-xl font-bold">{selectedQ.title}</h3>
          {selectedQ.body && <p className="mt-2 text-gray-700">{selectedQ.body}</p>}
          <p className="text-sm text-gray-500 mt-1">
            — {selectedQ.userId.name} • {new Date(selectedQ.createdAt).toLocaleDateString()}
          </p>
        </div>

     
        <div className="space-y-3">
          {answers.length === 0 ? (
            <p className="text-center text-gray-500">No answers yet – be the first!</p>
          ) : (
            answers.map((a) => (
              <div key={a._id} className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">{a.text}</p>
                <p className="text-xs text-gray-500 mt-1">
                  — {a.userId.name} • {new Date(a.createdAt).toLocaleTimeString()}
                </p>
              </div>
            ))
          )}
        </div>

      
        <div className="flex gap-2 mt-4">
          <textarea
            placeholder="Write your answer..."
            value={newAns}
            onChange={(e) => setNewAns(e.target.value)}
            className="flex-1 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={2}
          />
          <button
            onClick={postAnswer}
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6 p-4">
      <button onClick={() => setCurrentView('home')} className="text-blue-600 font-medium">
        ← Home
      </button>

     
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-5 space-y-3">
        <h3 className="font-bold text-lg dark:text-white">Ask the Community</h3>

       
        <textarea
          ref={titleRef}
          placeholder="Question title (required)..."
          value={newQ.title}
          onChange={(e) => setNewQ({ ...newQ, title: e.target.value })}
          className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-400"
          rows={1}
          style={{ minHeight: '2.5rem' }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
        />

        <textarea
          placeholder="Details (optional)..."
          value={newQ.body}
          onChange={(e) => setNewQ({ ...newQ, body: e.target.value })}
          className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-400"
          rows={3}
        />

        <div className="flex gap-2">
          <select
            value={newQ.category}
            onChange={(e) => setNewQ({ ...newQ, category: e.target.value })}
            className="flex-1 p-2 border rounded-lg"
          >
            {['Grammar', 'Vocabulary', 'Speaking', 'Writing', 'Culture', 'Other'].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            onClick={postQuestion}
            className="bg-green-500 hover:bg-green-600 text-white px-5 rounded-lg font-medium"
          >
            Post
          </button>
        </div>
      </div>

    
      {loading ? (
        <p className="text-center">Loading…</p>
      ) : questions.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-white">No questions yet – ask the first one!</p>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <div
              key={q._id}
              onClick={() => openQuestion(q)}
              className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition"
            >
              <div className="flex items-start gap-3">
                <div className="bg-blue-500 text-white w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold">
                  {q.userId.name[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold dark:text-white">{q.title}</h4>
                  {q.body && (
                    <p className="text-sm text-gray-600 dark:text-white mt-1 line-clamp-2">{q.body}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-white">
                    <span>{q.userId.name}</span>
                    <span>•</span>
                    <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="bg-gray-200 dark:bg-gray-400 px-2 py-0.5 rounded">{q.category}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityView;