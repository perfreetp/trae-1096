import React, { useState, useMemo } from 'react';
import {
  User, Clock, DollarSign, LogIn, LogOut,
  Check, X, FileText, AlertTriangle, RefreshCw
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { formatDateTime } from '../utils/helpers';
import type { ShiftRecord } from '../types';

const operators = [
  { id: 'op001', name: '张值班', role: '收费员' },
  { id: 'op002', name: '李值班', role: '收费员' },
  { id: 'op003', name: '王班长', role: '班长' }
];

const ShiftHandoverView: React.FC = () => {
  const { state, dispatch, addOperationLog } = useApp();
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [nextOperator, setNextOperator] = useState(operators[1].id);
  const [handoverPassword, setHandoverPassword] = useState('');
  const [handoverRemark, setHandoverRemark] = useState('');
  const [showSuccessTip, setShowSuccessTip] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [handoverHistory, setHandoverHistory] = useState<ShiftRecord[]>([
    {
      id: 'shift001',
      operatorId: 'op003',
      operatorName: '王班长',
      startTime: new Date(Date.now() - 8 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
      cashCollection: 1256,
      electronicCollection: 3680,
      totalCollection: 4936,
      vehicleCount: 168,
      freePassCount: 5,
      status: 'closed'
    },
    {
      id: 'shift002',
      operatorId: 'op002',
      operatorName: '李值班',
      startTime: new Date(Date.now() - 16 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 9 * 60 * 60 * 1000),
      cashCollection: 890,
      electronicCollection: 2450,
      totalCollection: 3340,
      vehicleCount: 124,
      freePassCount: 3,
      status: 'closed'
    }
  ]);

  const shiftStats = useMemo(() => {
    const shift = state.currentShift;
    const now = new Date();
    const startTime = new Date(shift.startTime);
    const durationMs = now.getTime() - startTime.getTime();
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMins = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    return {
      durationText: `${durationHours}小时${durationMins}分钟`,
      cashCollection: shift.cashCollection,
      electronicCollection: shift.electronicCollection,
      totalCollection: shift.totalCollection,
      vehicleCount: shift.vehicleCount,
      freePassCount: shift.freePassCount
    };
  }, [state.currentShift]);

  const showTip = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessTip(true);
    setTimeout(() => setShowSuccessTip(false), 2000);
  };

  const handleHandover = () => {
    if (!handoverPassword) {
      alert('请输入交接班密码');
      return;
    }

    if (handoverPassword !== '123456') {
      alert('密码错误');
      return;
    }

    const endTime = new Date();
    const nextOp = operators.find(o => o.id === nextOperator)!;

    const closedShift: ShiftRecord = {
      ...state.currentShift,
      endTime,
      status: 'closed'
    };

    setHandoverHistory(prev => [closedShift, ...prev]);

    dispatch({
      type: 'COMPLETE_SHIFT',
      payload: {
        endTime,
        nextOperator: {
          id: nextOp.id,
          name: nextOp.name
        }
      }
    });

    addOperationLog(
      '交接班',
      `交班: ${state.currentOperator.name}(${state.currentOperator.role}), 接班: ${nextOp.name}, 本班现金: ¥${shiftStats.cashCollection.toFixed(2)}, 总营收: ¥${shiftStats.totalCollection.toFixed(2)}, 备注: ${handoverRemark || '无'}`
    );

    showTip(`交接班成功！已切换至 ${nextOp.name} 值班`);
    setShowHandoverModal(false);
    setHandoverPassword('');
    setHandoverRemark('');
  };

  return (
    <div className="h-full flex flex-col p-4">
      {showSuccessTip && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
          <Check size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <User size={18} className="text-blue-400" />
              当前班次
            </h3>
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              值班中
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <User size={24} className="text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-lg">{state.currentOperator.name}</p>
                <p className="text-sm text-slate-400">{state.currentOperator.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-700">
              <div>
                <p className="text-xs text-slate-400 mb-1">上班时间</p>
                <p className="font-mono text-sm">{formatDateTime(state.currentShift.startTime)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">已值班</p>
                <p className="font-mono text-sm text-blue-400">{shiftStats.durationText}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-yellow-400" />
            本班营收统计
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-500/10 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">现金收入</p>
              <p className="text-xl font-bold text-green-400">¥{shiftStats.cashCollection.toFixed(2)}</p>
            </div>
            <div className="bg-blue-500/10 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">电子支付</p>
              <p className="text-xl font-bold text-blue-400">¥{shiftStats.electronicCollection.toFixed(2)}</p>
            </div>
            <div className="bg-yellow-500/10 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">总营收</p>
              <p className="text-xl font-bold text-yellow-400">¥{shiftStats.totalCollection.toFixed(2)}</p>
            </div>
            <div className="bg-purple-500/10 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">处理车辆</p>
              <p className="text-xl font-bold text-purple-400">{shiftStats.vehicleCount} 辆</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <AlertTriangle size={14} className="text-orange-400" />
              免费放行: {shiftStats.freePassCount} 次
            </div>
            <button
              onClick={() => setShowHandoverModal(true)}
              className="px-4 h-9 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              <LogOut size={16} />
              交接班
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-slate-800 rounded-xl overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText size={16} className="text-purple-400" />
            历史交接班记录
          </h3>
          <button className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
            <RefreshCw size={14} />
            刷新
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-8 gap-4 px-4 py-2 bg-slate-700/50 text-sm text-slate-400 font-medium">
            <div>班次ID</div>
            <div>值班员</div>
            <div>上班时间</div>
            <div>下班时间</div>
            <div>现金收入</div>
            <div>总营收</div>
            <div>处理车辆</div>
            <div>状态</div>
          </div>

          {handoverHistory.map(shift => (
            <div
              key={shift.id}
              className="grid grid-cols-8 gap-4 px-4 py-3 border-b border-slate-700/50 text-sm hover:bg-slate-700/30 transition-colors items-center"
            >
              <div className="font-mono text-slate-400">{shift.id}</div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <User size={12} className="text-blue-400" />
                </div>
                {shift.operatorName}
              </div>
              <div className="font-mono text-xs text-slate-400">{formatDateTime(shift.startTime)}</div>
              <div className="font-mono text-xs text-slate-400">
                {shift.endTime ? formatDateTime(shift.endTime) : '-'}
              </div>
              <div className="text-green-400 font-mono">¥{shift.cashCollection.toFixed(2)}</div>
              <div className="text-yellow-400 font-mono font-medium">¥{shift.totalCollection.toFixed(2)}</div>
              <div>{shift.vehicleCount} 辆</div>
              <div>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  shift.status === 'closed' 
                    ? 'bg-slate-600 text-slate-300' 
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {shift.status === 'closed' ? '已结算' : '值班中'}
                </span>
              </div>
            </div>
          ))}

          <div className="grid grid-cols-8 gap-4 px-4 py-3 border-b border-slate-700/50 text-sm hover:bg-slate-700/30 transition-colors items-center bg-blue-500/5">
            <div className="font-mono text-blue-400">{state.currentShift.id}</div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                <User size={12} className="text-green-400" />
              </div>
              {state.currentShift.operatorName}
            </div>
            <div className="font-mono text-xs text-slate-400">{formatDateTime(state.currentShift.startTime)}</div>
            <div className="font-mono text-xs text-blue-400 flex items-center gap-1">
              <Clock size={10} />
              进行中
            </div>
            <div className="text-green-400 font-mono">¥{shiftStats.cashCollection.toFixed(2)}</div>
            <div className="text-yellow-400 font-mono font-medium">¥{shiftStats.totalCollection.toFixed(2)}</div>
            <div>{shiftStats.vehicleCount} 辆</div>
            <div>
              <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">
                当前班次
              </span>
            </div>
          </div>
        </div>
      </div>

      {showHandoverModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-[480px] shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <LogIn size={20} className="text-orange-400" />
                交接班确认
              </h3>
              <button
                onClick={() => setShowHandoverModal(false)}
                className="p-1 hover:bg-slate-700 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium mb-3 text-slate-300">交班信息</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">交班人</span>
                  <span className="font-medium">{state.currentOperator.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">岗位</span>
                  <span>{state.currentOperator.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">现金收入</span>
                  <span className="text-green-400 font-mono">¥{shiftStats.cashCollection.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">总营收</span>
                  <span className="text-yellow-400 font-mono">¥{shiftStats.totalCollection.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">处理车辆</span>
                  <span>{shiftStats.vehicleCount} 辆</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">免费放行</span>
                  <span>{shiftStats.freePassCount} 次</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">接班人员</label>
                <select
                  value={nextOperator}
                  onChange={(e) => setNextOperator(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-900 border border-slate-600 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {operators.filter(o => o.id !== state.currentOperator.id).map(op => (
                    <option key={op.id} value={op.id}>{op.name} - {op.role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5">交接班密码 *</label>
                <input
                  type="password"
                  value={handoverPassword}
                  onChange={(e) => setHandoverPassword(e.target.value)}
                  placeholder="请输入交接班密码"
                  className="w-full h-10 px-3 bg-slate-900 border border-slate-600 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
                <p className="text-xs text-slate-500 mt-1">默认密码: 123456</p>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5">交接备注</label>
                <textarea
                  value={handoverRemark}
                  onChange={(e) => setHandoverRemark(e.target.value)}
                  placeholder="请输入交接事项或注意事项..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowHandoverModal(false)}
                className="flex-1 h-11 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleHandover}
                className="flex-1 h-11 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors font-medium"
              >
                确认交接班
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftHandoverView;
