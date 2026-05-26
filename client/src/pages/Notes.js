import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { wordApi, translateWord } from '../services/api';
import '../styles/Notes.css';

const Notes = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('words');
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  const [stats, setStats] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);
  const translateTimerRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    word: '',
    gender: '',
    translation: '',
    notes: '',
    usage: '',
    conjugation: ''
  });

  // Load words on component mount
  useEffect(() => {
    loadWords();
    loadStats();
  }, []);

  // Load words with optional filtering
  const loadWords = async (params = {}) => {
    try {
      setLoading(true);
      setError('');
      const response = await wordApi.getAllWords(params);
      setWords(response.data.data || []);
    } catch (err) {
      setError('Failed to load words');
      console.error('Error loading words:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const response = await wordApi.getWordStats();
      setStats(response.data.data || {});
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        const response = await wordApi.searchWords(searchTerm);
        setWords(response.data.data || []);
      } catch (err) {
        setError('Search failed');
        console.error('Search error:', err);
      }
    } else {
      loadWords();
    }
  };

  // Handle gender filter
  const handleGenderFilter = async (gender) => {
    setSelectedGender(gender);
    if (gender) {
      try {
        const response = await wordApi.getWordsByGender(gender);
        setWords(response.data.data || []);
      } catch (err) {
        setError('Filter failed');
        console.error('Filter error:', err);
      }
    } else {
      loadWords();
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle word field change with debounced auto-translation
  const handleWordChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, word: value }));

    clearTimeout(translateTimerRef.current);
    if (value.trim().length < 2) return;

    translateTimerRef.current = setTimeout(async () => {
      setIsTranslating(true);
      try {
        const res = await translateWord(value.trim());
        if (res.data?.translation) {
          setFormData(prev => ({ ...prev, translation: res.data.translation }));
        }
      } catch {
        // silently ignore translation errors
      } finally {
        setIsTranslating(false);
      }
    }, 600);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      word: '',
      gender: '',
      translation: '',
      notes: '',
      usage: '',
      conjugation: ''
    });
  };

  // Handle add word
  const handleAddWord = async (e) => {
    e.preventDefault();
    try {
      await wordApi.createWord(formData);
      setShowAddModal(false);
      resetForm();
      loadWords();
      loadStats();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add word');
      console.error('Add word error:', err);
    }
  };

  // Handle edit word
  const handleEditWord = async (e) => {
    e.preventDefault();
    try {
      await wordApi.updateWord(editingWord.id, formData);
      setShowEditModal(false);
      setEditingWord(null);
      resetForm();
      loadWords();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update word');
      console.error('Update word error:', err);
    }
  };

  // Handle delete word
  const handleDeleteWord = async (wordId) => {
    if (window.confirm('Are you sure you want to delete this word?')) {
      try {
        await wordApi.deleteWord(wordId);
        loadWords();
        loadStats();
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete word');
        console.error('Delete word error:', err);
      }
    }
  };

  // Open edit modal
  const openEditModal = (word) => {
    setEditingWord(word);
    setFormData({
      word: word.word || '',
      gender: word.gender || '',
      translation: word.translation || '',
      notes: word.notes || '',
      usage: word.usage || '',
      conjugation: word.conjugation || ''
    });
    setShowEditModal(true);
  };

  // Close modals
  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingWord(null);
    resetForm();
    setError('');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="notes-container">


      {/* Header */}
      <header className="notes-header">
        <div>
          <h1>My German Notes</h1>
          <p>Welcome back, {user?.username}!</p>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </header>

      {/* Navigation Tabs */}
      <nav className="notes-nav">
        <button 
          className={`nav-tab ${activeTab === 'words' ? 'active' : ''}`}
          onClick={() => setActiveTab('words')}
        >
          📝 Words
        </button>
        <button 
          className={`nav-tab ${activeTab === 'grammar' ? 'active' : ''}`}
          onClick={() => setActiveTab('grammar')}
        >
          📚 Grammar
        </button>
        <button 
          className={`nav-tab ${activeTab === 'practice' ? 'active' : ''}`}
          onClick={() => setActiveTab('practice')}
        >
          🎯 Practice
        </button>
      </nav>

      {/* Words Tab Content */}
      {activeTab === 'words' && (
        <div className="tab-content">
          {/* Statistics */}
          <div className="stats-container">
            <div className="stat-card">
              <h3>{stats.total || 0}</h3>
              <p>Total Words</p>
            </div>
            <div className="stat-card">
              <h3>{stats.byGender?.der || 0}</h3>
              <p>Der Words</p>
            </div>
            <div className="stat-card">
              <h3>{stats.byGender?.die || 0}</h3>
              <p>Die Words</p>
            </div>
            <div className="stat-card">
              <h3>{stats.byGender?.das || 0}</h3>
              <p>Das Words</p>
            </div>
          </div>

          {/* Controls */}
          <div className="controls-container">
            <div className="search-controls">
              <input
                type="text"
                placeholder="Search words..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="search-input"
              />
              <button onClick={handleSearch} className="btn btn-primary">
                Search
              </button>
            </div>

            <div className="filter-controls">
              <select 
                value={selectedGender} 
                onChange={(e) => handleGenderFilter(e.target.value)}
                className="gender-filter"
              >
                <option value="">All Genders</option>
                <option value="der">Der</option>
                <option value="die">Die</option>
                <option value="das">Das</option>
              </select>
            </div>

            <button 
              onClick={() => setShowAddModal(true)} 
              className="btn btn-success"
            >
              + Add Word
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Words List */}
          {loading ? (
            <div className="loading">Loading words...</div>
          ) : (
            <div className="words-grid">
              {words.length === 0 ? (
                <div className="empty-state">
                  <h3>No words found</h3>
                  <p>Start building your German vocabulary by adding your first word!</p>
                </div>
              ) : (
                words.map((word) => (
                  <div key={word.id} className="word-card">
                    <div className="word-header">
                      <h3>
                        {word.gender && <span className={`gender ${word.gender}`}>{word.gender}</span>}
                        {word.word}
                      </h3>
                      <div className="word-actions">
                        <button 
                          onClick={() => openEditModal(word)}
                          className="btn btn-sm btn-outline"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteWord(word.id)}
                          className="btn btn-sm btn-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    {word.translation && (
                      <div className="word-section">
                        <strong>Translation:</strong>
                        <p>{word.translation}</p>
                      </div>
                    )}

                    {word.notes && (
                      <div className="word-section">
                        <strong>Notes:</strong>
                        <p>{word.notes}</p>
                      </div>
                    )}
                    
                    {word.usage && (
                      <div className="word-section">
                        <strong>Usage:</strong>
                        <p>{word.usage}</p>
                      </div>
                    )}
                    
                    {word.conjugation && (
                      <div className="word-section">
                        <strong>Conjugation:</strong>
                        <p>{word.conjugation}</p>
                      </div>
                    )}
                    
                    <div className="word-meta">
                      Added: {new Date(word.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Other tabs placeholder */}
      {activeTab !== 'words' && (
        <div className="tab-content">
          <div className="coming-soon">
            <h2>Coming Soon</h2>
            <p>{activeTab === 'grammar' ? 'Grammar lessons and exercises' : 'Practice activities and quizzes'}</p>
          </div>
        </div>
      )}

      {/* Add Word Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Word</h2>
              <button onClick={closeModals} className="modal-close">&times;</button>
            </div>
            <form onSubmit={handleAddWord} className="modal-form">
              <div className="form-group">
                <label>Word *</label>
                <input
                  type="text"
                  name="word"
                  value={formData.word}
                  onChange={handleWordChange}
                  required
                  placeholder="Enter German word"
                />
              </div>
              
              <div className="form-group">
                <label>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="">Select gender</option>
                  <option value="der">Der</option>
                  <option value="die">Die</option>
                  <option value="das">Das</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  Translation {isTranslating && <span className="translating-hint">translating...</span>}
                </label>
                <input
                  type="text"
                  name="translation"
                  value={formData.translation}
                  onChange={handleInputChange}
                  placeholder="English translation"
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Translation, meaning, etc."
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Usage</label>
                <textarea
                  name="usage"
                  value={formData.usage}
                  onChange={handleInputChange}
                  placeholder="Example sentences"
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Conjugation</label>
                <textarea
                  name="conjugation"
                  value={formData.conjugation}
                  onChange={handleInputChange}
                  placeholder="Verb conjugations"
                  rows="3"
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={closeModals} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Word
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Word Modal */}
      {showEditModal && editingWord && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Word</h2>
              <button onClick={closeModals} className="modal-close">&times;</button>
            </div>
            <form onSubmit={handleEditWord} className="modal-form">
              {/* Form fields same as add modal */}
              <div className="form-group">
                <label>Word *</label>
                <input
                  type="text"
                  name="word"
                  value={formData.word}
                  onChange={handleWordChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange}>
                  <option value="">Select gender</option>
                  <option value="der">Der</option>
                  <option value="die">Die</option>
                  <option value="das">Das</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  Translation {isTranslating && <span className="translating-hint">translating...</span>}
                </label>
                <input
                  type="text"
                  name="translation"
                  value={formData.translation}
                  onChange={handleInputChange}
                  placeholder="English translation"
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Usage</label>
                <textarea
                  name="usage"
                  value={formData.usage}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Conjugation</label>
                <textarea
                  name="conjugation"
                  value={formData.conjugation}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={closeModals} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;

