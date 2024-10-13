'use client'

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedTitleProps {
  children: React.ReactNode;
}

const AnimatedTitle: React.FC<AnimatedTitleProps> = ({ children }) => {
  return (
    <motion.h1
      className="text-4xl font-bold mb-8 text-primary"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.h1>
  );
};

export default AnimatedTitle;