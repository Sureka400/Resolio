import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Users, 
  Activity, 
  Settings, 
  LogOut, 
  BarChart3,
  FileText,
  Lock,
  LayoutDashboard,
  Database,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { TabNavigation } from './TabNavigation';
import { ChartCard } from './ChartCard';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'analytics', label: 'Platform Analytics', icon: BarChart3 },
    { id: 'content', label: 'Content Oversight', icon: FileText },
    { id: 'health', label: 'System Health', icon: Activity },
    { id: 'reports', label: 'Reports', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Chart Data
  const platformGrowthData = [
    { month: 'Jan', users: 1200 },
    { month: 'Feb', users: 1450 },
    { month: 'Mar', users: 1680 },
    { month: 'Apr', users: 2100 },
    { month: 'May', users: 2450 },
    { month: 'Jun', users: 2847 },
  ];

  const roleActivityData = [
    { role: 'Students', activity: 1856 },
    { role: 'Teachers', activity: 684 },
    { role: 'Admins', activity: 307 },
  ];

  const featureUsageData = [
    { name: 'Assignments', value: 35, color: '#FFD600' },
    { name: 'Live Classes', value: 25, color: '#FFB800' },
    { name: 'AI Assistant', value: 20, color: '#FFA500' },
    { name: 'Analytics', value: 15, color: '#a8a6a1' },
    { name: 'Other', value: 5, color: '#6a6a6a' },
  ];

  const systemMetricsData = [
    { time: '00:00', cpu: 35, memory: 52, storage: 48 },
    { time: '04:00', cpu: 28, memory: 48, storage: 48 },
    { time: '08:00', cpu: 45, memory: 58, storage: 49 },
    { time: '12:00', cpu: 62, memory: 68, storage: 50 },
    { time: '16:00', cpu: 55, memory: 64, storage: 51 },
    { time: '20:00', cpu: 42, memory: 56, storage: 52 },
  ];

  const securityEventsData = [
    { week: 'W1', events: 3 },
    { week: 'W2', events: 1 },
    { week: 'W3', events: 2 },
    { week: 'W4', events: 3 },
  ];

  return (
    <div className="relative min-h-screen px-6 py-8">
      <div className="gradient-overlay" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-10 h-10 text-[#FF3333]" />
              <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#FF3333' }}>
                Admin Portal
              </h1>
            </div>
            <p className="text-[#a8a6a1]">System oversight and management</p>
          </div>

          <button
            onClick={onLogout}
            className="btn-3d-red flex items-center gap-2 px-6 py-3 bg-[#FF3333] text-[#0a0a0a] rounded-xl hover:bg-[#FF5555] transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span style={{ fontWeight: 600 }}>Logout</span>
          </button>
        </motion.div>

        {/* Tab Navigation */}
        <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} accentColor="#FF3333" />

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* System Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  { label: 'Total Users', value: '2,847', icon: Users, color: '#FFD600', status: 'normal' },
                  { label: 'System Health', value: '98%', icon: Activity, color: '#FFD600', status: 'normal' },
                  { label: 'Active Sessions', value: '156', icon: Database, color: '#FFD600', status: 'normal' },
                  { label: 'Security Alerts', value: '3', icon: AlertTriangle, color: '#FF3333', status: 'warning' },
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  const isWarning = stat.status === 'warning';

                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <GlassCard enableParallax={false} className={isWarning ? 'pulse-red' : ''}>
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl ${isWarning ? 'bg-[#FF3333]/10' : 'bg-[#FFD600]/10'}`}>
                            <Icon className="w-6 h-6" style={{ color: stat.color }} />
                          </div>
                          <div>
                            <p className="text-[#a8a6a1] mb-1" style={{ fontSize: '0.875rem' }}>{stat.label}</p>
                            <p style={{ fontSize: '1.75rem', fontWeight: 700, color: stat.color }}>
                              {stat.value}
                            </p>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </div>

              {/* Main Charts */}
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <ChartCard title="Platform Growth" description="User registration over time">
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={platformGrowthData}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FFD600" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#FFD600" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 214, 0, 0.1)" />
                      <XAxis dataKey="month" stroke="#a8a6a1" />
                      <YAxis stroke="#a8a6a1" />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(20, 20, 20, 0.95)',
                          border: '1px solid rgba(255, 214, 0, 0.2)',
                          borderRadius: '12px',
                          color: '#e8e6e1',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="users"
                        stroke="#FFD600"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorUsers)"
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Role-wise Activity" description="Platform engagement by user type">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={roleActivityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 214, 0, 0.1)" />
                      <XAxis dataKey="role" stroke="#a8a6a1" />
                      <YAxis stroke="#a8a6a1" />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(20, 20, 20, 0.95)',
                          border: '1px solid rgba(255, 214, 0, 0.2)',
                          borderRadius: '12px',
                          color: '#e8e6e1',
                        }}
                      />
                      <Bar
                        dataKey="activity"
                        fill="#FFD600"
                        radius={[8, 8, 0, 0]}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              {/* Recent Activity */}
              <ChartCard title="Recent System Events">
                <div className="space-y-3">
                  {[
                    { event: 'New user registration spike detected', time: '5 minutes ago', status: 'info' },
                    { event: 'System backup completed successfully', time: '1 hour ago', status: 'success' },
                    { event: 'Database optimization recommended', time: '3 hours ago', status: 'warning' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 bg-[#1a1a1a] rounded-xl">
                      {item.status === 'success' && <CheckCircle className="w-5 h-5 text-[#FFD600] flex-shrink-0 mt-0.5" />}
                      {item.status === 'warning' && <AlertTriangle className="w-5 h-5 text-[#FF3333] flex-shrink-0 mt-0.5" />}
                      {item.status === 'info' && <Activity className="w-5 h-5 text-[#FFD600] flex-shrink-0 mt-0.5" />}
                      <div className="flex-1">
                        <p className="text-[#e8e6e1] mb-1">{item.event}</p>
                        <p className="text-[#a8a6a1]" style={{ fontSize: '0.875rem' }}>{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <ChartCard title="Feature Usage Distribution" description="Most used platform features">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={featureUsageData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        animationDuration={1500}
                      >
                        {featureUsageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(20, 20, 20, 0.95)',
                          border: '1px solid rgba(255, 214, 0, 0.2)',
                          borderRadius: '12px',
                          color: '#e8e6e1',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Security Events Timeline" description="Tracked security incidents">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={securityEventsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 51, 51, 0.1)" />
                      <XAxis dataKey="week" stroke="#a8a6a1" />
                      <YAxis stroke="#a8a6a1" />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(20, 20, 20, 0.95)',
                          border: '1px solid rgba(255, 51, 51, 0.2)',
                          borderRadius: '12px',
                          color: '#e8e6e1',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="events"
                        stroke="#FF3333"
                        strokeWidth={3}
                        dot={{ fill: '#FF3333', r: 6 }}
                        animationDuration={1500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              <ChartCard title="Export Analytics Reports">
                <div className="grid md:grid-cols-4 gap-4">
                  {['User Growth Report', 'Engagement Analytics', 'System Performance', 'Security Audit'].map((report, idx) => (
                    <button
                      key={idx}
                      className="btn-3d p-4 bg-[#1a1a1a] text-[#e8e6e1] rounded-xl hover:bg-[#2a2a2a] transition-colors text-center"
                    >
                      <FileText className="w-6 h-6 text-[#FFD600] mx-auto mb-2" />
                      <span style={{ fontSize: '0.875rem' }}>{report}</span>
                    </button>
                  ))}
                </div>
              </ChartCard>
            </motion.div>
          )}

          {activeTab === 'health' && (
            <motion.div
              key="health"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <ChartCard title="System Metrics (24h)" description="Real-time resource monitoring">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={systemMetricsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 214, 0, 0.1)" />
                    <XAxis dataKey="time" stroke="#a8a6a1" />
                    <YAxis stroke="#a8a6a1" />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(20, 20, 20, 0.95)',
                        border: '1px solid rgba(255, 214, 0, 0.2)',
                        borderRadius: '12px',
                        color: '#e8e6e1',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="cpu"
                      stroke="#FFD600"
                      strokeWidth={2}
                      dot={false}
                      animationDuration={1500}
                    />
                    <Line
                      type="monotone"
                      dataKey="memory"
                      stroke="#FFB800"
                      strokeWidth={2}
                      dot={false}
                      animationDuration={1500}
                    />
                    <Line
                      type="monotone"
                      dataKey="storage"
                      stroke="#FFA500"
                      strokeWidth={2}
                      dot={false}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <div className="grid md:grid-cols-3 gap-6 mt-8">
                {[
                  { label: 'CPU Usage', value: '42%', status: 'normal' },
                  { label: 'Memory', value: '68%', status: 'normal' },
                  { label: 'Storage', value: '54%', status: 'normal' },
                ].map((metric, idx) => (
                  <GlassCard key={idx} enableParallax={false}>
                    <div className="text-center">
                      <p className="text-[#a8a6a1] mb-2">{metric.label}</p>
                      <p style={{ fontSize: '2.5rem', fontWeight: 700, color: '#FFD600' }}>
                        {metric.value}
                      </p>
                      <div className="mt-4 h-2 bg-[#0a0a0a] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: metric.value }}
                          transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                          className="h-full bg-gradient-to-r from-[#FFD600] to-[#FFB800] rounded-full"
                        />
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </motion.div>
          )}

          {(activeTab === 'users' || activeTab === 'content' || activeTab === 'reports' || activeTab === 'settings') && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <GlassCard>
                <div className="text-center py-12">
                  <h3 className="mb-2" style={{ fontSize: '1.5rem', fontWeight: 600, color: '#e8e6e1' }}>
                    {tabs.find(t => t.id === activeTab)?.label}
                  </h3>
                  <p className="text-[#a8a6a1]">Content for this tab is being developed</p>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
