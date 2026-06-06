import React, { useState } from 'react';
import { 
  Search, Filter, Calendar, Clock, User, Car, 
  FileText, Play, XCircle, Download, Eye, Check
} from 'lucide-react';
import { mockOperationLogs, mockVehicles } from '../data/mockData';

const LogView: React.FC = () => {
  const [logs] = useState(mockOperationLogs);
  const [searchPlate, setSearchPlate] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [showPlaybackModal, setShowPlaybackModal] = useState(false);
  const [playbackPlate, setPlaybackPlate] = useState('');

  const filteredLogs = logs.filter(log => {
    if (searchPlate && !log.plateNumber?.includes(searchPlate.toUpperCase())) return false;
    if (selectedAction !== 'all' && log.action !== selectedAction) return false;
    return true;
  });

  const actionTypes = [
    { value: 'all', label: '全部操作' },
    { value: '道闸控制', label: '道闸控制' },
    { value: '车牌修正', label: '车牌修正' },
    { value: '免费放行', label: '免费放行' },
    { value: '现金收款', label: '现金收款' },
    { value: '语音对讲', label: '语音对讲' },
    { value: '无牌车建档', label: '无牌车建档' },
    { value: '告警确认', label: '告警确认' },
    { value: '登录系统', label: '登录系统' }
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case '道闸控制': return 'bg-blue-500/10 text-blue-400';
      case '车牌修正': return 'bg-yellow-500/10 text-yellow-400';
      case '免费放行': return 'bg-green-500/10 text-green-400';
      case '现金收款': return 'bg-emerald-500/10 text-emerald-400';
      case '语音对讲': return 'bg-purple-500/10 text-purple-400';
      case '无牌车建档': return 'bg-orange-500/10 text-orange-400';
      case '告警确认': return 'bg-red-500/10 text-red-400';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  };

  const handlePlayback = (plateNumber: string) => {
    setPlaybackPlate(plateNumber);
    setShowPlaybackModal(true);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText size={20} className="text-blue-400" />
          日志查询
        </h2>
        <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm flex items-center gap-1.5">
          <Download size={16} />
          导出日志
        </button>
      </div>

      {/* 搜索筛选栏 */}
      <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              value={searchPlate}
              onChange={e => setSearchPlate(e.target.value)}
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              placeholder="输入车牌号搜索..."
            />
          </div>

          <select
            value={selectedAction}
            onChange={e => setSelectedAction(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          >
            {actionTypes.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-400" />
            <input
              type="date"
              value={dateRange.start}
              onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            <span className="text-slate-400">至</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm flex items-center gap-1.5">
            <Filter size={16} />
            筛选
          </button>
        </div>
      </div>

      {/* 车牌回放快捷入口 */}
      <div className="px-4 py-3 bg-slate-800/30 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">按车牌回放:</span>
          <input
            type="text"
            value={playbackPlate}
            onChange={e => setPlaybackPlate(e.target.value.toUpperCase())}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-blue-500"
            placeholder="输入车牌号"
            style={{ width: '150px' }}
          />
          <button
            onClick={() => playbackPlate && setShowPlaybackModal(true)}
            disabled={!playbackPlate}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 ${
              playbackPlate 
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Play size={14} />
            回放通行过程
          </button>
        </div>
      </div>

      {/* 日志列表 */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-slate-800 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">时间</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">操作类型</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">操作员</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">车牌号</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">操作详情</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">IP地址</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filteredLogs.map(log => (
              <tr 
                key={log.id} 
                className={`hover:bg-slate-800/50 cursor-pointer ${
                  selectedLog?.id === log.id ? 'bg-blue-500/10' : ''
                }`}
                onClick={() => setSelectedLog(log)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-slate-500" />
                    <span className="font-mono text-sm">{formatTime(log.timestamp)}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${getActionColor(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center">
                      <User size={12} className="text-slate-400" />
                    </div>
                    <span className="text-sm">{log.operatorName}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {log.plateNumber ? (
                    <span className="font-mono text-sm">{log.plateNumber}</span>
                  ) : (
                    <span className="text-slate-500 text-sm">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-slate-300 max-w-md truncate">
                  {log.detail}
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-slate-500">{log.ipAddress}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  {log.plateNumber && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePlayback(log.plateNumber!); }}
                      className="px-2 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded text-xs flex items-center gap-1 ml-auto"
                    >
                      <Play size={12} />
                      回放
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLogs.length === 0 && (
          <div className="py-16 text-center text-slate-500">
            <FileText size={48} className="mx-auto mb-3 opacity-30" />
            <p>暂无符合条件的日志记录</p>
          </div>
        )}
      </div>

      {/* 日志详情面板 */}
      {selectedLog && (
        <div className="border-t border-slate-700 bg-slate-800/50 px-4 py-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-2 py-1 rounded text-xs ${getActionColor(selectedLog.action)}`}>
                  {selectedLog.action}
                </span>
                <span className="text-sm text-slate-400">
                  {formatTime(selectedLog.timestamp)}
                </span>
              </div>
              <p className="text-sm">
                <span className="text-slate-400">操作员:</span> {selectedLog.operatorName}
                {selectedLog.plateNumber && (
                  <>
                    <span className="mx-2 text-slate-600">|</span>
                    <span className="text-slate-400">车牌号:</span> 
                    <span className="font-mono ml-1">{selectedLog.plateNumber}</span>
                  </>
                )}
              </p>
              <p className="text-sm text-slate-300 mt-1">{selectedLog.detail}</p>
            </div>
            <button
              onClick={() => setSelectedLog(null)}
              className="text-slate-400 hover:text-white"
            >
              <XCircle size={18} />
            </button>
          </div>
        </div>
      )}

      {/* 通行过程回放弹窗 */}
      {showPlaybackModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl w-[700px] shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Play size={20} className="text-green-400" />
                通行过程回放 - <span className="font-mono">{playbackPlate}</span>
              </h3>
              <button 
                onClick={() => setShowPlaybackModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-6">
              {/* 时间轴 */}
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-700"></div>
                
                <div className="space-y-4">
                  {[
                    { time: '入场检测', desc: '车辆到达入口线圈', type: 'entrance' },
                    { time: '车牌识别', desc: '识别车牌号: ' + playbackPlate, type: 'recognize' },
                    { time: '抓拍图片', desc: '拍摄车辆全景和车牌特写', type: 'capture' },
                    { time: '道闸开启', desc: '系统自动开闸或值班员手动开闸', type: 'gate_open' },
                    { time: '入场完成', desc: '车辆通过入口地感线圈', type: 'enter_complete' },
                    { time: '出场检测', desc: '车辆到达出口线圈', type: 'exit_detect' },
                    { time: '费用计算', desc: '停车时长3小时25分，费用11元', type: 'fee_calc' },
                    { time: '支付完成', desc: '微信支付成功', type: 'payment' },
                    { time: '道闸开启', desc: '系统自动开闸放行', type: 'gate_open2' },
                    { time: '出场完成', desc: '车辆通过出口地感线圈，道闸关闭', type: 'exit_complete' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                        idx < 5 ? 'bg-green-500/20 text-green-400' : 
                        idx < 9 ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {idx < 5 ? <Car size={14} /> : idx < 9 ? <Eye size={14} /> : <Check size={14} />}
                      </div>
                      <div className="flex-1 bg-slate-700/50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{item.time}</span>
                          <span className="text-xs text-slate-500 font-mono">
                            {String(Math.floor(Math.random() * 24)).padStart(2, '0')}:{String(Math.floor(Math.random() * 60)).padStart(2, '0')}:{String(Math.floor(Math.random() * 60)).padStart(2, '0')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{item.desc}</p>
                        {item.type === 'capture' && (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <img 
                              src={mockVehicles[0]?.captureImage} 
                              alt="抓拍"
                              className="w-full h-20 object-cover rounded"
                            />
                            <img 
                              src={mockVehicles[1]?.captureImage} 
                              alt="抓拍"
                              className="w-full h-20 object-cover rounded"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowPlaybackModal(false)}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogView;
