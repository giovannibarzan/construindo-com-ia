
import React from 'react';
import { CourseCategory } from '../types';
import { motion } from 'framer-motion';
import { FaClock, FaUsers, FaPlay } from 'react-icons/fa';
import clsx from 'clsx';

interface CourseCardProps {
  category: CourseCategory;
  onClick: (category: CourseCategory) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ category, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={() => onClick(category)}
      className={clsx(
        'group relative flex flex-col rounded-3xl overflow-hidden cursor-pointer transition-all h-full',
        'bg-white dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-800',
        'hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-premium'
      )}
    >
      {/* Thumbnail with Parallax */}
      <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
        <motion.img
          src={category.thumbnailUrl}
          alt={category.title}
          className="w-full h-full object-cover"
          loading="lazy"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/40 transition-all duration-300"></div>

        {/* Premium Badge */}
        {category.isPremium && (
          <div className="absolute top-3 right-3 bg-gradient-premium backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
            <span className="material-symbols-outlined !text-xs">workspace_premium</span>
            Premium
          </div>
        )}

        {/* Play Icon on Hover */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="size-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <FaPlay className="text-white text-xl ml-1" />
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Tags */}
        <div className="flex gap-2 flex-wrap">
          {category.tags.map(tag => (
            <span
              key={tag}
              className="text-[10px] uppercase font-bold text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/30 px-2.5 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors text-xl line-clamp-1">
          {category.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed flex-1">
          {category.description}
        </p>

        {/* Footer Stats */}
        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium border-t border-gray-100 dark:border-gray-800/50">
          <div className="flex items-center gap-1.5">
            <FaClock className="text-primary-500" />
            <span>4h 30m</span>
          </div>
          <span className="text-gray-300 dark:text-gray-700">•</span>
          <div className="flex items-center gap-1.5">
            <FaUsers className="text-primary-500" />
            <span>1.2k alunos</span>
          </div>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-r from-primary-500/5 via-transparent to-primary-500/5"></div>
    </motion.div>
  );
};

export default CourseCard;
