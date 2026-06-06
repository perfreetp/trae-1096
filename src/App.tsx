import React, { useEffect } from 'react';
import { 
  Camera, List, FileCheck, Settings, 
  AlertTriangle, DollarSign, User as UserIcon, FileText,
  Bell, Clock
} from 'lucide-react';
import { AppProvider, useApp } from './store/AppContext';
import MonitorView from './components/MonitorView';
import QueueView from './components/QueueView';
import PlateConfirmView from './components/PlateConfirmView';
import RemoteControlView from './components/RemoteControlView';
import ExceptionView from './components/ExceptionView';
import CashierView from './components/CashierView';
import ShiftHandoverView from './components/ShiftHandoverView';
import LogView from './components/LogView';

const tabs = [
  { id: 'monitor', label: '实时监控', icon: Camera },
  { id: 'queue', label: '出入口队列', icon: List },
  { id: 'plate', label: '车牌确认', icon: FileCheck },
  { id: 'control', label: '远程控制', icon: Settings },
  { id: 'exception', label: '异常处理', icon: AlertTriangle },
  { id: 'cashier', label: '现金收费', icon: DollarSign },
  { id: 'shift', label: '班次交接', icon: UserIcon },
  { id: 'log', label: '日志查询', icon: FileText }
];

declare global {
  interface Window {
    electronAPI?: {
      getAppVersion: () => Promise<string>;
      onLockScreen: (callback: () => void) => (() => void);
      onOpenGate: (callback: () => void) => (() => void);
      onCloseGate: (callback: () => void) => (() => void);
      onCapture: (callback: () => void) => (() => void);
      onShowAbout: (callback: () => void) => (() => void);
    };
  }
}

function AppContent() {
  const { state, dispatch, addOperationLog } = useApp();
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [menuTip, setMenuTip] = React.useState<{ show: boolean; message: string; type: 'success' | 'info' }>({ show: false, message: '', type: 'info' });

  const showMenuTip = (message: string, type: 'success' | 'info' = 'info') => {
    setMenuTip({ show: true, message, type });
    setTimeout(() => setMenuTip(prev => ({ ...prev, show: false })), 2500);
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!window.electronAPI) return;

    const unsubLock = window.electronAPI.onLockScreen(() => {
      addOperationLog('系统操作', '锁定屏幕');
      showMenuTip('屏幕已锁定（模拟）', 'info');
    });

    const unsubOpen = window.electronAPI.onOpenGate(() => {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: 'control' });
      dispatch({ type: 'SET_ALL_GATES', payload: true });
      addOperationLog('道闸控制', '菜单栏操作：开启所有道闸');
      showMenuTip('已开启所有道闸', 'success');
    });

    const unsubClose = window.electronAPI.onCloseGate(() => {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: 'control' });
      dispatch({ type: 'SET_ALL_GATES', payload: false });
      addOperationLog('道闸控制', '菜单栏操作：关闭所有道闸');
      showMenuTip('已关闭所有道闸', 'success');
    });

    const unsubCapture = window.electronAPI.onCapture(() => {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: 'monitor' });
      dispatch({ type: 'TRIGGER_CAPTURE' });
      addOperationLog('抓拍操作', '菜单栏操作：触发抓拍');
      showMenuTip('已触发抓拍', 'success');
    });

    const unsubAbout = window.electronAPI.onShowAbout(() => {
      showMenuTip('停车场中控系统 v1.0.0', 'info');
    });

    return () => {
      unsubLock?.();
      unsubOpen?.();
      unsubClose?.();
      unsubCapture?.();
      unsubAbout?.();
    };
  }, [dispatch, addOperationLog]);

  const pendingPlates = state.vehicles.filter(v => 
    !v.hasPlate || v.plateConfidence < 0.9
  ).length;

  const queueCount = state.vehicles.filter(v => 
    v.direction === 'out' && !v.exitTime
  ).length;

  const getTabBadge = (tabId: string) => {
    switch (tabId) {
      case 'queue': return queueCount > 0 ? String(queueCount) : null;
      case 'plate': return pendingPlates > 0 ? String(pendingPlates) : null;
      case 'exception': return state.unacknowledgedAlerts > 0 ? String(state.unacknowledgedAlerts) : null;
      default: return null;
    }
  };

  const handleTabClick = (tabId: string) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tabId });
  };

  const renderContent = () => {
    switch (state.activeTab) {
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
      {menuTip.show && (
        <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-pulse ${
          menuTip.type === 'success' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
        }`}>
          {menuTip.message}
        </div>
      )}

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
            <button 
              className="relative p-2 hover:bg-slate-700 rounded-lg transition-colors"
              onClick={() => handleTabClick('exception')}
            >
              <Bell size={18} className="text-slate-400" />
              {state.unacknowledgedAlerts > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                  {state.unacknowledgedAlerts}
                </span>
              )}
            </button>
            <div className="h-6 w-px bg-slate-600"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                <UserIcon size={16} className="text-blue-400" />
              </div>
              <div className="text-sm">
                <p className="font-medium">{state.currentOperator.name}</p>
                <p className="text-xs text-slate-400">{state.currentOperator.role}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="h-12 bg-slate-800/80 border-b border-slate-700 flex items-center px-2 flex-shrink-0">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = state.activeTab === tab.id;
          const badge = getTabBadge(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative h-9 px-4 mx-0.5 rounded-lg flex items-center gap-2 text-sm transition-all ${
                isActive 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {badge && (
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>

      <footer className="h-7 bg-slate-800 border-t border-slate-700 flex items-center justify-between px-4 text-xs text-slate-400 flex-shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            数据库连接正常
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            设备在线 {state.devices.filter(d => d.status === 'online').length}/{state.devices.length}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
            车位使用率 86.4%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            班次: {state.currentShift.operatorName}
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
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
