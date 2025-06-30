import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaUsers, 
  FaUserMd, 
  FaCalendarAlt, 
  FaComments, 
  FaBell, 
  FaChartLine, 
  FaChartBar, 
  FaChartPie,
  FaArrowUp,
  FaArrowDown,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaHeart,
  FaBrain,
  FaVideo,
  FaPhone,
  FaComments as FaChat
} from 'react-icons/fa';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const StatisticsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const adminToken = localStorage.getItem('adminToken');

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/statistics`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      setStats(response.data.statistics);
      setError(null);
    } catch (err) {
      setError('Failed to fetch statistics');
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-4">
        {error}
        <button 
          onClick={fetchStatistics}
          className="ml-2 text-blue-600 hover:text-blue-800 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const StatCard = ({ title, value, icon, color, change, subtitle }) => (
    <div className={`bg-white rounded-xl p-6 shadow-lg border-l-4 ${color} hover:shadow-xl transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {change && (
            <div className={`flex items-center mt-2 text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-l-', 'bg-').replace('-500', '-100')}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const ChartCard = ({ title, children, className = "" }) => (
    <div className={`bg-white rounded-xl p-6 shadow-lg ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      {children}
    </div>
  );

  // Prepare data for charts
  const prepareAppointmentStatusData = () => {
    if (!stats.appointments.statusBreakdown) return [];
    return stats.appointments.statusBreakdown.map((status, index) => ({
      name: status._id.charAt(0).toUpperCase() + status._id.slice(1),
      value: status.count,
      color: COLORS[index % COLORS.length]
    }));
  };

  const prepareSessionTypeData = () => {
    if (!stats.appointments.sessionTypeBreakdown) return [];
    return stats.appointments.sessionTypeBreakdown.map((type, index) => ({
      name: type._id.charAt(0).toUpperCase() + type._id.slice(1),
      value: type.count,
      color: COLORS[index % COLORS.length]
    }));
  };

  const prepareMonthlyTrendsData = () => {
    if (!stats.appointments.monthlyTrends) return [];
    return stats.appointments.monthlyTrends.map(trend => ({
      month: `${trend._id.year}-${trend._id.month.toString().padStart(2, '0')}`,
      appointments: trend.count
    }));
  };

  const prepareTherapistPerformanceData = () => {
    if (!stats.therapists.topPerformers) return [];
    return stats.therapists.topPerformers.map(therapist => ({
      name: therapist.therapistName,
      total: therapist.totalAppointments,
      completed: therapist.completedAppointments,
      completionRate: parseFloat(therapist.completionRate.toFixed(1))
    }));
  };

  const prepareReminderData = () => {
    return [
      { name: '24h Reminders', value: stats.reminders.total24h, color: '#0088FE' },
      { name: '1h Reminders', value: stats.reminders.total1h, color: '#00C49F' },
      { name: '15min Reminders', value: stats.reminders.total15min, color: '#FFBB28' }
    ];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Statistics</h2>
        <button 
          onClick={fetchStatistics}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.users.total}
          icon={<FaUsers className="text-2xl text-blue-600" />}
          color="border-l-blue-500"
          subtitle={`${stats.users.newThisMonth} new this month`}
        />
        <StatCard
          title="Total Therapists"
          value={stats.therapists.total}
          icon={<FaUserMd className="text-2xl text-purple-600" />}
          color="border-l-purple-500"
          subtitle={`${stats.therapists.active} active`}
        />
        <StatCard
          title="Total Appointments"
          value={stats.appointments.total}
          icon={<FaCalendarAlt className="text-2xl text-green-600" />}
          color="border-l-green-500"
          subtitle={`${stats.appointments.thisMonth} this month`}
        />
        <StatCard
          title="Chat Messages"
          value={stats.chat.totalMessages}
          icon={<FaComments className="text-2xl text-indigo-600" />}
          color="border-l-indigo-500"
          subtitle={`${stats.chat.messagesThisMonth} this month`}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Status Pie Chart */}
        <ChartCard title="Appointment Status Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={prepareAppointmentStatusData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {prepareAppointmentStatusData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Session Type Pie Chart */}
        <ChartCard title="Session Type Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={prepareSessionTypeData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {prepareSessionTypeData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Monthly Trends Line Chart */}
      <ChartCard title="Monthly Appointment Trends">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={prepareMonthlyTrendsData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="appointments" 
              stroke="#8884d8" 
              strokeWidth={3}
              dot={{ fill: '#8884d8', strokeWidth: 2, r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Therapist Performance Bar Chart */}
      <ChartCard title="Therapist Performance">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={prepareTherapistPerformanceData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="total" fill="#8884d8" name="Total Appointments" />
            <Bar yAxisId="left" dataKey="completed" fill="#82ca9d" name="Completed" />
            <Line yAxisId="right" type="monotone" dataKey="completionRate" stroke="#ff7300" name="Completion Rate %" />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Reminder Statistics */}
      <ChartCard title="Email Reminder Statistics">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <FaBell className="text-2xl text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{stats.reminders.total24h}</div>
            <div className="text-sm text-gray-600">24h Reminders</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <FaClock className="text-2xl text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600">{stats.reminders.total1h}</div>
            <div className="text-sm text-gray-600">1h Reminders</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <FaExclamationTriangle className="text-2xl text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{stats.reminders.total15min}</div>
            <div className="text-sm text-gray-600">15min Reminders</div>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={prepareReminderData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Recent Appointments">
          <div className="space-y-3">
            {stats.recentActivity.appointments.slice(0, 5).map((appointment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{appointment.userId?.name || 'User'}</div>
                  <div className="text-sm text-gray-600">
                    with {appointment.therapistId?.name || 'Therapist'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{appointment.status}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(appointment.startDateTime).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Recent Users">
          <div className="space-y-3">
            {stats.recentActivity.users.map((user, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* System Health */}
      <ChartCard title="System Health">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <FaCheckCircle className="text-2xl text-green-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-green-600">Database</div>
            <div className="text-xs text-gray-600">{stats.systemHealth.databaseConnections}</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <FaBell className="text-2xl text-blue-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-blue-600">Reminder Scheduler</div>
            <div className="text-xs text-gray-600">
              {Object.keys(stats.systemHealth.reminderScheduler).length} jobs active
            </div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <FaComments className="text-2xl text-purple-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-purple-600">Email Service</div>
            <div className="text-xs text-gray-600">{stats.systemHealth.emailService}</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <FaClock className="text-2xl text-yellow-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-yellow-600">Last Backup</div>
            <div className="text-xs text-gray-600">
              {new Date(stats.systemHealth.lastBackup).toLocaleDateString()}
            </div>
          </div>
        </div>
      </ChartCard>
    </div>
  );
};

export default StatisticsDashboard; 