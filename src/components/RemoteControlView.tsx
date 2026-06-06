import React, { useState } from 'react';
import { 
  Settings, Zap, ZapOff, Volume2, VolumeX, Mic, MicOff, 
  Phone, PhoneOff, RefreshCw, Monitor, CircleDot
} from 'lucide-react';
import { mockDevices } from '../data/mockData';
import type { Device } from '../types';

const RemoteControlView: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>(mockDevices);
  const [gateStates, setGateStates] = useState<Record<string, boolean>>({
    '5': false, '6': false, '7': false, '8': false
  });
  const [activeIntercom, setActiveIntercom] = useState<string | null>(null);
  const [intercomCall, setIntercomCall] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);

  const getStatusColor = (status: Device['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
    }
  };

  const getStatusText = (status: Device['status']) => {
    switch (status) {
      case 'online': return '在线';
      case 'warning': return '警告';
      case 'offline': return '离线';
    }
  };

  const getDeviceIcon = (type: Device['type']) => {
    switch (type) {
      case 'camera': return <Monitor size={20} />;
      case 'gate': return <Zap size={20} />;
      case 'display': return <Monitor size={20} />;
      case 'reader': return <CircleDot size={20} />;
      case 'intercom': return <Phone size={20} />;
    }
  };

  const getDeviceTypeName = (type: Device['type']) => {
    switch (type) {
      case 'camera': return '摄像机';
      case 'gate': return '道闸';
      case 'display': return '显示屏';
      case 'reader': return '读卡器';
      case 'intercom': return '对讲设备';
    }
  };

  const toggleGate = (deviceId: string) => {
    if (devices.find(d => d.id === deviceId)?.status === 'offline') return;
    setGateStates(prev => ({ ...prev, [deviceId]: !prev[deviceId] }));
  };

  const startIntercomCall = (deviceId: string) => {
    setIntercomCall(deviceId);
    setActiveIntercom(deviceId);
  };

  const endIntercomCall = () => {
    setIntercomCall(null);
    setActiveIntercom(null);
  };

  const refreshDevice = (deviceId: string) => {
    setDevices(prev => prev.map(d => 
      d.id === deviceId ? { ...d, lastHeartbeat: new Date() } : d
    ));
  };

  const gates = devices.filter(d => d.type === 'gate');
  const intercoms = devices.filter(d => d.type === 'intercom');
  const cameras = devices.filter(d => d.type === 'camera');
  const others = devices.filter(d => !['gate', 'intercom', 'camera'].includes(d.type));

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Settings size={20} className="text-blue-400" />
          远程控制
        </h2>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-400">在线设备:</span>
          <span className="text-green-400 font-medium">
            {devices.filter(d => d.status === 'online').length}/{devices.length}
          </span>
        </div>
      </div>

      {/* 对讲通话面板 */}
      {intercomCall && (
        <div className="px-4 py-3 bg-green-500/10 border-b border-green-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
                <Phone size={20} />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full pulse-ring"></span>
            </div>
            <div>
              <p className="font-medium text-green-400">通话中</p>
              <p className="text-sm text-slate-400">
                {devices.find(d => d.id === intercomCall)?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-full ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'}`}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <button
                onClick={() => setIsMicMuted(!isMicMuted)}
                className={`p-2 rounded-full ${isMicMuted ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'}`}
              >
                {isMicMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            </div>
            <div className="w-px h-8 bg-slate-600"></div>
            <div className="text-sm font-mono text-slate-400">
              00:{String(Math.floor(Math.random() * 60)).padStart(2, '0')}
            </div>
            <button
              onClick={endIntercomCall}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg flex items-center gap-2 font-medium"
            >
              <PhoneOff size={18} />
              挂断
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto p-4">
        {/* 道闸控制 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
            <Zap size={16} />
            道闸控制
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {gates.map(gate => (
              <div 
                key={gate.id}
                className={`bg-slate-800 rounded-xl p-4 border ${
                  gate.status === 'offline' 
                    ? 'border-slate-700 opacity-60' 
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(gate.status)}`}></span>
                    <span className="font-medium">{gate.name}</span>
                  </div>
                  <button
                    onClick={() => refreshDevice(gate.id)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded"
                    title="刷新状态"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
                <div className="text-sm text-slate-400 mb-4">{gate.location}</div>
                <div className="flex items-center justify-between">
                  <div className={`text-sm ${gateStates[gate.id] ? 'text-green-400' : 'text-slate-400'}`}>
                    {gateStates[gate.id] ? '已开启' : '已关闭'}
                  </div>
                  <button
                    onClick={() => toggleGate(gate.id)}
                    disabled={gate.status === 'offline'}
                    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                      gate.status === 'offline'
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : gateStates[gate.id]
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    }`}
                  >
                    {gateStates[gate.id] ? <ZapOff size={16} /> : <Zap size={16} />}
                    {gateStates[gate.id] ? '关闸' : '开闸'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 语音对讲 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
            <Phone size={16} />
            语音对讲
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {intercoms.map(intercom => (
              <div 
                key={intercom.id}
                className={`bg-slate-800 rounded-xl p-4 border ${
                  activeIntercom === intercom.id 
                    ? 'border-green-500 bg-green-500/5' 
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activeIntercom === intercom.id 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-slate-700 text-slate-400'
                    }`}>
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="font-medium">{intercom.name}</p>
                      <p className="text-xs text-slate-400">{intercom.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(intercom.status)}`}></span>
                    <span className="text-xs text-slate-400">{getStatusText(intercom.status)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {activeIntercom !== intercom.id ? (
                    <button
                      onClick={() => startIntercomCall(intercom.id)}
                      disabled={intercom.status === 'offline'}
                      className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
                        intercom.status === 'offline'
                          ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      <Phone size={16} />
                      呼叫
                    </button>
                  ) : (
                    <button
                      onClick={endIntercomCall}
                      className="flex-1 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium flex items-center justify-center gap-2"
                    >
                      <PhoneOff size={16} />
                      挂断
                    </button>
                  )}
                  <button
                    onClick={() => refreshDevice(intercom.id)}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
                    title="刷新状态"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 其他设备状态 */}
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
            <Monitor size={16} />
            设备状态
          </h3>
          <div className="bg-slate-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-700/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">设备名称</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">类型</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">位置</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">最后心跳</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {[...cameras, ...others].map(device => (
                  <tr key={device.id} className="hover:bg-slate-700/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{getDeviceIcon(device.type)}</span>
                        <span className="font-medium">{device.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">{getDeviceTypeName(device.type)}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{device.location}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs ${
                        device.status === 'online' ? 'bg-green-500/10 text-green-400' :
                        device.status === 'warning' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(device.status)}`}></span>
                        {getStatusText(device.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400 font-mono">
                      {device.lastHeartbeat.toLocaleTimeString('zh-CN')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => refreshDevice(device.id)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded"
                        title="刷新状态"
                      >
                        <RefreshCw size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoteControlView;
