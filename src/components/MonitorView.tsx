import React, { useState, useMemo } from 'react';
import { Maximize2, Minimize2, Play, Pause, Camera, Grid3X3, ListVideo, Car, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { useApp } from '../store/AppContext';

const MonitorView: React.FC = () => {
  const { state, dispatch } = useApp();
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [layout, setLayout] = useState<'4' | '9' | 'list'>('4');
  const [isPlaying, setIsPlaying] = useState(true);
  const [zoomCamera, setZoomCamera] = useState<string | null>(null);

  const cameras = useMemo(() => state.devices.filter(d => d.type === 'camera'), [state.devices]);

  const stats = useMemo(() => ({
    totalSpaces: 500,
    usedSpaces: 432,
    availableSpaces: 68,
    occupancyRate: 86.4,
    inCount: 156,
    outCount: 128
  }), []);

  const getCameraImage = (cameraId: string) => {
    const prompts = [
      'parking lot entrance security camera view with cars',
      'parking lot exit gate camera view vehicle detection',
      'indoor parking lot surveillance camera view',
      'parking lot entrance license plate recognition camera',
      'parking lot interior wide angle camera view',
      'parking lot payment station camera view',
      'parking lot elevator entrance camera view',
      'parking lot pedestrian exit camera view',
      'parking lot barrier gate camera view'
    ];
    const idx = parseInt(cameraId.replace(/\D/g, '')) % prompts.length;
    return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompts[idx] || prompts[0])}&image_size=landscape_16_9`;
  };

  const CameraCell = ({ camera, large = false }: { camera: any; large?: boolean }) => (
    <div
      className={`relative bg-slate-900 rounded-lg overflow-hidden border-2 transition-all cursor-pointer group ${
        selectedCamera === camera.id ? 'border-blue-500' : 'border-slate-700 hover:border-slate-600'
      } ${large ? 'col-span-2 row-span-2' : ''}`}
      onClick={() => setSelectedCamera(camera.id)}
      onDoubleClick={() => setZoomCamera(zoomCamera === camera.id ? null : camera.id)}
    >
      <img
        src={getCameraImage(camera.id)}
        alt={camera.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute top-2 left-2 flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded text-xs ${
          camera.status === 'online' ? 'bg-green-500/80' :
          camera.status === 'warning' ? 'bg-yellow-500/80' : 'bg-red-500/80'
        }`}>
          {camera.status === 'online' ? '在线' : camera.status === 'warning' ? '警告' : '离线'}
        </span>
        {isPlaying && camera.status === 'online' && (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/80 rounded text-xs">
            <span className="w-1.5 h-1.5 bg-white rounded-full blink"></span>
            LIVE
          </span>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">{camera.name}</p>
            <p className="text-xs text-slate-400">{camera.location}</p>
          </div>
          <button
            className="p-1.5 bg-slate-800/80 rounded hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => { e.stopPropagation(); setZoomCamera(zoomCamera === camera.id ? null : camera.id); }}
          >
            {zoomCamera === camera.id ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>
      <div className="absolute top-2 right-2 text-xs text-slate-300 font-mono bg-black/40 px-1.5 py-0.5 rounded">
        {new Date().toLocaleTimeString()}
      </div>
    </div>
  );

  const renderGrid = () => {
    const gridCols = layout === '4' ? 'grid-cols-2' : layout === '9' ? 'grid-cols-3' : 'grid-cols-1';
    const displayCameras = layout === 'list' ? cameras.slice(0, 3) : cameras.slice(0, parseInt(layout));

    if (zoomCamera) {
      const camera = cameras.find(c => c.id === zoomCamera);
      if (camera) {
        return (
          <div className="h-full">
            <CameraCell camera={camera} large />
          </div>
        );
      }
    }

    return (
      <div className={`grid ${gridCols} gap-3 h-full p-3`}>
        {displayCameras.map(camera => (
          <CameraCell key={camera.id} camera={camera} />
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Camera size={20} className="text-blue-400" />
            实时监控
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2 rounded-lg transition-colors ${
                isPlaying ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
              }`}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400 mr-2">布局:</span>
          {(['4', '9', 'list'] as const).map(l => (
            <button
              key={l}
              onClick={() => setLayout(l)}
              className={`p-2 rounded-lg transition-colors ${
                layout === l
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {l === 'list' ? <ListVideo size={16} /> : <Grid3X3 size={16} />}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex-shrink-0">
        <div className="bg-slate-700/50 rounded-lg p-3 flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Car size={20} className="text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">今日入场</p>
            <p className="text-xl font-bold text-white">{stats.inCount}</p>
          </div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3 flex items-center gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Car size={20} className="text-green-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">今日出场</p>
            <p className="text-xl font-bold text-white">{stats.outCount}</p>
          </div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3 flex items-center gap-3">
          <div className="p-2 bg-yellow-500/20 rounded-lg">
            <CheckCircle size={20} className="text-yellow-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">空余车位</p>
            <p className="text-xl font-bold text-white">{stats.availableSpaces}</p>
          </div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3 flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            stats.occupancyRate >= 90 ? 'bg-red-500/20' :
            stats.occupancyRate >= 80 ? 'bg-yellow-500/20' : 'bg-green-500/20'
          }`}>
            <Users size={20} className={
              stats.occupancyRate >= 90 ? 'text-red-400' :
              stats.occupancyRate >= 80 ? 'text-yellow-400' : 'text-green-400'
            } />
          </div>
          <div>
            <p className="text-xs text-slate-400">使用率</p>
            <p className={`text-xl font-bold ${
              stats.occupancyRate >= 90 ? 'text-red-400' :
              stats.occupancyRate >= 80 ? 'text-yellow-400' : 'text-green-400'
            }`}>{stats.occupancyRate}%</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {renderGrid()}
      </div>

      {state.selectedVehicle && (
        <div className="px-4 py-2 bg-blue-500/10 border-t border-blue-500/30 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-blue-400" />
            <span className="text-sm">
              已选中车辆: <span className="font-mono font-bold">{state.selectedVehicle.plateNumber || '无牌车'}</span>
              <span className="text-slate-400 ml-2">({state.selectedVehicle.lane})</span>
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'plate' })}
              className="px-3 h-8 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded text-sm transition-colors"
            >
              车牌确认
            </button>
            <button
              onClick={() => dispatch({ type: 'SELECT_VEHICLE', payload: null })}
              className="px-3 h-8 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
            >
              取消选中
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitorView;
