import React, { useState } from 'react';
import { CheckCircle, XCircle, Edit3, Plus, User, Car, Clock, Save, AlertCircle } from 'lucide-react';
import { mockVehicles } from '../data/mockData';
import type { Vehicle } from '../types';

const PlateConfirmView: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles.filter(v => !v.hasPlate || v.plateConfidence < 0.9).slice(0, 8));
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(vehicles[0] || null);
  const [editMode, setEditMode] = useState(false);
  const [editedPlate, setEditedPlate] = useState('');
  const [showNoPlateModal, setShowNoPlateModal] = useState(false);
  const [noPlateForm, setNoPlateForm] = useState({
    vehicleType: 'car',
    color: '',
    brand: '',
    ownerName: '',
    ownerPhone: '',
    remark: ''
  });

  const handleConfirm = (vehicle: Vehicle) => {
    setVehicles(prev => prev.filter(v => v.id !== vehicle.id));
    if (selectedVehicle?.id === vehicle.id) {
      setSelectedVehicle(null);
    }
  };

  const handleEditPlate = () => {
    if (selectedVehicle) {
      setEditedPlate(selectedVehicle.plateNumber);
      setEditMode(true);
    }
  };

  const handleSavePlate = () => {
    if (selectedVehicle && editedPlate) {
      setVehicles(prev => prev.map(v => 
        v.id === selectedVehicle.id 
          ? { ...v, plateNumber: editedPlate, plateConfidence: 1, hasPlate: true }
          : v
      ));
      setSelectedVehicle(prev => prev ? { ...prev, plateNumber: editedPlate, plateConfidence: 1, hasPlate: true } : null);
      setEditMode(false);
    }
  };

  const handleCreateNoPlate = () => {
    if (selectedVehicle) {
      const tempPlate = `临${Date.now().toString().slice(-6)}`;
      setVehicles(prev => prev.map(v => 
        v.id === selectedVehicle.id 
          ? { ...v, plateNumber: tempPlate, hasPlate: true, plateConfidence: 1 }
          : v
      ));
      setSelectedVehicle(prev => prev ? { ...prev, plateNumber: tempPlate, hasPlate: true } : null);
      setShowNoPlateModal(false);
      setNoPlateForm({ vehicleType: 'car', color: '', brand: '', ownerName: '', ownerPhone: '', remark: '' });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-400';
    if (confidence >= 0.7) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="h-full flex bg-slate-900">
      {/* 左侧待确认列表 */}
      <div className="w-96 flex flex-col border-r border-slate-700">
        <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <AlertCircle size={18} className="text-yellow-400" />
            待确认列表
            <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full">
              {vehicles.length}
            </span>
          </h2>
        </div>
        <div className="flex-1 overflow-auto">
          {vehicles.map(vehicle => (
            <div 
              key={vehicle.id}
              className={`p-3 border-b border-slate-700 cursor-pointer transition-colors ${
                selectedVehicle?.id === vehicle.id 
                  ? 'bg-blue-500/20 border-l-2 border-l-blue-500' 
                  : 'hover:bg-slate-800'
              }`}
              onClick={() => setSelectedVehicle(vehicle)}
            >
              <div className="flex gap-3">
                <img 
                  src={vehicle.captureImage} 
                  alt="抓拍"
                  className="w-20 h-14 rounded object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-bold ${vehicle.hasPlate ? 'text-white' : 'text-yellow-400'}`}>
                      {vehicle.hasPlate ? vehicle.plateNumber : '无牌车'}
                    </span>
                    {vehicle.plateConfidence < 0.9 && vehicle.hasPlate && (
                      <span className={`text-xs ${getConfidenceColor(vehicle.plateConfidence)}`}>
                        {(vehicle.plateConfidence * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {vehicle.brand} {vehicle.color}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <Clock size={12} />
                    {formatTime(vehicle.entryTime)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {vehicle.lane} · {vehicle.direction === 'in' ? '入场' : '出场'}
                  </div>
                </div>
              </div>
              {!vehicle.hasPlate && (
                <div className="mt-2 p-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-400 flex items-center gap-1">
                  <AlertCircle size={12} />
                  未识别到车牌，请人工确认
                </div>
              )}
            </div>
          ))}
          {vehicles.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <CheckCircle size={48} className="mx-auto mb-2 text-green-500" />
              <p>暂无待确认车辆</p>
            </div>
          )}
        </div>
      </div>

      {/* 右侧详情和操作区 */}
      <div className="flex-1 flex flex-col">
        {selectedVehicle ? (
          <>
            {/* 车辆信息 */}
            <div className="px-6 py-4 bg-slate-800 border-b border-slate-700">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Car size={18} className="text-blue-400" />
                车辆信息
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-1">车牌号</p>
                  {editMode ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editedPlate}
                        onChange={e => setEditedPlate(e.target.value.toUpperCase())}
                        className="flex-1 bg-slate-600 border border-slate-500 rounded px-3 py-1.5 font-mono font-bold text-lg focus:outline-none focus:border-blue-500"
                        placeholder="请输入车牌号"
                      />
                      <button 
                        onClick={handleSavePlate}
                        className="px-3 py-1.5 bg-green-500 hover:bg-green-600 rounded flex items-center gap-1"
                      >
                        <Save size={16} />
                        保存
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className={`font-mono font-bold text-xl ${selectedVehicle.hasPlate ? 'text-white' : 'text-yellow-400'}`}>
                        {selectedVehicle.hasPlate ? selectedVehicle.plateNumber : '未识别'}
                      </p>
                      <button 
                        onClick={handleEditPlate}
                        className="p-1.5 bg-slate-600 hover:bg-slate-500 rounded"
                        title="修改车牌"
                      >
                        <Edit3 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-1">品牌型号</p>
                  <p className="text-lg font-medium">{selectedVehicle.brand}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-1">车身颜色</p>
                  <p className="text-lg font-medium">{selectedVehicle.color}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-1">车辆类型</p>
                  <p className="text-lg font-medium">
                    {selectedVehicle.vehicleType === 'car' ? '小型汽车' : 
                     selectedVehicle.vehicleType === 'truck' ? '货车' : '摩托车'}
                  </p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-1">通过车道</p>
                  <p className="text-lg font-medium">{selectedVehicle.lane}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-1">通行方向</p>
                  <p className="text-lg font-medium">
                    {selectedVehicle.direction === 'in' ? '入场' : '出场'}
                  </p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 col-span-2">
                  <p className="text-xs text-slate-400 mb-1">通过时间</p>
                  <p className="text-lg font-medium">{formatTime(selectedVehicle.entryTime)}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-1">识别置信度</p>
                  <p className={`text-lg font-bold ${getConfidenceColor(selectedVehicle.plateConfidence)}`}>
                    {(selectedVehicle.plateConfidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* 抓拍图片 */}
            <div className="flex-1 p-6 overflow-auto">
              <h3 className="font-semibold mb-4">抓拍图片</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 rounded-lg overflow-hidden">
                  <img 
                    src={selectedVehicle.captureImage} 
                    alt="车辆全景"
                    className="w-full h-64 object-cover"
                  />
                  <div className="px-3 py-2 bg-slate-700/50 text-sm text-slate-400">
                    车辆全景
                  </div>
                </div>
                <div className="bg-slate-800 rounded-lg overflow-hidden">
                  <img 
                    src={selectedVehicle.captureImage} 
                    alt="车牌特写"
                    className="w-full h-64 object-cover"
                  />
                  <div className="px-3 py-2 bg-slate-700/50 text-sm text-slate-400">
                    车牌特写
                  </div>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="px-6 py-4 bg-slate-800 border-t border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {!selectedVehicle.hasPlate && (
                  <button
                    onClick={() => setShowNoPlateModal(true)}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg flex items-center gap-2 font-medium"
                  >
                    <Plus size={18} />
                    无牌车建档
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleConfirm(selectedVehicle)}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg flex items-center gap-2 font-medium"
                >
                  <XCircle size={18} />
                  标记异常
                </button>
                <button
                  onClick={() => handleConfirm(selectedVehicle)}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded-lg flex items-center gap-2 font-medium"
                >
                  <CheckCircle size={18} />
                  确认放行
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <Car size={64} className="mx-auto mb-4 opacity-30" />
              <p>请从左侧选择待确认车辆</p>
            </div>
          </div>
        )}
      </div>

      {/* 无牌车建档弹窗 */}
      {showNoPlateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl w-[500px] shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <User size={20} className="text-blue-400" />
                无牌车建档
              </h3>
              <button 
                onClick={() => setShowNoPlateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">车辆类型</label>
                  <select 
                    value={noPlateForm.vehicleType}
                    onChange={e => setNoPlateForm(prev => ({ ...prev, vehicleType: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="car">小型汽车</option>
                    <option value="truck">货车</option>
                    <option value="motorcycle">摩托车</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">车身颜色</label>
                  <input
                    type="text"
                    value={noPlateForm.color}
                    onChange={e => setNoPlateForm(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="如：白色"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">品牌型号</label>
                <input
                  type="text"
                  value={noPlateForm.brand}
                  onChange={e => setNoPlateForm(prev => ({ ...prev, brand: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="如：大众 帕萨特"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">车主姓名</label>
                  <input
                    type="text"
                    value={noPlateForm.ownerName}
                    onChange={e => setNoPlateForm(prev => ({ ...prev, ownerName: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="选填"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">联系电话</label>
                  <input
                    type="text"
                    value={noPlateForm.ownerPhone}
                    onChange={e => setNoPlateForm(prev => ({ ...prev, ownerPhone: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="选填"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">备注</label>
                <textarea
                  value={noPlateForm.remark}
                  onChange={e => setNoPlateForm(prev => ({ ...prev, remark: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 resize-none"
                  rows={3}
                  placeholder="补充说明..."
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowNoPlateModal(false)}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleCreateNoPlate}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center gap-2"
              >
                <Save size={16} />
                建档案
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlateConfirmView;
