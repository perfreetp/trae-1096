import React, { useState } from 'react';
import { 
  DollarSign, Clock, Car, CreditCard, CheckCircle, XCircle,
  Calculator, FileText, User, Receipt, Tag, ArrowRight
} from 'lucide-react';
import { mockFeeRecords, mockVehicles } from '../data/mockData';

const CashierView: React.FC = () => {
  const [pendingFees, setPendingFees] = useState(mockFeeRecords.filter(f => f.status === 'pending'));
  const [selectedFee, setSelectedFee] = useState<any>(pendingFees[0] || null);
  const [cashReceived, setCashReceived] = useState('');
  const [showFreePassModal, setShowFreePassModal] = useState(false);
  const [freePassReason, setFreePassReason] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  const calculateChange = () => {
    if (!selectedFee || !cashReceived) return 0;
    const received = parseFloat(cashReceived) || 0;
    return Math.max(0, received - selectedFee.actualFee);
  };

  const handleCashPayment = () => {
    if (!selectedFee || !cashReceived) return;
    const received = parseFloat(cashReceived) || 0;
    if (received < selectedFee.actualFee) return;

    setPendingFees(prev => prev.filter(f => f.id !== selectedFee.id));
    setPaymentSuccess(selectedFee.plateNumber);
    setTimeout(() => {
      setPaymentSuccess(null);
      setSelectedFee(pendingFees[1] || null);
      setCashReceived('');
    }, 2000);
  };

  const handleFreePass = () => {
    if (!selectedFee || !freePassReason) return;
    
    setPendingFees(prev => prev.filter(f => f.id !== selectedFee.id));
    setPaymentSuccess(selectedFee.plateNumber + ' (免费放行)');
    setTimeout(() => {
      setPaymentSuccess(null);
      setSelectedFee(pendingFees[1] || null);
    }, 2000);
    setShowFreePassModal(false);
    setFreePassReason('');
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}小时${mins}分钟`;
    }
    return `${mins}分钟`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-full flex bg-slate-900">
      {/* 左侧待缴费列表 */}
      <div className="w-80 flex flex-col border-r border-slate-700">
        <div className="px-4 py-3 bg-slate-800 border-b border-slate-700">
          <h2 className="font-semibold flex items-center gap-2">
            <DollarSign size={18} className="text-green-400" />
            待缴费列表
            <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full">
              {pendingFees.length}
            </span>
          </h2>
        </div>
        <div className="flex-1 overflow-auto">
          {pendingFees.map(fee => (
            <div 
              key={fee.id}
              className={`p-3 border-b border-slate-700 cursor-pointer transition-colors ${
                selectedFee?.id === fee.id 
                  ? 'bg-blue-500/20 border-l-2 border-l-blue-500' 
                  : 'hover:bg-slate-800'
              }`}
              onClick={() => setSelectedFee(fee)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-white">{fee.plateNumber}</span>
                <span className="text-yellow-400 font-bold">¥{fee.actualFee}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock size={12} />
                <span>停车 {formatDuration(fee.duration)}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                入场: {formatTime(fee.entryTime)}
              </div>
            </div>
          ))}
          {pendingFees.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <CheckCircle size={40} className="mx-auto mb-2 text-green-500" />
              <p>暂无待缴费车辆</p>
            </div>
          )}
        </div>
      </div>

      {/* 中间收费操作区 */}
      <div className="flex-1 flex flex-col">
        {paymentSuccess && (
          <div className="px-4 py-3 bg-green-500/20 border-b border-green-500/30 flex items-center gap-2 text-green-400">
            <CheckCircle size={18} />
            <span className="font-medium">{paymentSuccess} 收费成功，道闸已开启</span>
          </div>
        )}

        {selectedFee ? (
          <>
            {/* 车辆信息 */}
            <div className="px-6 py-4 border-b border-slate-700">
              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Car size={24} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-mono font-bold">{selectedFee.plateNumber}</p>
                      <p className="text-sm text-slate-400">小型汽车</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">入场时间</p>
                    <p className="font-mono">{formatTime(selectedFee.entryTime)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">出场时间</p>
                    <p className="font-mono">{formatTime(selectedFee.exitTime)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">停车时长</p>
                    <p className="font-mono font-medium">{formatDuration(selectedFee.duration)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 费用计算 */}
            <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Calculator size={16} className="text-blue-400" />
                费用明细
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400">基础费用</span>
                    <span>¥{selectedFee.baseFee}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400">时长费用 ({selectedFee.duration}分钟)</span>
                    <span>¥{(selectedFee.totalFee - selectedFee.baseFee).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400">优惠减免</span>
                    <span className="text-green-400">-¥{selectedFee.discount}</span>
                  </div>
                  <div className="border-t border-slate-600 my-2"></div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">应收金额</span>
                    <span className="text-2xl font-bold text-yellow-400">¥{selectedFee.actualFee}</span>
                  </div>
                </div>

                {/* 现金收费操作 */}
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <CreditCard size={16} className="text-green-400" />
                    现金收费
                  </h4>
                  <div className="mb-3">
                    <label className="text-xs text-slate-400 mb-1 block">实收金额</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">¥</span>
                      <input
                        type="number"
                        value={cashReceived}
                        onChange={e => setCashReceived(e.target.value)}
                        className="w-full bg-slate-600 border border-slate-500 rounded-lg pl-8 pr-3 py-2.5 text-lg font-mono focus:outline-none focus:border-blue-500"
                        placeholder="输入收款金额"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="text-xs text-slate-400 mb-1 block">找零金额</label>
                    <div className="bg-slate-600/50 rounded-lg px-3 py-2.5 text-lg font-mono">
                      {calculateChange() > 0 ? (
                        <span className="text-green-400">¥{calculateChange().toFixed(2)}</span>
                      ) : (
                        <span className="text-slate-500">¥0.00</span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[10, 20, 50, 100].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setCashReceived(amount.toString())}
                        className="py-1.5 bg-slate-600 hover:bg-slate-500 rounded text-sm"
                      >
                        ¥{amount}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowFreePassModal(true)}
                      className="flex-1 py-2.5 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded-lg font-medium flex items-center justify-center gap-1.5"
                    >
                      <Tag size={16} />
                      免费放行
                    </button>
                    <button
                      onClick={handleCashPayment}
                      disabled={!cashReceived || parseFloat(cashReceived) < selectedFee.actualFee}
                      className={`flex-1 py-2.5 rounded-lg font-medium flex items-center justify-center gap-1.5 ${
                        !cashReceived || parseFloat(cashReceived) < selectedFee.actualFee
                          ? 'bg-slate-600 text-slate-500 cursor-not-allowed'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      <Receipt size={16} />
                      确认收款
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 车辆抓拍图 */}
            <div className="flex-1 p-6 overflow-auto">
              <h3 className="font-medium mb-3">车辆抓拍</h3>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-slate-800 rounded-lg overflow-hidden">
                    <img 
                      src={mockVehicles[0]?.captureImage} 
                      alt={`抓拍${i}`}
                      className="w-full h-40 object-cover"
                    />
                    <div className="px-3 py-2 bg-slate-700/50 text-xs text-slate-400">
                      {i === 1 ? '车头全景' : i === 2 ? '车牌特写' : '车尾全景'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <DollarSign size={64} className="mx-auto mb-4 opacity-30" />
              <p>请从左侧选择待缴费车辆</p>
            </div>
          </div>
        )}
      </div>

      {/* 右侧收费统计 */}
      <div className="w-72 flex flex-col border-l border-slate-700 bg-slate-800/50">
        <div className="px-4 py-3 border-b border-slate-700">
          <h3 className="font-medium flex items-center gap-2">
            <FileText size={16} className="text-blue-400" />
            本班收费统计
          </h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-slate-700/50 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-1">当前收费员</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                <User size={16} className="text-blue-400" />
              </div>
              <span className="font-medium">张值班</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-700/50 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">现金收入</p>
              <p className="text-xl font-bold text-green-400">¥856</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">电子支付</p>
              <p className="text-xl font-bold text-blue-400">¥2,340</p>
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">总营收</p>
            <p className="text-2xl font-bold text-yellow-400">¥3,196</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-700/50 rounded-lg p-2">
              <p className="text-lg font-bold">{156}</p>
              <p className="text-xs text-slate-400">总车辆</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-2">
              <p className="text-lg font-bold text-green-400">{148}</p>
              <p className="text-xs text-slate-400">已缴费</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-2">
              <p className="text-lg font-bold text-yellow-400">{8}</p>
              <p className="text-xs text-slate-400">免费</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-slate-700 mt-auto">
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">接班人员</span>
              <span className="text-blue-400">李值班</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-slate-400">预计接班时间</span>
              <span className="font-mono">18:00</span>
            </div>
          </div>
        </div>
      </div>

      {/* 免费放行审批弹窗 */}
      {showFreePassModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl w-[450px] shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Tag size={20} className="text-yellow-400" />
                免费放行审批
              </h3>
              <button 
                onClick={() => setShowFreePassModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <Car size={20} className="text-yellow-400" />
                  <div>
                    <p className="font-mono font-bold">{selectedFee?.plateNumber}</p>
                    <p className="text-xs text-slate-400">应收金额: ¥{selectedFee?.actualFee}</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">免费原因</label>
                <select 
                  value={freePassReason}
                  onChange={e => setFreePassReason(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500"
                >
                  <option value="">请选择免费原因</option>
                  <option value="military">军车免费</option>
                  <option value="police">警车免费</option>
                  <option value="ambulance">救护车免费</option>
                  <option value="fire">消防车免费</option>
                  <option value="staff">内部车辆</option>
                  <option value="vip">VIP客户</option>
                  <option value="other">其他原因</option>
                </select>
              </div>
              {freePassReason === 'other' && (
                <div>
                  <label className="block text-sm text-slate-400 mb-2">备注说明</label>
                  <textarea
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 resize-none"
                    rows={3}
                    placeholder="请输入具体原因..."
                  />
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowFreePassModal(false)}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleFreePass}
                disabled={!freePassReason}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  freePassReason 
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-black font-medium' 
                    : 'bg-slate-600 text-slate-500 cursor-not-allowed'
                }`}
              >
                <ArrowRight size={16} />
                确认放行
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierView;
