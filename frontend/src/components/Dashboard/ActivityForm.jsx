import React, { useState, useEffect } from 'react';
import { X, Save, Clock, MapPin, FileText, Tag } from 'lucide-react';
import { isValidTimeRange } from '../../utils/helpers';

const ActivityForm = ({ activity, selectedDate, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'kuliah',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activity) {
      setFormData({
        title: activity.title || '',
        category: activity.category || 'kuliah',
        startTime: activity.startTime || '',
        endTime: activity.endTime || '',
        location: activity.location || '',
        description: activity.description || '',
      });
    }
  }, [activity]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error untuk field yang diubah
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Judul kegiatan wajib diisi';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Waktu mulai wajib diisi';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'Waktu selesai wajib diisi';
    }

    if (formData.startTime && formData.endTime) {
      if (!isValidTimeRange(formData.startTime, formData.endTime)) {
        newErrors.endTime = 'Waktu selesai harus lebih besar dari waktu mulai';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving activity:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="glass-card-dark w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-black/40 backdrop-blur-md p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {activity ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Judul Kegiatan *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Contoh: Kuliah Pemrograman Web"
              className={`input-field ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && (
              <p className="mt-2 text-sm text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              <Tag className="w-4 h-4 inline mr-2" />
              Kategori
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { value: 'kuliah', label: 'Kuliah', color: 'blue' },
                { value: 'organisasi', label: 'Organisasi', color: 'purple' },
                { value: 'personal', label: 'Personal', color: 'green' },
                { value: 'other', label: 'Lainnya', color: 'orange' },
              ].map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    formData.category === cat.value
                      ? `bg-${cat.color}-500/20 border-${cat.color}-500 text-${cat.color}-300`
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Waktu Mulai *
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className={`input-field ${errors.startTime ? 'border-red-500' : ''}`}
              />
              {errors.startTime && (
                <p className="mt-2 text-sm text-red-400">{errors.startTime}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Waktu Selesai *
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className={`input-field ${errors.endTime ? 'border-red-500' : ''}`}
              />
              {errors.endTime && (
                <p className="mt-2 text-sm text-red-400">{errors.endTime}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Lokasi
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Contoh: Ruang Lab A.3.2"
              className="input-field"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Deskripsi / Catatan
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tambahkan catatan atau detail kegiatan..."
              rows={4}
              className="input-field resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Simpan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityForm;