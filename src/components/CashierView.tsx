import React, { useState, useMemo } from 'react';
import {
  DollarSign, CreditCard, Check, X, Calculator,
  Receipt, User, Clock, Car, ChevronRight, AlertCircle
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { calculateParkingFee, formatDateTime, generateId, getVehicleTypeName } from '../utils/helpers';
import type { FeeRecord, Vehicle } from '../types';

const CashierView: React.FC = () => {
  const { state, dispatch, addOperationLog } = useApp();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [receivedAmount, setReceivedAmount] = useState<string>('');
  const [showFreePassModal, setShowFreePassModal] = useState(false);
  const [freePassReason, setFreePassReason] = useState('');
  const [showSuccessTip, setShowSuccessTip] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const pendingVehicles = useMemo(() => {
    return state.vehicles.filter(v => 
      v.direction === 'out' && !v.exitTime
    );
  }, [state.vehicles]);

  const feeResult = useMemo(() => {
    if (!selectedVehicle) return null;
    const exitTime = new Date();
    return calculateParkingFee(selectedVehicle.entryTime, exitTime, selectedVehicle.vehicleType);
  }, [selectedVehicle]);

  const changeAmount = useMemo(() => {
    if (!feeResult || !receivedAmount) return 0;
    const received = parseFloat(receivedAmount) || 0;
    return Math.max(0, received - feeResult.actualFee);
  }, [feeResult, receivedAmount]);

  const cashStats = useMemo(() => {
    const todayRecords = state.feeRecords.filter(f => 
      f.paymentMethod === 'cash' && f.status === 'paid'
    );
    const totalCash = todayRecords.reduce((sum, r) => sum + r.actualFee, 0);
    const freePassCount = state.feeRecords.filter(f => f.status === 'free_pass').length;
    
    return {
      cashCount: todayRecords.length,
      cashTotal: totalCash,
      freePassCount,
      shiftCash: state.currentShift.cashCollection
    };
  }, [state.feeRecords, state.currentShift.cashCollection]);

  const showTip = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessTip(true);
    setTimeout(() => setShowSuccessTip(false), 2000);
  };

  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setReceivedAmount('');
  };

  const handleConfirmPayment = () => {
    if (!selectedVehicle || !feeResult) return;

    const received = parseFloat(receivedAmount) || 0;
    if (received < feeResult.actualFee) {
      alert('实收金额不能小于应收金额');
      return;
    }

    const feeRecord: FeeRecord = {
      id: generateId('fee'),
      vehicleId: selectedVehicle.id,
      plateNumber: selectedVehicle.plateNumber || '无牌车',
      entryTime: selectedVehicle.entryTime,
      exitTime: new Date(),
      duration: feeResult.durationMinutes,
      baseFee: feeResult.baseFee,
      totalFee: feeResult.totalFee,
      discount: feeResult.discount,
      actualFee: feeResult.actualFee,
      paymentMethod: 'cash',
      status: 'paid',
      operatorId: state.currentOperator.id,
      operatorName: state.currentOperator.name,
      timestamp: new Date()
    };

    dispatch({ type: 'ADD_FEE_RECORD', payload: feeRecord });
    dispatch({ type: 'REMOVE_VEHICLE', payload: selectedVehicle.id });
    dispatch({
      type: 'UPDATE_SHIFT',
      payload: {
        cashCollection: state.currentShift.cashCollection + feeResult.actualFee,
        totalCollection: state.currentShift.totalCollection + feeResult.actualFee,
        vehicleCount: state.currentShift.vehicleCount + 1
      }
    });

    addOperationLog(
      '现金收费',
      `车牌: ${selectedVehicle.plateNumber || '无牌车'}, 金额: ¥${feeResult.actualFee}, 实收: ¥${received}, 找零: ¥${changeAmount.toFixed(2)}`,
      { plateNumber: selectedVehicle.plateNumber }
    );

    showTip(`收费成功！找零: ¥${changeAmount.toFixed(2)}`);
    setSelectedVehicle(null);
    setReceivedAmount('');
  };

  const handleFreePass = () => {
    if (!selectedVehicle || !freePassReason.trim()) {
      alert('请填写免费放行原因');
      return;
    }

    const feeRecord: FeeRecord = {
      id: generateId('fee'),
      vehicleId: selectedVehicle.id,
      plateNumber: selectedVehicle.plateNumber || '无牌车',
      entryTime: selectedVehicle.entryTime,
      exitTime: new Date(),
      duration: feeResult?.durationMinutes || 0,
      baseFee: feeResult?.baseFee || 0,
      totalFee: feeResult?.totalFee || 0,
      discount: feeResult?.totalFee || 0,
      actualFee: 0,
      paymentMethod: 'free',
      status: 'free_pass',
      operatorId: state.currentOperator.id,
      operatorName: state.currentOperator.name,
      timestamp: new Date()
    };

    dispatch({ type: 'ADD_FEE_RECORD', payload: feeRecord });
    dispatch({ type: 'REMOVE_VEHICLE', payload: selectedVehicle.id });
    dispatch({
      type: 'UPDATE_SHIFT',
      payload: {
        freePassCount: state.currentShift.freePassCount + 1,
        vehicleCount: state.currentShift.vehicleCount + 1
      }
    });

    addOperationLog(
      '免费放行',
      `车牌: ${selectedVehicle.plateNumber || '无牌车'}, 原因: ${freePassReason}`,
      { plateNumber: selectedVehicle.plateNumber }
    );

    showTip('免费放行已确认');
    setShowFreePassModal(false);
    setFreePassReason('');
    setSelectedVehicle(null);
  };

  return (
    <div className="h-full flex gap-4 p-4">
      {showSuccessTip && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
          <Check size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="w-72 flex flex-col bg-slate-800 rounded-xl">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Car size={16} className="text-blue-400" />
            待缴费车辆
          </h3>
          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
            {pendingVehicles.length}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {pendingVehicles.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              暂无待缴费车辆
            </div>
          ) : (
            pendingVehicles.map(vehicle => (
              <div
                key={vehicle.id}
                onClick={() => handleSelectVehicle(vehicle)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedVehicle?.id === vehicle.id
                    ? 'bg-blue-500/20 border border-blue-500/50'
                    : 'bg-slate-700/50 hover:bg-slate-700 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono font-bold ${
                    vehicle.hasPlate ? 'text-white' : 'text-orange-400'
                  }`}>
                    {vehicle.plateNumber || '无牌车'}
                  </span>
                  <ChevronRight size={14} className="text-slate-400" />
                </div>
                <div className="mt-1 text-xs text-slate-400 flex items-center gap-2">
                  <span>{getVehicleTypeName(vehicle.vehicleType)}</span>
                  <span>·</span>
                  <span>{vehicle.color}</span>
                </div>
                <div className="mt-1 text-xs text-slate-500 flex items-center gap-1">
                  <Clock size={10} />
                  入场: {formatDateTime(vehicle.entryTime)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-slate-800 rounded-xl">
        <div className="p-4 border-b border-slate-700">
          <h3 className="font-semibold flex items-center gap-2">
            <Calculator size={16} className="text-green-400" />
            收费操作
          </h3>
        </div>

        {!selectedVehicle ? (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <DollarSign size={48} className="mx-auto mb-3 opacity-30" />
              <p>请从左侧选择待缴费车辆</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="bg-slate-700/50 rounded-xl p-5 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">车牌号码</p>
                  <p className="text-2xl font-mono font-bold">
                    {selectedVehicle.plateNumber || (
                      <span className="text-orange-400">无牌车</span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400 mb-1">车辆类型</p>
                  <p className="text-lg">{getVehicleTypeName(selectedVehicle.vehicleType)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400 mb-1">入场时间</p>
                  <p className="font-mono">{formatDateTime(selectedVehicle.entryTime)}</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1">出场时间</p>
                  <p className="font-mono">{formatDateTime(new Date())}</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1">停车时长</p>
                  <p className="font-mono text-blue-400 font-medium">
                    {feeResult?.durationText}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1">入口车道</p>
                  <p>{selectedVehicle.lane}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-xl p-5 mb-6">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Receipt size={16} className="text-yellow-400" />
                费用明细
              </h4>
              <div className="space-y-3">
                {feeResult?.feeDetails.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-slate-400">{item.name}</span>
                    <span>{item.value} {item.unit}</span>
                  </div>
                ))}
                <div className="border-t border-slate-600 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-300">应收金额</span>
                    <span className="text-2xl font-bold text-yellow-400">
                      ¥{feeResult?.actualFee.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-xl p-5">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <CreditCard size={16} className="text-green-400" />
                收款信息
              </h4>
              
              <div className="mb-4">
                <label className="block text-sm text-slate-400 mb-2">实收金额（元）</label>
                <input
                  type="number"
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                  placeholder="请输入实收金额"
                  className="w-full h-12 px-4 bg-slate-900 border border-slate-600 rounded-lg text-xl font-mono focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {receivedAmount && feeResult && (
                <div className={`p-4 rounded-lg mb-4 ${
                  changeAmount >= 0 
                    ? 'bg-green-500/10 border border-green-500/30' 
                    : 'bg-red-500/10 border border-red-500/30'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className={changeAmount >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {changeAmount >= 0 ? '应找零' : '金额不足'}
                    </span>
                    <span className={`text-2xl font-bold ${
                      changeAmount >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      ¥{changeAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowFreePassModal(true)}
                  className="h-12 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <AlertCircle size={18} />
                  免费放行
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={!receivedAmount || changeAmount < 0}
                  className="h-12 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check size={18} />
                  确认收款
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-64 flex flex-col gap-4">
        <div className="bg-slate-800 rounded-xl p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <User size={16} className="text-blue-400" />
            本班统计
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">收费员</span>
              <span className="font-medium">{state.currentShift.operatorName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">现金收入</span>
              <span className="text-green-400 font-mono font-bold">
                ¥{cashStats.shiftCash.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">处理车辆</span>
              <span className="font-mono">{state.currentShift.vehicleCount} 辆</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">免费放行</span>
              <span className="text-orange-400 font-mono">{cashStats.freePassCount} 次</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Receipt size={16} className="text-yellow-400" />
            今日现金汇总
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">现金笔数</span>
              <span className="font-mono">{cashStats.cashCount} 笔</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">现金总额</span>
              <span className="text-yellow-400 font-mono font-bold text-lg">
                ¥{cashStats.cashTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showFreePassModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-96 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">免费放行审批</h3>
              <button
                onClick={() => setShowFreePassModal(false)}
                className="p-1 hover:bg-slate-700 rounded"
              >
                <X size={20} />
              </button>
            </div>

            {selectedVehicle && (
              <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">车牌</span>
                  <span className="font-mono font-bold">
                    {selectedVehicle.plateNumber || '无牌车'}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-slate-400">应收金额</span>
                  <span className="text-yellow-400 font-mono">
                    ¥{feeResult?.actualFee.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">免费原因 *</label>
              <textarea
                value={freePassReason}
                onChange={(e) => setFreePassReason(e.target.value)}
                placeholder="请输入免费放行原因..."
                rows={3}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowFreePassModal(false)}
                className="flex-1 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleFreePass}
                className="flex-1 h-10 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors font-medium"
              >
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
