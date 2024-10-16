// components/PollSection.tsx
import React, { useState, useEffect } from 'react';
import { usePoll, Poll } from '@/context/PollContext';
import { useUserData } from '@/context/UserDataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaCheck, FaTimes, FaChartBar, FaClock, FaTrash, FaEdit } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { useAuthContext } from '@/context/AuthContext';
import { Input } from './ui/input';
import { usePopular, PopularItem } from '@/context/PopularContext';

const PollSection: React.FC = () => {
    const { polls, allPolls, loadMorePolls, createPoll, votePoll, deletePoll, updatePoll } = usePoll();
    const { userData } = useUserData();
    const { user } = useAuthContext();
    const { popularItems } = usePopular();
    const allPopularItems = [...popularItems.movie, ...popularItems.tv];
    const [suggestions, setSuggestions] = useState<PopularItem[]>([]);
    const [newPollOptions, setNewPollOptions] = useState(['', '']);
    const [focusedOptionIndex, setFocusedOptionIndex] = useState<number | null>(null);
    const [showCreatePoll, setShowCreatePoll] = useState(false);
    const [selectedPoll, setSelectedPoll] = useState<string | null>(null);
    const [editingPoll, setEditingPoll] = useState<Poll | null>(null);

    const handleCreateOrUpdatePoll = async (e: React.FormEvent) => {
        e.preventDefault();
        const filteredOptions = newPollOptions.filter(option => option.trim() !== '');
        if (filteredOptions.length < 2) {
            alert('Please add at least two options for the poll.');
            return;
        }
    
        if (editingPoll) {
            // Update existing poll
            await updatePoll(editingPoll.id, filteredOptions);
        } else {
            // Create new poll
            await createPoll(filteredOptions);
        }
    
        closeCreateEditForm();
    };
const handleEditPoll = (poll: Poll) => {
    setEditingPoll(poll);
    setNewPollOptions(poll.options);
    setShowCreatePoll(true);
};
const closeCreateEditForm = () => {
    setShowCreatePoll(false);
    setEditingPoll(null);
    setNewPollOptions(['', '']);
};
  const handleInputChange = (value: string, index: number) => {
    const newOptions = [...newPollOptions];
    newOptions[index] = value;
    setNewPollOptions(newOptions);
  
    if (value.length > 0) {
      const filtered = allPopularItems.filter(item => 
        (item.title || item.name || '').toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = (suggestion: PopularItem, index: number) => {
    const newOptions = [...newPollOptions];
    newOptions[index] = suggestion.title || suggestion.name || '';
    setNewPollOptions(newOptions);
    setSuggestions([]);
  };

  const handleVote = (pollId: string, optionIndex: number) => {
    if (user && userData) {
      votePoll(pollId, optionIndex, userData.username);
    }
  };

  const handleDeletePoll = (pollId: string) => {
    if (window.confirm('Are you sure you want to delete this poll?')) {
      deletePoll(pollId);
    }
  };

  const formatCreatedAt = (timestamp: Timestamp) => {
    try {
      const date = timestamp.toDate();
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown time';
    }
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            setShowCreatePoll(false);
        }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
}, []);


return (
    <div className="mb-2 bg-black/40 text-white px-4 py-2 rounded-3xl shadow-lg">
      <h2 className="md:text-2xl md:text-2xl font-bold mb-2 text-white text-start">Community Polls</h2>
      <div className="flex justify-between items-center mb-4">
        {userData && (
          <button
            onClick={() => {
              setEditingPoll(null);
              setNewPollOptions(['', '']);
              setShowCreatePoll(true);
            }}
            className="bg-pink-700 hover:bg-pink-400 text-white text-sm px-2 py-1 rounded-lg transition duration-300 flex items-center"
          >
            <FaPlus className="mr-2" /> Create New Poll
          </button>
        )}
        {polls.length < allPolls.length && (
          <button
            onClick={loadMorePolls}
            className="bg-transparent hover:bg-transparent text-white text-sm px-2 hover:text-pink-400 px-4 py-2 rounded-lg transition duration-300"
          >
            View More Polls
          </button>
        )}
      </div>

      <AnimatePresence>
        {showCreatePoll && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-pink-400">
                {editingPoll ? 'Edit Poll' : 'Create a New Poll'}
                </h3>
                <button
                    onClick={closeCreateEditForm}
                    className="text-gray-400 hover:text-white transition duration-300"
                >
                    <FaTimes />
                </button>
              </div>
              <form onSubmit={handleCreateOrUpdatePoll}>
                <div className="space-y-4">
                  {newPollOptions.map((option, index) => (
                    <div key={index} className="relative">
                        <Input
                        type="text"
                        value={option}
                        onChange={(e) => handleInputChange(e.target.value, index)}
                        onFocus={() => setFocusedOptionIndex(index)}
                        onBlur={() => setTimeout(() => setFocusedOptionIndex(null), 200)}
                        placeholder={`Movie option ${index + 1}`}
                        className="w-full p-3 bg-gray-700 border-none rounded-lg text-white transition duration-300"
                        required
                        />
                        {focusedOptionIndex === index && suggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-gray-800 rounded-lg shadow-lg">
                            {suggestions.map((suggestion) => (
                            <div
                                key={suggestion.id}
                                className="p-2 hover:bg-gray-700 cursor-pointer"
                                onMouseDown={() => handleSuggestionSelect(suggestion, index)}
                            >
                                {suggestion.title || suggestion.name}
                            </div>
                            ))}
                        </div>
                        )}
                    </div>
                    ))}
                </div>
                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={() => setNewPollOptions([...newPollOptions, ''])}
                    className="bg-pink-700 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition duration-300 flex items-center"
                  >
                    <FaPlus className="mr-2" /> Add Option
                  </button>
                  <button type="submit" className="bg-pink-500 hover:bg-pink-400 text-white px-6 py-2 rounded-lg transition duration-300 flex items-center">
                    <FaCheck className="mr-2" /> {editingPoll ? 'Update Poll' : 'Create Poll'}
                    </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {polls.map((poll) => (
            <motion.div 
                key={poll.id} 
                className="bg-gray-900/30 p-4 rounded-3xl shadow-md"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
            <h3 className="text-xl font-semibold mb-4 text-pink-400">{poll.question}</h3>
            <div className="space-y-3">
                {poll.options.map((option, index) => {
                const totalVotes = Object.values(poll.votes).reduce((a, b) => a + b, 0);
                const votePercentage = totalVotes > 0 ? (poll.votes[index] || 0) / totalVotes * 100 : 0;
                const hasVoted = userData && poll.userVotes?.[userData.username]?.includes(index);
                return (
                    <button
                    key={index}
                    onClick={() => handleVote(poll.id, index)}
                    className={`block w-full text-left px-2 py-1 bg-gray-900 hover:bg-gray-700 rounded-lg transition duration-300 relative overflow-hidden ${hasVoted ? 'bg-pink-700' : ''}`}
                    >
                    <div className="relative z-10 flex justify-between items-center">
                        <span className="text-white text-sm">{option}</span>
                        <span className="text-pink-300">({poll.votes[index] || 0} votes)</span>
                    </div>
                    <div 
                        className="absolute top-0 left-0 h-full bg-pink-500 opacity-20 transition-all duration-300"
                        style={{ width: `${votePercentage}%` }}
                    ></div>
                    </button>
                );
                })}
            </div>
            <div className="mt-4 flex justify-between items-center text-sm text-gray-400">
              <span className="flex items-center">
                <FaClock className="mr-1" />
                {formatCreatedAt(poll.createdAt)}
              </span>
              <div>
                <button
                  onClick={() => setSelectedPoll(selectedPoll === poll.id ? null : poll.id)}
                  className="flex items-center text-pink-400 hover:text-pink-300 transition duration-300 mr-2"
                >
                  <FaChartBar className="mr-1" />
                  {selectedPoll === poll.id ? 'Hide' : 'Show'} Results
                </button>
                {user && poll.createdBy === user.uid && (
  <>
    <button
      onClick={() => handleEditPoll(poll)}
      className="flex items-center text-blue-400 hover:text-blue-300 transition duration-300 mr-2"
    >
      <FaEdit className="mr-1" />
      Edit
    </button>
    <button
      onClick={() => handleDeletePoll(poll.id)}
      className="flex items-center text-red-400 hover:text-red-300 transition duration-300"
    >
      <FaTrash className="mr-1" />
      Delete
    </button>
  </>
)}
              </div>
            </div>
            <AnimatePresence>
              {selectedPoll === poll.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 bg-gray-700 p-4 rounded-lg"
                >
                  {poll.options.map((option, index) => {
                const totalVotes = Object.values(poll.votes).reduce((a, b) => a + b, 0);
                const votePercentage = totalVotes > 0 ? (poll.votes[index] || 0) / totalVotes * 100 : 0;
                return (
                  <div key={index} className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{option}</span>
                      <span>{votePercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-pink-500 h-2 rounded-full"
                        style={{ width: `${votePercentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Voters: {Object.entries(poll.userVotes)
                        .filter(([, votes]) => votes.includes(index))
                        .map(([username]) => username)
                        .join(', ')}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PollSection;