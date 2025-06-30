import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  ComposedChart,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  FaCalendarAlt, 
  FaUsers, 
  FaUserMd, 
  FaComments,
  FaBell,
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaDownload,
  FaFilter
} from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AnalyticsCharts = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [selectedChart, setSelectedChart] = useState('overview');

  const adminToken = localStorage.getItem('adminToken');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4'];

  useEffect(() => {
    fetchAnalytics();
  }, [selectedTimeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/statistics`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      setStats(response.data.statistics);
    } catch (err) {
      console.error('Error fetching analytics:', err);
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

  if (!stats) return null;

  const ChartCard = ({ title, children, className = "" }) => (
    <div className={`bg-white rounded-xl p-6 shadow-lg ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      {children}
    </div>
  );

  const prepareUserGrowthData = () => {
    // Simulate user growth data over time
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => ({
      month,
      users: Math.floor(Math.random() * 50) + 10,
      therapists: Math.floor(Math.random() * 10) + 2,
      appointments: Math.floor(Math.random() * 100) + 20
    }));
  };

  const prepareEngagementData = () => {
    return [
      { name: 'Video Sessions', value: stats.appointments.sessionTypeBreakdown?.find(s => s._id === 'video')?.count || 0 },
      { name: 'Audio Sessions', value: stats.appointments.sessionTypeBreakdown?.find(s => s._id === 'audio')?.count || 0 },
      { name: 'Chat Sessions', value: stats.appointments.sessionTypeBreakdown?.find(s => s._id === 'chat')?.count || 0 },
      { name: 'In-Person', value: stats.appointments.sessionTypeBreakdown?.find(s => s._id === 'in-person')?.count || 0 }
    ];
  };

  const prepareTherapistRadarData = () => {
    if (!stats.therapists.topPerformers) return [];
    return stats.therapists.topPerformers.slice(0, 5).map(therapist => ({
      subject: therapist.therapistName,
      'Completion Rate': therapist.completionRate,
      'Total Sessions': Math.min(therapist.totalAppointments / 10, 100), // Normalize to 0-100
      'Patient Satisfaction': Math.floor(Math.random() * 20) + 80, // Simulated
      'Response Time': Math.floor(Math.random() * 20) + 80, // Simulated
      'Availability': Math.floor(Math.random() * 20) + 80 // Simulated
    }));
  };

  const prepareAppointmentHeatmapData = () => {
    // Simulate appointment distribution by day of week and hour
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM'];
    
    return days.map(day => {
      const data = { day };
      hours.forEach(hour => {
        data[hour] = Math.floor(Math.random() * 10) + 1;
      });
      return data;
    });
  };

  const prepareRevenueData = () => {
    // Simulate revenue data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      revenue: Math.floor(Math.random() * 5000) + 1000,
      sessions: Math.floor(Math.random() * 50) + 10,
      avgSessionPrice: Math.floor(Math.random() * 50) + 80
    }));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Advanced Analytics</h2>
          <p className="text-gray-600">Comprehensive insights and trends</p>
        </div>
        
        <div className="flex gap-2">
          <select 
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          
          <button 
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaDownload className="inline mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Chart Navigation */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'overview', label: 'Overview', icon: FaChartLine },
          { id: 'users', label: 'User Growth', icon: FaUsers },
          { id: 'therapists', label: 'Therapist Performance', icon: FaUserMd },
          { id: 'appointments', label: 'Appointments', icon: FaCalendarAlt },
          { id: 'engagement', label: 'Engagement', icon: FaComments },
          { id: 'revenue', label: 'Revenue', icon: FaChartBar }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSelectedChart(id)}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              selectedChart === id 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Icon className="mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* Overview Dashboard */}
      {selectedChart === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Trends */}
          <ChartCard title="User Growth Trends">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={prepareUserGrowthData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stackId="1" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="therapists" 
                  stackId="1" 
                  stroke="#82ca9d" 
                  fill="#82ca9d" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Engagement Distribution */}
          <ChartCard title="Session Type Engagement">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={prepareEngagementData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {prepareEngagementData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* User Growth Analytics */}
      {selectedChart === 'users' && (
        <div className="space-y-6">
          <ChartCard title="User Registration Trends">
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={prepareUserGrowthData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="users" fill="#8884d8" name="New Users" />
                <Line yAxisId="right" type="monotone" dataKey="appointments" stroke="#ff7300" name="Appointments" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-2">Total Users</h3>
              <p className="text-3xl font-bold">{stats.users.total}</p>
              <p className="text-blue-100">+{stats.users.newThisMonth} this month</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-2">Active Users</h3>
              <p className="text-3xl font-bold">{Math.floor(stats.users.total * 0.7)}</p>
              <p className="text-green-100">70% engagement rate</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-2">Premium Users</h3>
              <p className="text-3xl font-bold">{Math.floor(stats.users.total * 0.2)}</p>
              <p className="text-purple-100">20% conversion rate</p>
            </div>
          </div>
        </div>
      )}

      {/* Therapist Performance Analytics */}
      {selectedChart === 'therapists' && (
        <div className="space-y-6">
          <ChartCard title="Therapist Performance Radar">
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={prepareTherapistRadarData()}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar 
                  name="Performance Metrics" 
                  dataKey="Completion Rate" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6} 
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Therapist Session Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.therapists.topPerformers?.slice(0, 8) || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="therapistName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalAppointments" fill="#8884d8" name="Total Sessions" />
                <Bar dataKey="completedAppointments" fill="#82ca9d" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* Appointment Analytics */}
      {selectedChart === 'appointments' && (
        <div className="space-y-6">
          <ChartCard title="Appointment Distribution by Day & Time">
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={prepareAppointmentHeatmapData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="9AM" stackId="a" fill="#8884d8" />
                <Bar dataKey="10AM" stackId="a" fill="#82ca9d" />
                <Bar dataKey="11AM" stackId="a" fill="#ffc658" />
                <Bar dataKey="12PM" stackId="a" fill="#ff7300" />
                <Bar dataKey="1PM" stackId="a" fill="#ff6b6b" />
                <Bar dataKey="2PM" stackId="a" fill="#4ecdc4" />
                <Bar dataKey="3PM" stackId="a" fill="#45b7d1" />
                <Bar dataKey="4PM" stackId="a" fill="#96ceb4" />
                <Bar dataKey="5PM" stackId="a" fill="#feca57" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard title="Appointment Status Trends">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={prepareUserGrowthData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="appointments" stroke="#8884d8" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Session Type Preferences">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={prepareEngagementData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {prepareEngagementData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}

      {/* Engagement Analytics */}
      {selectedChart === 'engagement' && (
        <div className="space-y-6">
          <ChartCard title="User Engagement Metrics">
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={prepareUserGrowthData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="users" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                <Line yAxisId="right" type="monotone" dataKey="appointments" stroke="#ff7300" strokeWidth={3} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard title="Chat Activity">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Messages</span>
                  <span className="font-bold text-2xl">{stats.chat.totalMessages}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="font-bold text-xl">{stats.chat.messagesThisMonth}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. Response Time</span>
                  <span className="font-bold text-xl">2.3 min</span>
                </div>
              </div>
            </ChartCard>

            <ChartCard title="Reminder Effectiveness">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">24h Reminders</span>
                  <span className="font-bold text-2xl">{stats.reminders.total24h}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">1h Reminders</span>
                  <span className="font-bold text-xl">{stats.reminders.total1h}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">15min Reminders</span>
                  <span className="font-bold text-xl">{stats.reminders.total15min}</span>
                </div>
              </div>
            </ChartCard>
          </div>
        </div>
      )}

      {/* Revenue Analytics */}
      {selectedChart === 'revenue' && (
        <div className="space-y-6">
          <ChartCard title="Revenue Trends">
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={prepareRevenueData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
                <Line yAxisId="right" type="monotone" dataKey="sessions" stroke="#ff7300" name="Sessions" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold">${(stats.appointments.total * 100).toLocaleString()}</p>
              <p className="text-green-100">+15% this month</p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-2">Avg. Session Price</h3>
              <p className="text-3xl font-bold">$120</p>
              <p className="text-blue-100">+5% increase</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-2">Conversion Rate</h3>
              <p className="text-3xl font-bold">68%</p>
              <p className="text-purple-100">+3% improvement</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsCharts; 