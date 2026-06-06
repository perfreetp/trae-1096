import React, { useState, useMemo } from 'react';
import {
  FileCheck, Check, X, Edit2, Save, UserPlus,
  Car, Clock, User, FileText, AlertTriangle, Camera
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { formatDateTime, getVehicleTypeName } from '../utils/helpers';
import type { Vehicle } from '../types';

const PlateConfirmView: React.FC = () => {
  const { state, dispatch, addOperationLog } = useApp();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedPlate, setEditedPlate] = useState('');
  const [showNoPlateModal, setShowNoPlateModal] = useState(false);
  const [showSuccessTip, setShowSuccessTip] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [noPlateForm, setNoPlateForm] = useState<{
    vehicleType: Vehicle['vehicleType'];
    color: string;
    brand: string;
    ownerName: string;
    ownerPhone: string;
    remark: string;
  }>({
    vehicleType: 'car',
    color: '',
    brand: '',
    ownerName: '',
    ownerPhone: '',
    remark: ''
  });

  const pendingVehicles = useMemo(() => {
    return state.vehicles.filter(v => 
      !v.hasPlate || v.plateConfidence < 0.9
    ).slice(0, 10);
  }, [state.vehicles]);

  const showTip = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessTip(true);
    setTimeout(() => setShowSuccessTip(false), 2000);
  };

  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setEditMode(false);
    setEditedPlate(vehicle.plateNumber);
  };

  const handleStartEdit = () => {
    if (!selectedVehicle) return;
    setEditedPlate(selectedVehicle.plateNumber);
    setEditMode(true);
  };

  const handleSavePlate = () => {
    if (!selectedVehicle || !editedPlate.trim()) return;

    const updatedVehicle: Vehicle = {
      ...selectedVehicle,
      plateNumber: editedPlate.trim().toUpperCase(),
      plateConfidence: 1.0,
      hasPlate: true
    };

    dispatch({ type: 'UPDATE_VEHICLE', payload: updatedVehicle });

    addOperationLog(
      '车牌修正',
      `原车牌: ${selectedVehicle.plateNumber || '无牌'}, 新车牌: ${editedPlate.trim().toUpperCase()}`,
      { plateNumber: editedPlate.trim().toUpperCase() }
    );

    showTip('车牌已修正');
    setEditMode(false);
    setSelectedVehicle(updatedVehicle);
  };

  const handleConfirmPlate = () => {
    if (!selectedVehicle) return;

    const updatedVehicle: Vehicle = {
      ...selectedVehicle,
      plateConfidence: 1.0
    };

    dispatch({ type: 'UPDATE_VEHICLE', payload: updatedVehicle });

    addOperationLog(
      '车牌确认',
      `车牌: ${selectedVehicle.plateNumber || '无牌车'}, 确认无误`,
      { plateNumber: selectedVehicle.plateNumber }
    );

    showTip('车牌已确认');
    setSelectedVehicle(null);
  };

  const handleMarkException = () => {
    if (!selectedVehicle) return;

    addOperationLog(
      '异常标记',
      `车牌: ${selectedVehicle.plateNumber || '无牌车'}, 标记为异常待处理`,
      { plateNumber: selectedVehicle.plateNumber }
    );

    showTip('已标记为异常');
    setSelectedVehicle(null);
  };

  const handleOpenNoPlateModal = () => {
    if (selectedVehicle) {
      setNoPlateForm({
        vehicleType: selectedVehicle.vehicleType,
        color: selectedVehicle.color,
        brand: selectedVehicle.brand,
        ownerName: selectedVehicle.ownerName || '',
        ownerPhone: selectedVehicle.ownerPhone || '',
        remark: selectedVehicle.remark || ''
      });
    }
    setShowNoPlateModal(true);
  };

  const handleSaveNoPlate = () => {
    if (!selectedVehicle) return;

    const updatedVehicle: Vehicle = {
      ...selectedVehicle,
      vehicleType: noPlateForm.vehicleType,
      color: noPlateForm.color,
      brand: noPlateForm.brand,
      ownerName: noPlateForm.ownerName,
      ownerPhone: noPlateForm.ownerPhone,
      remark: noPlateForm.remark,
      noPlateRegistered: true,
      plateConfidence: 1.0
    };

    dispatch({ type: 'UPDATE_VEHICLE', payload: updatedVehicle });

    addOperationLog(
      '无牌车建档',
      `车辆类型: ${getVehicleTypeName(noPlateForm.vehicleType)}, 颜色: ${noPlateForm.color}, 品牌: ${noPlateForm.brand}, 车主: ${noPlateForm.ownerName || '未填写'}, 电话: ${noPlateForm.ownerPhone || '未填写'}`,
      { plateNumber: selectedVehicle.plateNumber }
    );

    showTip('无牌车建档完成');
    setShowNoPlateModal(false);
    setSelectedVehicle(updatedVehicle);
  };

  return (
    <div className="h-full flex gap-4 p-4">
      {showSuccessTip && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
          <Check size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="w-80 flex flex-col bg-slate-800 rounded-xl">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <FileCheck size={16} className="text-blue-400" />
            待确认车牌
          </h3>
          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
            {pendingVehicles.length}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {pendingVehicles.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              暂无待确认车辆
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
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-mono font-bold ${
                    vehicle.hasPlate ? 'text-white' : 'text-orange-400'
                  }`}>
                    {vehicle.plateNumber || '无牌车'}
                  </span>
                  {!vehicle.hasPlate && (
                    <span className="text-xs bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded">
                      无牌
                    </span>
                  )}
                  {vehicle.hasPlate && vehicle.plateConfidence < 0.9 && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">
                      低置信度
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span>{getVehicleTypeName(vehicle.vehicleType)}</span>
                  <span>·</span>
                  <span>{vehicle.color}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Clock size={10} />
                  {formatDateTime(vehicle.entryTime)}
                </div>
                {vehicle.noPlateRegistered && (
                  <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                    <Check size={10} />
                    已建档
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-slate-800 rounded-xl">
        <div className="p-4 border-b border-slate-700">
          <h3 className="font-semibold flex items-center gap-2">
            <Camera size={16} className="text-green-400" />
            车辆详情
          </h3>
        </div>

        {!selectedVehicle ? (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <FileCheck size={48} className="mx-auto mb-3 opacity-30" />
              <p>请从左侧选择待确认车辆</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-700/50 rounded-xl overflow-hidden">
                <div className="aspect-video bg-slate-900 flex items-center justify-center relative">
                  <img
                    src={selectedVehicle.captureImage}
                    alt="抓拍照片"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden absolute inset-0 flex items-center justify-center">
                    <Camera size={48} className="text-slate-600" />
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-slate-400">车辆抓拍照片</p>
                  <p className="text-xs text-slate-500 mt-1">
                    车道: {selectedVehicle.lane}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-700/50 rounded-xl p-5">
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <Car size={16} className="text-blue-400" />
                    车牌信息
                  </h4>
                  
                  {editMode ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editedPlate}
                        onChange={(e) => setEditedPlate(e.target.value.toUpperCase())}
                        placeholder="请输入车牌号码"
                        className="w-full h-12 px-4 bg-slate-900 border border-slate-600 rounded-lg text-xl font-mono focus:outline-none focus:border-blue-500 transition-colors text-center tracking-wider"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSavePlate}
                          className="flex-1 h-10 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <Save size={16} />
                          保存
                        </button>
                        <button
                          onClick={() => setEditMode(false)}
                          className="flex-1 h-10 rounded-lg bg-slate-600 hover:bg-slate-500 transition-colors flex items-center justify-center gap-2"
                        >
                          <X size={16} />
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">车牌号码</span>
                        <span className={`text-2xl font-mono font-bold ${
                          selectedVehicle.hasPlate ? 'text-white' : 'text-orange-400'
                        }`}>
                          {selectedVehicle.plateNumber || '无牌车'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">识别置信度</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-600 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                selectedVehicle.plateConfidence >= 0.9 ? 'bg-green-500' :
                                selectedVehicle.plateConfidence >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${selectedVehicle.plateConfidence * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-mono">
                            {(selectedVehicle.plateConfidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleStartEdit}
                          className="flex-1 h-10 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2"
                        >
                          <Edit2 size={16} />
                          人工修正
                        </button>
                        {!selectedVehicle.hasPlate && (
                          <button
                            onClick={handleOpenNoPlateModal}
                            className="flex-1 h-10 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors flex items-center justify-center gap-2"
                          >
                            <UserPlus size={16} />
                            无牌车建档
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-700/50 rounded-xl p-5">
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <Car size={16} className="text-green-400" />
                    车辆信息
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">车辆类型</span>
                      <span>{getVehicleTypeName(selectedVehicle.vehicleType)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">车身颜色</span>
                      <span>{selectedVehicle.color || '未识别'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">品牌型号</span>
                      <span>{selectedVehicle.brand || '未识别'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">入场时间</span>
                      <span className="font-mono">{formatDateTime(selectedVehicle.entryTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">入口车道</span>
                      <span>{selectedVehicle.lane}</span>
                    </div>
                  </div>
                </div>

                {selectedVehicle.noPlateRegistered && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5">
                    <h4 className="font-medium mb-3 flex items-center gap-2 text-green-400">
                      <Check size={16} />
                      已建档信息
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">车主姓名</span>
                        <span>{selectedVehicle.ownerName || '未填写'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">联系电话</span>
                        <span>{selectedVehicle.ownerPhone || '未填写'}</span>
                      </div>
                      {selectedVehicle.remark && (
                        <div className="pt-2 border-t border-green-500/20">
                          <span className="text-slate-400 text-xs">备注</span>
                          <p className="mt-1 text-slate-300">{selectedVehicle.remark}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleConfirmPlate}
                    className="h-12 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <Check size={18} />
                    确认放行
                  </button>
                  <button
                    onClick={handleMarkException}
                    className="h-12 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <AlertTriangle size={18} />
                    标记异常
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showNoPlateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-[500px] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <UserPlus size={20} className="text-orange-400" />
                无牌车建档
              </h3>
              <button
                onClick={() => setShowNoPlateModal(false)}
                className="p-1 hover:bg-slate-700 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">车辆类型 *</label>
                  <select
                    value={noPlateForm.vehicleType}
                    onChange={(e) => setNoPlateForm(prev => ({ ...prev, vehicleType: e.target.value as any }))}
                    className="w-full h-10 px-3 bg-slate-900 border border-slate-600 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="car">小型汽车</option>
                    <option value="van">面包车</option>
                    <option value="truck">货车</option>
                    <option value="bus">客车</option>
                    <option value="motorcycle">摩托车</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">车身颜色</label>
                  <input
                    type="text"
                    value={noPlateForm.color}
                    onChange={(e) => setNoPlateForm(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="如: 白色、黑色"
                    className="w-full h-10 px-3 bg-slate-900 border border-slate-600 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5">品牌型号</label>
                <input
                  type="text"
                  value={noPlateForm.brand}
                  onChange={(e) => setNoPlateForm(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="如: 大众、丰田"
                  className="w-full h-10 px-3 bg-slate-900 border border-slate-600 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <User size={14} className="text-blue-400" />
                  车主信息
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">车主姓名</label>
                    <input
                      type="text"
                      value={noPlateForm.ownerName}
                      onChange={(e) => setNoPlateForm(prev => ({ ...prev, ownerName: e.target.value }))}
                      placeholder="请输入车主姓名"
                      className="w-full h-10 px-3 bg-slate-900 border border-slate-600 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">联系电话</label>
                    <input
                      type="tel"
                      value={noPlateForm.ownerPhone}
                      onChange={(e) => setNoPlateForm(prev => ({ ...prev, ownerPhone: e.target.value }))}
                      placeholder="请输入联系电话"
                      className="w-full h-10 px-3 bg-slate-900 border border-slate-600 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5 flex items-center gap-1">
                  <FileText size={12} />
                  备注信息
                </label>
                <textarea
                  value={noPlateForm.remark}
                  onChange={(e) => setNoPlateForm(prev => ({ ...prev, remark: e.target.value }))}
                  placeholder="请输入备注信息..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNoPlateModal(false)}
                className="flex-1 h-11 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveNoPlate}
                className="flex-1 h-11 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors font-medium"
              >
                确认建档
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlateConfirmView;
