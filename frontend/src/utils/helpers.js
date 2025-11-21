import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';
import { id } from 'date-fns/locale';

export const formatDate = (date, formatStr = 'dd MMMM yyyy') => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: id });
  } catch (error) {
    return date;
  }
};

export const formatRelativeDate = (date) => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (isToday(dateObj)) return 'Hari ini';
    if (isTomorrow(dateObj)) return 'Besok';
    if (isYesterday(dateObj)) return 'Kemarin';
    
    return formatDate(dateObj, 'EEEE, dd MMM');
  } catch (error) {
    return date;
  }
};

export const formatTime = (time) => {
  if (!time) return '';
  return time.substring(0, 5); 
};

export const calculateDuration = (startTime, endTime) => {
  try {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const hours = (end - start) / 3600000;
    return hours;
  } catch (error) {
    return 0;
  }
};

export const formatDuration = (startTime, endTime) => {
  const totalHours = calculateDuration(startTime, endTime);
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);
  
  if (hours === 0) return `${minutes} menit`;
  if (minutes === 0) return `${hours} jam`;
  return `${hours} jam ${minutes} menit`;
};

export const getCategoryConfig = (category) => {
  const configs = {
    kuliah: {
      color: 'blue',
      label: 'Kuliah',
      gradient: 'from-blue-500 to-blue-600',
      bgClass: 'bg-blue-500/20',
      textClass: 'text-blue-300',
      borderClass: 'border-blue-500/50',
    },
    organisasi: {
      color: 'purple',
      label: 'Organisasi',
      gradient: 'from-purple-500 to-purple-600',
      bgClass: 'bg-purple-500/20',
      textClass: 'text-purple-300',
      borderClass: 'border-purple-500/50',
    },
    personal: {
      color: 'green',
      label: 'Personal',
      gradient: 'from-green-500 to-green-600',
      bgClass: 'bg-green-500/20',
      textClass: 'text-green-300',
      borderClass: 'border-green-500/50',
    },
    other: {
      color: 'orange',
      label: 'Lainnya',
      gradient: 'from-orange-500 to-orange-600',
      bgClass: 'bg-orange-500/20',
      textClass: 'text-orange-300',
      borderClass: 'border-orange-500/50',
    },
  };
  
  return configs[category] || configs.other;
};

export const calculateProductivityScore = (activities) => {
  if (!activities || activities.length === 0) return 0;
  
  const totalMinutes = activities.reduce((sum, act) => {
    return sum + (calculateDuration(act.startTime, act.endTime) * 60);
  }, 0);
  
  const score = Math.min(100, Math.round((totalMinutes / 720) * 100));
  return score;
};

export const detectBurnout = (activities) => {
  if (!activities || activities.length === 0) {
    return { status: 'good', message: 'Belum ada aktivitas', icon: '✅' };
  }

  const sorted = [...activities].sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Check for overlap first
  let isOverlap = false;
  for (let i = 0; i < sorted.length - 1; i++) {
    const currentEnd = new Date(`2000-01-01T${sorted[i].endTime}`);
    const nextStart = new Date(`2000-01-01T${sorted[i + 1].startTime}`);
    
    // If an activity ends after the next one starts, they overlap.
    if (currentEnd > nextStart) {
      isOverlap = true;
      break;
    }
  }

  if (isOverlap) {
    return {
      status: 'danger',
      message: 'Terdapat jadwal yang bertabrakan (overlap)!',
      icon: '❌',
      recommendation: 'Sesuaikan waktu mulai/selesai agar tidak ada yang bertabrakan'
    };
  }
  
  const totalHours = activities.reduce((sum, act) => {
    return sum + calculateDuration(act.startTime, act.endTime);
  }, 0);

  let hasBreak = false;
  
  for (let i = 0; i < sorted.length - 1; i++) {
    const currentEnd = new Date(`2000-01-01T${sorted[i].endTime}`);
    const nextStart = new Date(`2000-01-01T${sorted[i + 1].startTime}`);
    const breakMinutes = (nextStart - currentEnd) / 60000;
    
    if (breakMinutes >= 30) {
      hasBreak = true;
      break;
    }
  }

  if (totalHours > 12) {
    return {
      status: 'danger',
      message: 'Jadwal terlalu padat! Lebih dari 12 jam aktivitas.',
      icon: '🔥',
      recommendation: 'Kurangi beban aktivitas atau pisahkan ke hari lain'
    };
  }
  
  // LOGIC CHANGE: 8 hours changed to 5 hours for warning status
  if (totalHours > 5 && !hasBreak) {
    return {
      status: 'warning',
      message: 'Tidak ada waktu istirahat! Tambahkan break minimal 30 menit.',
      icon: '⚡',
      recommendation: 'Sisipkan waktu istirahat 30-60 menit'
    };
  }
  
  if (!hasBreak && activities.length > 3) {
    return {
      status: 'warning',
      message: 'Pertimbangkan menambah waktu istirahat antar aktivitas.',
      icon: '💡',
      recommendation: 'Break singkat membantu meningkatkan fokus'
    };
  }

  return {
    status: 'good',
    message: 'Jadwal terlihat seimbang!',
    icon: '✅',
    recommendation: 'Pertahankan pola ini untuk produktivitas optimal'
  };
};

export const getCategoryStats = (activities) => {
  const stats = {};
  
  activities.forEach(act => {
    const hours = calculateDuration(act.startTime, act.endTime);
    
    if (!stats[act.category]) {
      stats[act.category] = {
        count: 0,
        totalHours: 0,
        percentage: 0,
      };
    }
    
    stats[act.category].count++;
    stats[act.category].totalHours += hours;
  });
  
  const totalHours = Object.values(stats).reduce((sum, s) => sum + s.totalHours, 0);
  Object.keys(stats).forEach(key => {
    stats[key].percentage = Math.round((stats[key].totalHours / totalHours) * 100);
    stats[key].totalHours = Math.round(stats[key].totalHours * 10) / 10; 
  });
  
  return stats;
};

export const isValidTimeRange = (startTime, endTime) => {
  try {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return end > start;
  } catch {
    return false;
  }
};

export const checkTimeOverlap = (activities, newActivity, excludeId = null) => {
  const newStart = new Date(`2000-01-01T${newActivity.startTime}`);
  const newEnd = new Date(`2000-01-01T${newActivity.endTime}`);
  
  return activities.some(act => {
    if (excludeId && act._id === excludeId) return false;
    if (act.date !== newActivity.date) return false;
    
    const actStart = new Date(`2000-01-01T${act.startTime}`);
    const actEnd = new Date(`2000-01-01T${act.endTime}`);
    
    return (newStart < actEnd && newEnd > actStart);
  });
};