import React from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, ArrowRight, BookOpen, Layers, Share2, Server, Laptop } from 'lucide-react';
import { DeviceId, SimulationStep, TeachingScenario } from '../types';
import { DEVICES, TEACHING_SCENARIOS } from '../utils/networkData';

interface ControlPanelProps {
  senderId: DeviceId;
  receiverId: DeviceId;
  currentStepIndex: number;
  steps: SimulationStep[];
  isPlaying: boolean;
  annotationsEnabled: boolean;
  onSenderChange: (id: DeviceId) => void;
  onReceiverChange: (id: DeviceId) => void;
  onStartSimulation: () => void;
  onPauseToggle: () => void;
  onResetSimulation: () => void;
  onStepChange: (index: number) => void;
  onToggleAnnotations: () => void;
  onSelectScenario: (scenario: TeachingScenario) => void;
  activeScenarioId: string | null;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  senderId,
  receiverId,
  currentStepIndex,
  steps,
  isPlaying,
  annotationsEnabled,
  onSenderChange,
  onReceiverChange,
  onStartSimulation,
  onPauseToggle,
  onResetSimulation,
  onStepChange,
  onToggleAnnotations,
  onSelectScenario,
  activeScenarioId,
}) => {
  const senderDevice = DEVICES.find((d) => d.id === senderId);
  const receiverDevice = DEVICES.find((d) => d.id === receiverId);

  // Filter out non-workstations or switches from sender/receiver selection
  const workstationDevices = DEVICES.filter((d) => d.type === 'workstation' || d.type === 'server');

  const hasSteps = steps.length > 0;
  const isFinished = hasSteps && currentStepIndex === steps.length - 1;

  // Helper to obtain elegant device icon
  const getDeviceIcon = (id: DeviceId) => {
    switch (id) {
      case 'server':
        return <Server className="w-5 h-5 text-blue-400" />;
      case 'switch':
        return <Layers className="w-5 h-5 text-emerald-400" />;
      case 'hub':
        return <Share2 className="w-5 h-5 text-indigo-400" />;
      default:
        return <Laptop className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl w-full">
      {/* 1. CONFIGURATION SECTION (sender / receiver selection dropdowns) */}
      <div>
        <h3 className="text-base font-bold text-slate-200 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
          1. Cấu hình thiết bị Truyền tin
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sender Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-sky-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Thiết bị GỬI (Nguồn):
            </label>
            <div className="relative">
              <select
                disabled={isPlaying && currentStepIndex > 0}
                value={senderId}
                onChange={(e) => onSenderChange(e.target.value as DeviceId)}
                className="w-full text-base font-bold bg-slate-950 border-2 border-slate-800 focus:border-sky-500 text-slate-100 rounded-xl p-3.5 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {workstationDevices.map((dev) => (
                  <option key={dev.id} value={dev.id}>
                    {dev.name} {dev.ipAddress ? `(${dev.ipAddress})` : ''}
                  </option>
                ))}
              </select>
            </div>
            {senderDevice && (
              <p className="text-xs text-slate-400 font-medium px-1">
                {senderDevice.description}
              </p>
            )}
          </div>

          {/* Receiver Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Thiết bị NHẬN (Đích):
            </label>
            <div className="relative">
              <select
                disabled={isPlaying && currentStepIndex > 0}
                value={receiverId}
                onChange={(e) => onReceiverChange(e.target.value as DeviceId)}
                className="w-full text-base font-bold bg-slate-950 border-2 border-slate-800 focus:border-emerald-500 text-slate-100 rounded-xl p-3.5 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {workstationDevices.map((dev) => (
                  <option key={dev.id} value={dev.id} disabled={dev.id === senderId}>
                    {dev.name} {dev.ipAddress ? `(${dev.ipAddress})` : ''}
                  </option>
                ))}
              </select>
            </div>
            {receiverDevice && (
              <p className="text-xs text-slate-400 font-medium px-1">
                {receiverDevice.description}
              </p>
            )}
          </div>
        </div>

        {/* Validation warning if same device selected */}
        {senderId === receiverId && (
          <div className="mt-4 flex items-center gap-2.5 bg-rose-950/40 border border-rose-900/65 rounded-xl p-3 text-rose-300 text-sm font-medium">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            Thiết bị gửi và nhận không được trùng nhau! Hãy chọn thiết bị khác.
          </div>
        )}
      </div>

      {/* 2. CORE CONTROLS PANEL (Play, Pause, Reset, Toggle Annotations) */}
      <div className="border-t border-slate-800 pt-5">
        <h3 className="text-base font-bold text-slate-200 uppercase tracking-wider mb-4">
          2. Khung điều khiển Mô phỏng
        </h3>

        <div className="flex flex-wrap gap-4 items-center">
          {/* Main Action Trigger */}
          {currentStepIndex === 0 && !isPlaying ? (
            <button
              onClick={onStartSimulation}
              disabled={senderId === receiverId}
              className="flex-1 min-w-[200px] bg-sky-500 hover:bg-sky-400 text-slate-950 md:text-lg font-extrabold px-6 py-4 rounded-xl shadow-lg shadow-sky-500/20 active:scale-98 transition-all flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Play className="w-6 h-6 fill-slate-950" /> BẮT ĐẦU GỬI DỮ LIỆU
            </button>
          ) : (
            <div className="flex flex-1 min-w-[200px] gap-2">
              {/* Pause / Resume Button */}
              <button
                onClick={onPauseToggle}
                className={`flex-1 md:text-lg font-bold px-5 py-4 rounded-xl transition-all active:scale-98 flex items-center justify-center gap-2 shadow-md ${
                  isPlaying
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/10'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/10'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5 fill-slate-950" /> Tạm dừng
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-slate-950" /> {isFinished ? 'Hoàn thành' : 'Tiếp tục'}
                  </>
                )}
              </button>

              {/* Reset Button */}
              <button
                onClick={onResetSimulation}
                className="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 md:text-lg font-bold px-5 py-4 rounded-xl transition-all active:scale-98 flex items-center justify-center gap-2 shadow-md"
              >
                <RotateCcw className="w-5 h-5" /> Làm lại
              </button>
            </div>
          )}

          {/* Toggle Annotation Tooltips */}
          <button
            onClick={onToggleAnnotations}
            className={`w-full md:w-auto px-5 py-4 rounded-xl font-bold border md:text-md shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 ${
              annotationsEnabled
                ? 'bg-indigo-950 text-indigo-300 border-indigo-700 hover:bg-indigo-900/60'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700/60'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            Chú thích mạng: {annotationsEnabled ? 'ĐANG BẬT' : 'ĐANG TẮT'}
          </button>
        </div>
      </div>

      {/* 3. STEP PROGRESS TRACKBAR */}
      {hasSteps && (
        <div className="border-t border-slate-800 pt-5 flex flex-col gap-3">
          <div className="flex justify-between items-center text-sm font-mono text-slate-400">
            <span>Tiến trình truyền tải dữ liệu:</span>
            <span className="font-bold text-sky-400 text-base">
              Bước {currentStepIndex + 1} / {steps.length}
            </span>
          </div>

          {/* Step range slider bar */}
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max={steps.length - 1}
              value={currentStepIndex}
              onChange={(e) => onStepChange(parseInt(e.target.value))}
              disabled={isPlaying}
              className="flex-1 h-2.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-400 outline-none disabled:opacity-60"
            />
          </div>

          {/* Discrete step navigation layout */}
          <div className="flex justify-between gap-1 overflow-x-auto custom-scrollbar py-1">
            {steps.map((step, idx) => (
              <button
                key={step.stepIndex}
                onClick={() => !isPlaying && onStepChange(idx)}
                disabled={isPlaying}
                className={`text-[11px] font-bold px-2 py-1.5 rounded-lg flex-1 min-w-[70px] text-center transition-all ${
                  currentStepIndex === idx
                    ? 'bg-sky-500 text-slate-950 shadow-md scale-102 font-extrabold'
                    : 'bg-slate-950 text-slate-500 hover:bg-slate-800/80 hover:text-slate-350 disabled:opacity-40'
                }`}
              >
                B.{idx + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. PRESET LEARNING SCENARIOS SECTION */}
      <div className="border-t border-slate-800 pt-5">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          💡 Chọn kịch bản giảng dạy mẫu (SGK)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TEACHING_SCENARIOS.map((scenario) => {
            const isActive = activeScenarioId === scenario.id;
            return (
              <button
                key={scenario.id}
                onClick={() => onSelectScenario(scenario)}
                className={`text-left p-3.5 rounded-xl border-2 transition-all active:scale-99 flex flex-col gap-1 ${
                  isActive
                    ? 'bg-indigo-950/70 border-indigo-500 hover:border-indigo-400 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-950/60 border-slate-850 hover:border-slate-700 hover:bg-slate-950 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-indigo-400' : 'bg-slate-600'}`} />
                  <span className={`text-sm font-bold truncate ${isActive ? 'text-indigo-300' : 'text-slate-200'}`}>
                    {scenario.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal pl-4 line-clamp-2">
                  {scenario.description}
                </p>
                <div className="flex items-center gap-2.5 mt-2 pl-4 text-[10px]">
                  <span className="flex items-center gap-1 bg-sky-950/80 text-sky-400 px-1.5 py-0.5 rounded border border-sky-900 font-semibold uppercase">
                    Gửi: {getDeviceIcon(scenario.senderId)} {DEVICES.find(d => d.id === scenario.senderId)?.name.split(' (')[0]}
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  <span className="flex items-center gap-1 bg-emerald-950/80 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-900 font-semibold uppercase">
                    Nhận: {getDeviceIcon(scenario.receiverId)} {DEVICES.find(d => d.id === scenario.receiverId)?.name.split(' (')[0]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
