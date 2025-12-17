
import React, { useState } from 'react';
import { Tool } from '../types';
import { motion } from 'framer-motion';
import { FaStar, FaArrowRight, FaPlay } from 'react-icons/fa';
import clsx from 'clsx';

interface ToolCardProps {
  tool: Tool;
  onClick: (tool: Tool) => void;
  featured?: boolean;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick, featured = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={clsx(
        'group relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-300',
        featured ? 'md:col-span-2 lg:col-span-3' : '',
        'bg-white dark:bg-card-dark',
        'border border-gray-200 dark:border-gray-800',
        'hover:border-primary-400 dark:hover:border-primary-600',
        'hover:shadow-premium'
      )}
      onClick={() => onClick(tool)}
    >
      {/* Gradient Overlay on Hover */}
      <div className={clsx(
        'absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500',
        'bg-gradient-primary'
      )} />

      {/* Shimmer Effect */}
      {isHovered && (
        <div className="absolute inset-0 shimmer pointer-events-none" />
      )}

      <div className={clsx(
        'relative p-6 h-full flex',
        featured ? 'flex-col md:flex-row gap-6 items-start md:items-center' : 'flex-col'
      )}>

        {/* Header: Logo & Info */}
        <div className={clsx(
          'flex items-start gap-4 w-full',
          featured ? 'md:w-auto' : ''
        )}>
          {/* Logo with Glow */}
          <div className="relative">
            <div className={clsx(
              'absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300',
              'bg-primary-400'
            )} />
            <img
              src={tool.logoUrl}
              alt={tool.name}
              loading="lazy"
              className={clsx(
                'relative rounded-2xl object-cover border border-gray-100 dark:border-gray-700 shadow-md bg-white',
                featured ? 'size-24' : 'size-16'
              )}
            />
          </div>

          {/* Name & Category */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={clsx(
                'font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate',
                featured ? 'text-2xl' : 'text-lg'
              )}>
                {tool.name}
              </h3>

              {/* Trending Badge */}
              {tool.rating >= 4.8 && (
                <span className="px-2 py-0.5 bg-gradient-premium text-white text-[10px] font-bold uppercase rounded-full shimmer">
                  🔥 Hot
                </span>
              )}
            </div>

            {/* Category Badge */}
            <span className="inline-block text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
              {tool.category}
            </span>
          </div>

          {/* Rating (Desktop) */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <FaStar className="text-amber-500 text-sm" />
            <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
              {tool.rating > 0 ? tool.rating.toFixed(1) : 'N/A'}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className={clsx(
          'flex-1 min-w-0',
          featured ? 'mt-0' : 'mt-4'
        )}>
          <p className={clsx(
            'text-gray-600 dark:text-gray-300 leading-relaxed',
            featured ? 'text-base line-clamp-3' : 'text-sm line-clamp-2'
          )}>
            {tool.description}
          </p>

          {/* Features Pills (Featured Only) */}
          {featured && tool.features && tool.features.length > 0 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {tool.features.slice(0, 3).map((feature, idx) => (
                <span
                  key={idx}
                  className="text-xs text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700 px-3 py-1 rounded-full bg-gray-50 dark:bg-gray-800/50"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer: Price & CTA */}
        <div className={clsx(
          'flex items-center justify-between gap-3 mt-4',
          featured ? 'md:flex-col md:items-end md:mt-0 md:min-w-[140px]' : 'border-t border-gray-100 dark:border-gray-800/50 pt-4'
        )}>
          {/* Mobile Rating */}
          <div className="flex sm:hidden items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <FaStar className="text-amber-500 text-sm" />
            <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
              {tool.rating > 0 ? tool.rating.toFixed(1) : 'N/A'}
            </span>
          </div>

          {/* Price Badge */}
          <div className={clsx(
            'text-xs font-bold px-3 py-1.5 rounded-lg',
            tool.isPremium
              ? 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30'
              : 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
          )}>
            {tool.isPremium ? '💎 Pago' : '✨ Grátis'}
          </div>

          {/* CTA Button/Icon */}
          {featured ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-primary-500/30"
            >
              Ver Detalhes
              <FaArrowRight className="text-xs" />
            </motion.button>
          ) : (
            <motion.div
              whileHover={{ rotate: 45, scale: 1.1 }}
              className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-primary-500 group-hover:text-white transition-all"
            >
              <FaArrowRight className="text-sm" />
            </motion.div>
          )}
        </div>

        {/* Video Preview Indicator (if has video) */}
        {tool.relatedVideoUrl && isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2"
          >
            <FaPlay className="text-[10px]" />
            Preview
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ToolCard;
