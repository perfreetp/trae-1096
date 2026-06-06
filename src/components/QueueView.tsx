import React, { useState } from 'react';
import { List, ArrowUpCircle, ArrowDownCircle, AlertTriangle, Clock, Car } from 'lucide-react';
import { mockLaneQueues } from '../data/mockData';
import type { LaneQueue } from '../types';

const QueueView: React.FC = () => {
  const [selectedLane, setSelectedLane] = useState<string | null>(null);

  const getStatusColor = (status: LaneQueue['status']) => {
    switch (status) {
      case 'normal': return 'text-green-400 bg-green-400/10';
      case 'busy': return 'text-yellow-400 bg-yellow-400/10';
      case 'congested': return 'text-red-400 bg-red-400/10';
    }
  };

  const getStatusText = (status: LaneQueue['status']) => {
    switch (status) {
      case 'normal': return '畅通';
      case 'busy': return '繁忙';
      case 'congested': return '拥堵';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatWaitTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}分${secs}秒` : `${secs}秒`;
  };

  const inLanes = mockLaneQueues.filter(q => q.direction === 'in');
  const outLanes = mockLaneQueues.filter(q => q.direction === 'out');

  const totalWaiting = mockLaneQueues.reduce((sum, q) => sum + q.waitingCount, 0);
  const congestedLanes = mockLaneQueues.filter(q => q.status === 'congested').length;

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <List size={20} className="text-blue-400" />
            出入口队列
          </h2>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">等待车辆:</span>
            <span className="text-yellow-400 font-bold">{totalWaiting}</span>
          </div>
          {congestedLanes > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 text-red-400 rounded-full">
              <AlertTriangle size={14} className="blink" />
              <span>{congestedLanes}个车道拥堵</span>
            </div>
          )}
        </div>
      </div>

      {/* 车道状态概览 */}
      <div className="grid grid-cols-4 gap-3 px-4 py-3 bg-slate-800/50 border-b border-slate-700">
        {mockLaneQueues.map(lane => (
          <div 
            key={lane.id}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              selectedLane === lane.id 
                ? 'bg-blue-500/20 border-blue-500' 
                : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
            }`}
            onClick={() => setSelectedLane(selectedLane === lane.id ? null : lane.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {lane.direction === 'in' ? (
                  <ArrowDownCircle size={16} className="text-green-400" />
                ) : (
                  <ArrowUpCircle size={16} className="text-blue-400" />
                )}
                <span className="text-sm font-medium">{lane.laneName}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(lane.status)}`}>
                {getStatusText(lane.status)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm">
                <Car size={14} className="text-slate-400" />
                <span className="text-white font-medium">{lane.waitingCount}</span>
                <span className="text-slate-400">辆</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Clock size={14} className="text-slate-400" />
                <span className="text-slate-300">{formatWaitTime(lane.averageWaitTime)}</span>
              </div>
            </div>
            {lane.status === 'congested' && (
              <div className="mt-2 p-1.5 bg-red-500/10 rounded text-xs text-red-400 flex items-center gap-1">
                <AlertTriangle size={12} />
                建议增开人工通道
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 详细队列列表 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 入口队列 */}
        <div className="flex-1 flex flex-col border-r border-slate-700">
          <div className="px-4 py-2 bg-green-500/10 border-b border-slate-700 flex items-center gap-2">
            <ArrowDownCircle size={16} className="text-green-400" />
            <span className="font-medium text-green-400">入口队列</span>
            <span className="text-sm text-slate-400">({inLanes.reduce((s, l) => s + l.waitingCount, 0)}辆)</span>
          </div>
          <div className="flex-1 overflow-auto p-3 space-y-3">
            {inLanes.map(lane => (
              <div key={lane.id} className="bg-slate-800 rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-slate-700/50 border-b border-slate-600 flex items-center justify-between">
                  <span className="font-medium">{lane.laneName}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(lane.status)}`}>
                    {getStatusText(lane.status)}
                  </span>
                </div>
                <div className="divide-y divide-slate-700">
                  {lane.vehicles.map((vehicle, idx) => (
                    <div 
                      key={vehicle.id}
                      className="px-3 py-2.5 flex items-center gap-3 hover:bg-slate-700/30 cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                      <img 
                        src={vehicle.captureImage} 
                        alt="抓拍"
                        className="w-16 h-10 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold ${
                            vehicle.hasPlate ? 'text-white' : 'text-yellow-400'
                          }`}>
                            {vehicle.hasPlate ? vehicle.plateNumber : '无牌车'}
                          </span>
                          {!vehicle.hasPlate && (
                            <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                              待确认
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                          <span>{vehicle.brand} {vehicle.color}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400">等待时长</div>
                        <div className="text-sm font-mono text-white">
                          {formatWaitTime(Math.floor((Date.now() - vehicle.entryTime.getTime()) / 1000))}
                        </div>
                      </div>
                    </div>
                  ))}
                  {lane.vehicles.length === 0 && (
                    <div className="px-3 py-8 text-center text-slate-500 text-sm">
                      暂无等待车辆
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 出口队列 */}
        <div className="flex-1 flex flex-col">
          <div className="px-4 py-2 bg-blue-500/10 border-b border-slate-700 flex items-center gap-2">
            <ArrowUpCircle size={16} className="text-blue-400" />
            <span className="font-medium text-blue-400">出口队列</span>
            <span className="text-sm text-slate-400">({outLanes.reduce((s, l) => s + l.waitingCount, 0)}辆)</span>
          </div>
          <div className="flex-1 overflow-auto p-3 space-y-3">
            {outLanes.map(lane => (
              <div key={lane.id} className="bg-slate-800 rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-slate-700/50 border-b border-slate-600 flex items-center justify-between">
                  <span className="font-medium">{lane.laneName}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(lane.status)}`}>
                    {getStatusText(lane.status)}
                  </span>
                </div>
                <div className="divide-y divide-slate-700">
                  {lane.vehicles.map((vehicle, idx) => (
                    <div 
                      key={vehicle.id}
                      className="px-3 py-2.5 flex items-center gap-3 hover:bg-slate-700/30 cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                      <img 
                        src={vehicle.captureImage} 
                        alt="抓拍"
                        className="w-16 h-10 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">
                            {vehicle.plateNumber}
                          </span>
                          <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                            待缴费
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                          <span>入场: {formatTime(vehicle.entryTime)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400">预计费用</div>
                        <div className="text-sm font-mono text-yellow-400 font-bold">
                          ¥{Math.floor(Math.random() * 30 + 5)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {lane.vehicles.length === 0 && (
                    <div className="px-3 py-8 text-center text-slate-500 text-sm">
                      暂无等待车辆
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueView;
