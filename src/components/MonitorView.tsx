import React, { useState } from 'react';
import { Maximize2, Minimize2, Play, Pause, Camera, Grid3X3, ListVideo } from 'lucide-react';
import { mockDevices, parkingStats } from '../data/mockData';

const MonitorView: React.FC = () => {
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [layout, setLayout] = useState<'4' | '9' | 'list'>('4');
  const [isPlaying, setIsPlaying] = useState(true);
  const [zoomCamera, setZoomCamera] = useState<string | null>(null);

  const cameras = mockDevices.filter(d => d.type === 'camera');

  const getCameraImage = (cameraId: string) => {
    const prompts = [
      'parking lot entrance security camera view with cars',
      'parking lot exit gate camera view vehicle detection',
      'indoor parking lot surveillance camera view',
      'parking lot entrance license plate recognition camera'
    ];
    const idx = parseInt(cameraId) % prompts.length;
    return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompts[idx])}&image_size=landscape_16_9`;
  };

  const CameraCell = ({ camera, large = false }: { camera: any; large?: boolean }) => (
    <div 
      className={`relative bg-slate-900 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
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
            className="p-1.5 bg-slate-800/80 rounded hover:bg-slate-700"
            onClick={(e) => { e.stopPropagation(); setZoomCamera(zoomCamera === camera.id ? null : camera.id); }}
          >
            {zoomCamera === camera.id ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>
      <div className="absolute top-2 right-2 text-xs text-slate-300 font-mono">
        {new Date().toLocaleTimeString()}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Camera size={20} className="text-blue-400" />
            实时监控
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">在线摄像机:</span>
            <span className="text-green-400 font-medium">
              {cameras.filter(c => c.status === 'online').length}/{cameras.length}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1.5 rounded text-sm flex items-center gap-1.5 ${
              isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            }`}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? '暂停全部' : '播放全部'}
          </button>
          
          <div className="flex bg-slate-700 rounded p-0.5">
            <button
              className={`px-3 py-1.5 rounded text-sm flex items-center gap-1 ${
                layout === '4' ? 'bg-blue-500' : 'hover:bg-slate-600'
              }`}
              onClick={() => setLayout('4')}
            >
              <Grid3X3 size={16} />
              4画面
            </button>
            <button
              className={`px-3 py-1.5 rounded text-sm flex items-center gap-1 ${
                layout === '9' ? 'bg-blue-500' : 'hover:bg-slate-600'
              }`}
              onClick={() => setLayout('9')}
            >
              <Grid3X3 size={16} />
              9画面
            </button>
            <button
              className={`px-3 py-1.5 rounded text-sm flex items-center gap-1 ${
                layout === 'list' ? 'bg-blue-500' : 'hover:bg-slate-600'
              }`}
              onClick={() => setLayout('list')}
            >
              <ListVideo size={16} />
              列表
            </button>
          </div>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-6 gap-3 px-4 py-3 bg-slate-800/50 border-b border-slate-700">
        <div className="bg-slate-700/50 rounded-lg p-3">
          <p className="text-xs text-slate-400">总车位</p>
          <p className="text-xl font-bold text-white">{parkingStats.totalSpaces}</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3">
          <p className="text-xs text-slate-400">已占用</p>
          <p className="text-xl font-bold text-red-400">{parkingStats.occupiedSpaces}</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3">
          <p className="text-xs text-slate-400">空闲</p>
          <p className="text-xl font-bold text-green-400">{parkingStats.availableSpaces}</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3">
          <p className="text-xs text-slate-400">今日入场</p>
          <p className="text-xl font-bold text-blue-400">{parkingStats.todayEntries}</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3">
          <p className="text-xs text-slate-400">今日出场</p>
          <p className="text-xl font-bold text-purple-400">{parkingStats.todayExits}</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3">
          <p className="text-xs text-slate-400">在场车辆</p>
          <p className="text-xl font-bold text-yellow-400">{parkingStats.currentVehicles}</p>
        </div>
      </div>

      {/* 视频监控区域 */}
      <div className="flex-1 p-4 overflow-auto">
        {zoomCamera ? (
          <div className="h-full">
            <CameraCell camera={cameras.find(c => c.id === zoomCamera)!} large />
          </div>
        ) : layout === '4' ? (
          <div className="grid grid-cols-2 gap-4 h-full">
            {cameras.slice(0, 4).map(camera => (
              <CameraCell key={camera.id} camera={camera} />
            ))}
          </div>
        ) : layout === '9' ? (
          <div className="grid grid-cols-3 gap-3 h-full">
            {[...cameras, ...cameras, ...cameras].slice(0, 9).map((camera, idx) => (
              <CameraCell key={`${camera.id}-${idx}`} camera={camera} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {cameras.map(camera => (
              <CameraCell key={camera.id} camera={camera} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitorView;
