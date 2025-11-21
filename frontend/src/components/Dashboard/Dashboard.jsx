import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { activityAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Plus, Calendar, TrendingUp, AlertTriangle, 
  ChevronLeft, ChevronRight, LogOut, BarChart3,
  Clock, CheckCircle2, Zap
} from 'lucide-react';
import ActivityCard from './ActivityCard';
import ActivityForm from './ActivityForm';
import Analytics from './Analytics';
import { 
  formatRelativeDate, 
  calculateProductivityScore, 
  detectBurnout,
  getCategoryStats 
} from '../../utils/helpers';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  useEffect(() => {
    fetchActivities();
  }, [selectedDate]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await activityAPI.getAll({ date: selectedDate });
      setActivities(response.data.data);
    } catch (error) {
      toast.error('Gagal memuat kegiatan');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = () => {
    setEditingActivity(null);
    setShowAddModal(true);
  };

  const handleEditActivity = (activity) => {
    setEditingActivity(activity);
    setShowAddModal(true);
  };

  const handleDeleteActivity = async (id) => {
    if (!confirm('Yakin ingin menghapus kegiatan ini?')) return;

    try {
      await activityAPI.delete(id);
      setActivities(activities.filter(a => a._id !== id));
      toast.success('Kegiatan berhasil dihapus');
    } catch (error) {
      toast.error('Gagal menghapus kegiatan');
    }
  };

  const handleSaveActivity = async (formData) => {
    try {
      if (editingActivity) {
        const response = await activityAPI.update(editingActivity._id, formData);
        setActivities(activities.map(a => 
          a._id === editingActivity._id ? response.data.data : a
        ));
        toast.success('Kegiatan berhasil diupdate');
      } else {
        const response = await activityAPI.create({ ...formData, date: selectedDate });
        setActivities([...activities, response.data.data]);
        toast.success('Kegiatan berhasil ditambahkan');
      }
      setShowAddModal(false);
      setEditingActivity(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const todayActivities = activities.sort((a, b) => 
    a.startTime.localeCompare(b.startTime)
  );

  const productivityScore = calculateProductivityScore(todayActivities);
  const burnoutStatus = detectBurnout(todayActivities);
  const categoryStats = getCategoryStats(todayActivities);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Halo, {user?.name}! 👋
            </h1>
            <p className="text-white/60">
              {formatRelativeDate(selectedDate)} • {todayActivities.length} kegiatan
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="btn-secondary flex items-center gap-2"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="hidden sm:inline">Analytics</span>
            </button>
            <button
              onClick={logout}
              className="btn-secondary flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Analytics Panel */}
        {showAnalytics && (
          <div className="mb-8 animate-slide-down">
            <Analytics activities={activities} selectedDate={selectedDate} />
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-slide-up">
          {/* Productivity Score */}
          <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-3xl font-bold text-white">{productivityScore}%</span>
            </div>
            <h3 className="text-white/60 text-sm">Productivity Score</h3>
            <div className="mt-3 w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: `${productivityScore}%` }}
              ></div>
            </div>
          </div>

          {/* Total Activities */}
          <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-3xl font-bold text-white">{todayActivities.length}</span>
            </div>
            <h3 className="text-white/60 text-sm">Total Kegiatan</h3>
            <p className="mt-2 text-xs text-white/40">
              {Object.keys(categoryStats).length} kategori
            </p>
          </div>

          {/* Burnout Status */}
          <div className={`glass-card p-6 hover:scale-105 transition-transform duration-300 ${
            burnoutStatus.status === 'danger' ? 'border-red-500/50' :
            burnoutStatus.status === 'warning' ? 'border-yellow-500/50' :
            'border-green-500/50'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${
                burnoutStatus.status === 'danger' ? 'bg-red-500/20' :
                burnoutStatus.status === 'warning' ? 'bg-yellow-500/20' :
                'bg-green-500/20'
              }`}>
                {burnoutStatus.status === 'good' ? (
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                )}
              </div>
              <span className="text-2xl">{burnoutStatus.icon}</span>
            </div>
            <h3 className="text-white/60 text-sm mb-2">Status Jadwal</h3>
            <p className={`text-sm font-medium ${
              burnoutStatus.status === 'danger' ? 'text-red-300' :
              burnoutStatus.status === 'warning' ? 'text-yellow-300' :
              'text-green-300'
            }`}>
              {burnoutStatus.message}
            </p>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="glass-card p-4 mb-6 animate-slide-up">
          <div className="flex items-center justify-between">
            <button
              onClick={() => changeDate(-1)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-purple-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white font-semibold text-lg focus:outline-none cursor-pointer"
              />
            </div>
            
            <button
              onClick={() => changeDate(1)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Activities List */}
        <div className="space-y-4 mb-20">
          {loading ? (
            <div className="glass-card p-12 text-center">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-white/60">Memuat kegiatan...</p>
            </div>
          ) : todayActivities.length === 0 ? (
            <div className="glass-card p-12 text-center animate-scale-in">
              <Calendar className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Belum ada kegiatan
              </h3>
              <p className="text-white/60 mb-6">
                Mulai tambahkan jadwal kegiatan kamu hari ini
              </p>
              <button
                onClick={handleAddActivity}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Tambah Kegiatan
              </button>
            </div>
          ) : (
            <>
              {todayActivities.map((activity, index) => (
                <ActivityCard
                  key={activity._id}
                  activity={activity}
                  onEdit={handleEditActivity}
                  onDelete={handleDeleteActivity}
                  style={{ animationDelay: `${index * 0.1}s` }}
                />
              ))}
            </>
          )}
        </div>

        {/* Floating Add Button */}
        {todayActivities.length > 0 && (
          <button
            onClick={handleAddActivity}
            className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 z-50 animate-bounce-subtle"
          >
            <Plus className="w-8 h-8 text-white" />
          </button>
        )}
      </div>

      {/* Activity Form Modal */}
      {showAddModal && (
        <ActivityForm
          activity={editingActivity}
          selectedDate={selectedDate}
          onSave={handleSaveActivity}
          onClose={() => {
            setShowAddModal(false);
            setEditingActivity(null);
          }}
        />
      )}

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;