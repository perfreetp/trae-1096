import React, { useState } from 'react';
import { 
  Camera, List, FileCheck, Settings, 
  AlertTriangle, DollarSign, User, FileText,
  Bell, User as UserIcon, Clock
} from 'lucide-react';
import MonitorView from './components/MonitorView';
import QueueView from './components/QueueView';
import PlateConfirmView from './components/PlateConfirmView';
import RemoteControlView from './components/RemoteControlView';
import ExceptionView from './components/ExceptionView';
import CashierView from './components/CashierView';
import ShiftHandoverView from './components/ShiftHandoverView';
import LogView from './components/LogView';

const tabs = [
  { id: 'monitor', label: '实时监控', icon: Camera, badge: null },
  { id: 'queue', label: '出入口队列', icon: List, badge: '13' },
  { id: 'plate', label: '车牌确认', icon: FileCheck, badge: '5' },
  { id: 'control', label: '远程控制', icon: Settings, badge: null },
  { id: 'exception', label: '异常处理', icon: AlertTriangle, badge: '3' },
  { id: 'cashier', label: '现金收费', icon: DollarSign, badge: null },
  { id: 'shift', label: '班次交接', icon: User, badge: null },
  { id: 'log', label: '日志查询', icon: FileText, badge: null }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('monitor');
  const [currentTime, setCurrentTime] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'monitor': return <MonitorView />;
      case 'queue': return <QueueView />;
      case 'plate': return <PlateConfirmView />;
      case 'control': return <RemoteControlView />;
      case 'exception': return <ExceptionView />;
      case 'cashier': return <CashierView />;
      case 'shift': return <ShiftHandoverView />;
      case 'log': return <LogView />;
      default: return <MonitorView />;
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-900 text-slate-200 overflow-hidden">
      {/* 顶部标题栏 */}
      <header className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Camera size={18} className="text-white" />
            </div>
            <h1 className="text-lg font-bold">停车场中控系统</h1>
          </div>
          <div className="h-6 w-px bg-slate-600"></div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
              系统运行正常
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock size={14} />
              <span className="font-mono">
                {currentTime.toLocaleString('zh-CN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <Bell size={18} className="text-slate-400" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                3
              </span>
            </button>
            <div className="h-6 w-px bg-slate-600"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                <UserIcon size={16} className="text-blue-400" />
              </div>
              <div className="text-sm">
                <p className="font-medium">张值班</p>
                <p className="text-xs text-slate-400">收费岗亭</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab导航栏 */}
      <nav className="h-12 bg-slate-800/80 border-b border-slate-700 flex items-center px-2 flex-shrink-0">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative h-9 px-4 mx-0.5 rounded-lg flex items-center gap-2 text-sm transition-all ${
                isActive 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 主内容区域 */}
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>

      {/* 底部状态栏 */}
      <footer className="h-7 bg-slate-800 border-t border-slate-700 flex items-center justify-between px-4 text-xs text-slate-400 flex-shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            数据库连接正常
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            设备在线 10/12
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
            车位使用率 86.4%
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>版本 v1.0.0</span>
          <span>|</span>
          <span>© 2024 智能停车场管理系统</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
