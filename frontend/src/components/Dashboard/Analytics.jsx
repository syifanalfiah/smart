import React from 'react';
import { TrendingUp, Clock, Target, Zap } from 'lucide-react';
import { 
  getCategoryStats, 
  detectBurnout, 
  calculateProductivityScore,
  getCategoryConfig 
} from '../../utils/helpers';

const Analytics = ({ activities, selectedDate }) => {
  const categoryStats = getCategoryStats(activities);
  const burnoutStatus = detectBurnout(activities);
  const productivityScore = calculateProductivityScore(activities);
  
  const totalHours = Object.values(categoryStats).reduce(
    (sum, stat) => sum + stat.totalHours, 
    0
  );

  return (
    <div className="glass-card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">
            📊 Analytics Dashboard
          </h2>
          <p className="text-white/60 text-sm">
            Insight produktivitas hari ini
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white">{Math.round(totalHours)}h</div>
          <div className="text-xs text-white/50">Total Waktu</div>
        </div>
      </div>

      {/* Burnout Alert */}
      {burnoutStatus.status !== 'good' && (
        <div className={`p-4 rounded-xl border-2 ${
          burnoutStatus.status === 'danger' 
            ? 'bg-red-500/10 border-red-500/50' 
            : 'bg-yellow-500/10 border-yellow-500/50'
        } animate-pulse`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">{burnoutStatus.icon}</span>
            <div className="flex-1">
              <h4 className={`font-semibold mb-1 ${
                burnoutStatus.status === 'danger' ? 'text-red-300' : 'text-yellow-300'
              }`}>
                {burnoutStatus.message}
              </h4>
              {burnoutStatus.recommendation && (
                <p className="text-sm text-white/70">
                  💡 {burnoutStatus.recommendation}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          Breakdown Kategori
        </h3>
        
        {Object.keys(categoryStats).length === 0 ? (
          <div className="text-center py-8 text-white/50">
            Belum ada data untuk ditampilkan
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(categoryStats).map(([category, stat]) => {
              const config = getCategoryConfig(category);
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.bgClass} ${config.textClass} ${config.borderClass}`}>
                        {config.label}
                      </span>
                      <span className="text-white/70 text-sm">
                        {stat.count} kegiatan
                      </span>
                    </div>
                    <span className="text-white font-semibold">
                      {stat.totalHours}h ({stat.percentage}%)
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${config.gradient} transition-all duration-500`}
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
        <div className="text-center p-4 bg-white/5 rounded-xl">
          <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white mb-1">
            {productivityScore}%
          </div>
          <div className="text-xs text-white/50">Productivity</div>
        </div>
        
        <div className="text-center p-4 bg-white/5 rounded-xl">
          <Clock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white mb-1">
            {activities.length}
          </div>
          <div className="text-xs text-white/50">Total Kegiatan</div>
        </div>
        
        <div className="text-center p-4 bg-white/5 rounded-xl">
          <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white mb-1">
            {Math.round(totalHours)}h
          </div>
          <div className="text-xs text-white/50">Jam Aktif</div>
        </div>
      </div>

      {/* Tips */}
      {burnoutStatus.status === 'good' && activities.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl">
          <p className="text-sm text-white/80">
            <span className="font-semibold text-green-300">✨ Keren!</span> Jadwal kamu sudah seimbang. 
            Jangan lupa tetap jaga kesehatan dan istirahat yang cukup.
          </p>
        </div>
      )}
    </div>
  );
};

export default Analytics;