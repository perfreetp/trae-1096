import React, { useState } from 'react';
import {
  Settings, Zap, ZapOff, Volume2, Mic, MicOff,
  Phone, PhoneOff, RefreshCw, Monitor, CircleDot, Check
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { formatDateTime } from '../utils/helpers';
import type { Device } from '../types';

const RemoteControlView: React.FC = () => {
  const { state, addOperationLog } = useApp();
  const [gateStates, setGateStates] = useState<Record<string, boolean>>({
    'cam001': false,
    'cam002': false,
    'cam003': false,
    'cam004': false
  });
  const [intercomStates, setIntercomStates] = useState<Record<string, { calling: boolean; connected: boolean; muted: boolean }>>({
    'intercom001': { calling: false, connected: false, muted: false },
    'intercom002': { calling: false, connected: false, muted: false }
  });
  const [showSuccessTip, setShowSuccessTip] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const showTip = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessTip(true);
    setTimeout(() => setShowSuccessTip(false), 1500);
  };

  const handleGateControl = (device: Device, action: 'open' | 'close') => {
    const newState = action === 'open';
    setGateStates(prev => ({ ...prev, [device.id]: newState }));

    addOperationLog(
      '道闸控制',
      `${action === 'open' ? '开启' : '关闭'}道闸 - ${device.name}`,
      { deviceId: device.id }
    );

    showTip(`${device.name} 已${action === 'open' ? '开启' : '关闭'}`);
  };

  const handleIntercomCall = (device: Device) => {
    setIntercomStates(prev => ({
      ...prev,
      [device.id]: { ...prev[device.id], calling: true }
    }));

    addOperationLog(
      '语音对讲',
      `发起呼叫 - ${device.name}`,
      { deviceId: device.id }
    );

    setTimeout(() => {
      setIntercomStates(prev => ({
        ...prev,
        [device.id]: { ...prev[device.id], calling: false, connected: true }
      }));
      showTip(`${device.name} 已接通`);
    }, 2000);
  };

  const handleIntercomHangup = (device: Device) => {
    setIntercomStates(prev => ({
      ...prev,
      [device.id]: { calling: false, connected: false, muted: false }
    }));

    addOperationLog(
      '语音对讲',
      `挂断通话 - ${device.name}`,
      { deviceId: device.id }
    );
  };

  const handleToggleMute = (device: Device) => {
    setIntercomStates(prev => ({
      ...prev,
      [device.id]: { ...prev[device.id], muted: !prev[device.id].muted }
    }));
  };

  const handleRefreshDevices = () => {
    addOperationLog('设备管理', '刷新设备状态');
    showTip('设备状态已刷新');
  };

  const gateDevices = state.devices.filter(d => d.type === 'gate');
  const intercomDevices = state.devices.filter(d => d.type === 'intercom');
  const otherDevices = state.devices.filter(d => !['gate', 'intercom'].includes(d.type));

  return (
    <div className="h-full flex flex-col p-4">
      {showSuccessTip && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
          <Check size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Settings size={20} className="text-blue-400" />
          设备远程控制
        </h2>
        <button
          onClick={handleRefreshDevices}
          className="px-4 h-9 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          <RefreshCw size={16} />
          刷新状态
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden">
        <div className="bg-slate-800 rounded-xl p-4 overflow-y-auto">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Zap size={16} className="text-green-400" />
            道闸控制
          </h3>
          <div className="space-y-3">
            {gateDevices.map(device => {
              const isOpen = gateStates[device.id];
              return (
                <div
                  key={device.id}
                  className={`p-4 rounded-xl border transition-all ${
                    device.status === 'offline'
                      ? 'bg-slate-700/30 border-slate-700 opacity-60'
                      : isOpen
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-slate-700/50 border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isOpen ? 'bg-green-500/20' : 'bg-slate-600'
                      }`}>
                        <Monitor size={18} className={isOpen ? 'text-green-400' : 'text-slate-400'} />
                      </div>
                      <div>
                        <p className="font-medium">{device.name}</p>
                        <p className="text-xs text-slate-400">{device.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        device.status === 'online' ? 'bg-green-500' :
                        device.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></span>
                      <span className="text-xs text-slate-400">
                        {device.status === 'online' ? '在线' : device.status === 'warning' ? '警告' : '离线'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isOpen ? 'text-green-400' : 'text-slate-400'}`}>
                      状态: {isOpen ? '已开启' : '已关闭'}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleGateControl(device, 'open')}
                        disabled={isOpen || device.status === 'offline'}
                        className={`px-4 h-8 rounded-lg text-sm flex items-center gap-1 transition-colors ${
                          isOpen || device.status === 'offline'
                            ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        }`}
                      >
                        <Zap size={14} />
                        开闸
                      </button>
                      <button
                        onClick={() => handleGateControl(device, 'close')}
                        disabled={!isOpen || device.status === 'offline'}
                        className={`px-4 h-8 rounded-lg text-sm flex items-center gap-1 transition-colors ${
                          !isOpen || device.status === 'offline'
                            ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        }`}
                      >
                        <ZapOff size={14} />
                        关闸
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4 overflow-hidden">
          <div className="bg-slate-800 rounded-xl p-4 overflow-y-auto flex-1">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Phone size={16} className="text-purple-400" />
              语音对讲
            </h3>
            <div className="space-y-3">
              {intercomDevices.map(device => {
                const state = intercomStates[device.id] || { calling: false, connected: false, muted: false };
                return (
                  <div
                    key={device.id}
                    className={`p-4 rounded-xl border transition-all ${
                      state.connected
                        ? 'bg-purple-500/10 border-purple-500/30'
                        : state.calling
                          ? 'bg-yellow-500/10 border-yellow-500/30'
                          : 'bg-slate-700/50 border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          state.connected ? 'bg-purple-500/20' :
                          state.calling ? 'bg-yellow-500/20' : 'bg-slate-600'
                        }`}>
                          <Volume2 size={18} className={
                            state.connected ? 'text-purple-400' :
                            state.calling ? 'text-yellow-400' : 'text-slate-400'
                          } />
                        </div>
                        <div>
                          <p className="font-medium">{device.name}</p>
                          <p className="text-xs text-slate-400">{device.location}</p>
                        </div>
                      </div>
                      {state.calling && (
                        <span className="text-xs text-yellow-400 flex items-center gap-1 animate-pulse">
                          <CircleDot size={12} />
                          呼叫中...
                        </span>
                      )}
                      {state.connected && (
                        <span className="text-xs text-green-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                          通话中
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {!state.connected && !state.calling && (
                        <button
                          onClick={() => handleIntercomCall(device)}
                          disabled={device.status === 'offline'}
                          className={`flex-1 h-9 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors ${
                            device.status === 'offline'
                              ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          }`}
                        >
                          <Phone size={16} />
                          呼叫
                        </button>
                      )}
                      {(state.connected || state.calling) && (
                        <>
                          <button
                            onClick={() => handleToggleMute(device)}
                            className={`flex-1 h-9 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors ${
                              state.muted
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                : 'bg-slate-600 hover:bg-slate-500'
                            }`}
                          >
                            {state.muted ? <MicOff size={16} /> : <Mic size={16} />}
                            {state.muted ? '取消静音' : '静音'}
                          </button>
                          <button
                            onClick={() => handleIntercomHangup(device)}
                            className="flex-1 h-9 rounded-lg text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                          >
                            <PhoneOff size={16} />
                            挂断
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 overflow-y-auto">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Monitor size={16} className="text-blue-400" />
              其他设备状态
            </h3>
            <div className="space-y-2">
              {otherDevices.map(device => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${
                      device.status === 'online' ? 'bg-green-500' :
                      device.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></span>
                    <div>
                      <p className="text-sm font-medium">{device.name}</p>
                      <p className="text-xs text-slate-400">{device.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      device.status === 'online' ? 'bg-green-500/20 text-green-400' :
                      device.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {device.status === 'online' ? '在线' : device.status === 'warning' ? '警告' : '离线'}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDateTime(device.lastHeartbeat)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoteControlView;
