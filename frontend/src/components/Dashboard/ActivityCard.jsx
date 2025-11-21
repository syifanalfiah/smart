import React from 'react';
import { Edit2, Trash2, Clock, MapPin } from 'lucide-react';
import { formatTime, formatDuration, getCategoryConfig } from '../../utils/helpers';

const ActivityCard = ({ activity, onEdit, onDelete, style }) => {
  const categoryConfig = getCategoryConfig(activity.category);

  return (
    <div 
      className="glass-card p-6 hover:scale-[1.02] transition-all duration-300 animate-slide-up cursor-pointer group"
      style={style}
      onClick={() => onEdit(activity)}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left Side - Time Badge */}
        <div className="flex-shrink-0">
          <div className={`px-4 py-2 rounded-xl bg-gradient-to-br ${categoryConfig.gradient} text-white font-bold text-sm shadow-lg`}>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatTime(activity.startTime)}</span>
            </div>
            <div className="text-xs opacity-80 mt-1">
              {formatDuration(activity.startTime, activity.endTime)}
            </div>
          </div>
        </div>

        {/* Middle - Content */}
        <div className="flex-1 min-w-0">
          {/* Category Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${categoryConfig.bgClass} ${categoryConfig.textClass} ${categoryConfig.borderClass}`}>
              {categoryConfig.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
            {activity.title}
          </h3>

          {/* Description */}
          {activity.description && (
            <p className="text-white/60 text-sm mb-3 line-clamp-2">
              {activity.description}
            </p>
          )}

          {/* Location */}
          {activity.location && (
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{activity.location}</span>
            </div>
          )}

          {/* Attachments */}
          {activity.attachments && activity.attachments.length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-xs text-purple-400">
              <span>📎 {activity.attachments.length} file terlampir</span>
            </div>
          )}
        </div>

        {/* Right Side - Actions */}
        <div className="flex-shrink-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(activity);
            }}
            className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="w-5 h-5 text-blue-400" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(activity._id);
            }}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>

      {/* Time Range Footer */}
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
        <span>
          {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
        </span>
        {activity.isCompleted && (
          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
            ✓ Selesai
          </span>
        )}
      </div>
    </div>
  );
};

export default ActivityCard;