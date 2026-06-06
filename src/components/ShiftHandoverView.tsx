import React, { useState } from 'react';
import { 
  User, Clock, DollarSign, Car, FileCheck, Printer, 
  CheckCircle, RefreshCw, ArrowRight, AlertTriangle
} from 'lucide-react';
import { mockShiftRecord, mockFeeRecords } from '../data/mockData';

const ShiftHandoverView: React.FC = () => {
  const [currentShift, setCurrentShift] = useState(mockShiftRecord);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [handoverPassword, setHandoverPassword] = useState('');
  const [nextOperator] = useState({ id: 'op002', name: '李值班' });

  const paidRecords = mockFeeRecords.filter(f => f.status === 'paid' || f.status === 'free_pass');
  const cashRecords = paidRecords.filter(f => f.paymentMethod === 'cash');
  const wechatRecords = paidRecords.filter(f => f.paymentMethod === 'wechat');
  const alipayRecords = paidRecords.filter(f => f.paymentMethod === 'alipay');
  const freeRecords = paidRecords.filter(f => f.paymentMethod === 'free');

  const totalCash = cashRecords.reduce((sum, r) => sum + r.actualFee, 0);
  const totalWechat = wechatRecords.reduce((sum, r) => sum + r.actualFee, 0);
  const totalAlipay = alipayRecords.reduce((sum, r) => sum + r.actualFee, 0);
  const totalDiscount = mockFeeRecords.reduce((sum, r) => sum + r.discount, 0);

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

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const diff = endTime.getTime() - start.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}小时${minutes}分钟`;
  };

  const handleHandover = () => {
    if (!handoverPassword) return;
    setShowHandoverModal(false);
    setHandoverPassword('');
    setCurrentShift(prev => ({ ...prev, status: 'closed' as const, endTime: new Date() }));
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <User size={20} className="text-blue-400" />
          班次交接
        </h2>
        <div className="flex items-center gap-3">
          <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm flex items-center gap-1.5">
            <Printer size={16} />
            打印交接单
          </button>
          {currentShift.status === 'active' && (
            <button
              onClick={() => setShowHandoverModal(true)}
              className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm flex items-center gap-1.5 font-medium"
            >
              <ArrowRight size={16} />
              交接班
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {/* 当前班次信息 */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <User size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">当前值班员</p>
                <p className="font-medium">{currentShift.operatorName}</p>
              </div>
            </div>
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs ${
              currentShift.status === 'active' 
                ? 'bg-green-500/10 text-green-400' 
                : 'bg-slate-700 text-slate-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                currentShift.status === 'active' ? 'bg-green-500' : 'bg-slate-500'
              }`}></span>
              {currentShift.status === 'active' ? '当班中' : '已交接'}
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-slate-400" />
              <span className="text-xs text-slate-400">上班时间</span>
            </div>
            <p className="font-mono text-lg">{formatTime(currentShift.startTime)}</p>
            {currentShift.endTime && (
              <p className="text-xs text-slate-500 mt-1">
                下班: {formatTime(currentShift.endTime)}
              </p>
            )}
          </div>

          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-slate-400" />
              <span className="text-xs text-slate-400">工作时长</span>
            </div>
            <p className="font-mono text-lg">
              {formatDuration(currentShift.startTime, currentShift.endTime)}
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Car size={16} className="text-slate-400" />
              <span className="text-xs text-slate-400">处理车辆</span>
            </div>
            <p className="text-2xl font-bold">{currentShift.vehicleCount}</p>
            <p className="text-xs text-slate-500">
              其中免费放行 {currentShift.freePassCount} 辆
            </p>
          </div>
        </div>

        {/* 营收统计 */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 mb-4">
          <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
            <h3 className="font-medium flex items-center gap-2">
              <DollarSign size={18} className="text-green-400" />
              营收统计
            </h3>
            <button className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
              <RefreshCw size={12} />
              刷新数据
            </button>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                <p className="text-xs text-slate-400 mb-1">现金收入</p>
                <p className="text-2xl font-bold text-green-400">¥{totalCash.toFixed(2)}</p>
                <p className="text-xs text-slate-500 mt-1">{cashRecords.length} 笔</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                <p className="text-xs text-slate-400 mb-1">微信支付</p>
                <p className="text-2xl font-bold text-blue-400">¥{totalWechat.toFixed(2)}</p>
                <p className="text-xs text-slate-500 mt-1">{wechatRecords.length} 笔</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                <p className="text-xs text-slate-400 mb-1">支付宝</p>
                <p className="text-2xl font-bold text-sky-400">¥{totalAlipay.toFixed(2)}</p>
                <p className="text-xs text-slate-500 mt-1">{alipayRecords.length} 笔</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                <p className="text-xs text-slate-400 mb-1">优惠减免</p>
                <p className="text-2xl font-bold text-yellow-400">¥{totalDiscount.toFixed(2)}</p>
                <p className="text-xs text-slate-500 mt-1">{freeRecords.length} 笔免费</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 flex items-center justify-between border border-blue-500/30">
              <div>
                <p className="text-sm text-slate-400">本班总营收</p>
                <p className="text-3xl font-bold text-white">
                  ¥{(totalCash + totalWechat + totalAlipay).toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">交接班状态</p>
                <p className={`font-medium ${
                  currentShift.status === 'active' ? 'text-green-400' : 'text-slate-400'
                }`}>
                  {currentShift.status === 'active' ? '待交接' : '已完成'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 交接班记录 */}
        <div className="bg-slate-800 rounded-xl border border-slate-700">
          <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
            <h3 className="font-medium flex items-center gap-2">
              <FileCheck size={18} className="text-blue-400" />
              历史交接班记录
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-700/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">班次ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">值班员</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">上班时间</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">下班时间</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">现金收入</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">电子支付</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">总营收</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">车辆数</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">接班员</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                <tr className="hover:bg-slate-700/30">
                  <td className="px-4 py-3 font-mono text-sm">S2024011501</td>
                  <td className="px-4 py-3">张值班</td>
                  <td className="px-4 py-3 font-mono text-sm">01-15 08:00</td>
                  <td className="px-4 py-3 font-mono text-sm">01-15 16:00</td>
                  <td className="px-4 py-3 text-green-400">¥1,280</td>
                  <td className="px-4 py-3 text-blue-400">¥3,560</td>
                  <td className="px-4 py-3 font-medium">¥4,840</td>
                  <td className="px-4 py-3">235</td>
                  <td className="px-4 py-3">李值班</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded text-xs">
                      已完成
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-700/30">
                  <td className="px-4 py-3 font-mono text-sm">S2024011402</td>
                  <td className="px-4 py-3">李值班</td>
                  <td className="px-4 py-3 font-mono text-sm">01-14 16:00</td>
                  <td className="px-4 py-3 font-mono text-sm">01-15 08:00</td>
                  <td className="px-4 py-3 text-green-400">¥980</td>
                  <td className="px-4 py-3 text-blue-400">¥2,140</td>
                  <td className="px-4 py-3 font-medium">¥3,120</td>
                  <td className="px-4 py-3">178</td>
                  <td className="px-4 py-3">王值班</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded text-xs">
                      已完成
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-700/30">
                  <td className="px-4 py-3 font-mono text-sm">S2024011401</td>
                  <td className="px-4 py-3">王值班</td>
                  <td className="px-4 py-3 font-mono text-sm">01-14 08:00</td>
                  <td className="px-4 py-3 font-mono text-sm">01-14 16:00</td>
                  <td className="px-4 py-3 text-green-400">¥1,450</td>
                  <td className="px-4 py-3 text-blue-400">¥4,220</td>
                  <td className="px-4 py-3 font-medium">¥5,670</td>
                  <td className="px-4 py-3">278</td>
                  <td className="px-4 py-3">李值班</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded text-xs">
                      已完成
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 交接班确认弹窗 */}
      {showHandoverModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl w-[500px] shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-700">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <AlertTriangle size={20} className="text-yellow-400" />
                确认交接班
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400">交班人</span>
                  <span className="font-medium">{currentShift.operatorName}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400">接班人</span>
                  <span className="font-medium text-blue-400">{nextOperator.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">本班总营收</span>
                  <span className="text-xl font-bold text-yellow-400">
                    ¥{(totalCash + totalWechat + totalAlipay).toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  请输入交班密码确认
                </label>
                <input
                  type="password"
                  value={handoverPassword}
                  onChange={e => setHandoverPassword(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500"
                  placeholder="请输入密码"
                />
              </div>

              <div className="text-xs text-slate-500">
                <p>注意：交接班后将结束当前班次，所有数据将被归档。</p>
                <p>请确保现金与系统记录一致。</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowHandoverModal(false)}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleHandover}
                disabled={!handoverPassword}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  handoverPassword 
                    ? 'bg-green-500 hover:bg-green-600 font-medium' 
                    : 'bg-slate-600 text-slate-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle size={16} />
                确认交接
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftHandoverView;
