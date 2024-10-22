'use client'

import React from 'react';
import { useSession } from '@/context/SessionContext';
import { format } from 'date-fns';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Users } from 'lucide-react';

const SessionsPage = () => {
  const { sessions } = useSession();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-white">Movie Night Sessions</h1>
      <div className="grid gap-4">
        {sessions.length === 0 ? (
          <div className="text-center p-8 text-gray-400">
            No active sessions found. Create a new session to get started!
          </div>
        ) : (
          sessions.map((session) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/50 p-4 rounded-lg shadow hover:bg-gray-900/70 transition-colors"
            >
              <Link href={`/sessions/${session.id}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-semibold text-white mb-2">
                      Session by {session.createdBy}
                    </p>
                    <div className="flex items-center text-gray-400 text-sm mb-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      {format(new Date(session.createdAt), 'PPP')}
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <Users className="w-4 h-4 mr-2" />
                      {Object.keys(session.userDates).length} participants
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className={`px-2 py-1 rounded-full ${
                      session.status === 'active' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                </div>
                {session.poll && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <p className="text-sm text-gray-400">
                      Poll: {session.poll.movieTitles.length} movies,{' '}
                      {Object.keys(session.poll.votes).length} votes
                    </p>
                  </div>
                )}
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default SessionsPage;