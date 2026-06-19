import { useState, useEffect, useMemo } from 'react';
import { NetworkTopology } from './components/NetworkTopology';
import { ControlPanel } from './components/ControlPanel';
import { TeachersGuide } from './components/TeachersGuide';
import { DEVICES, CONNECTIONS, TEACHING_SCENARIOS } from './utils/networkData';
import { generateSimulationSteps } from './utils/simulation';
import { Device, DeviceId, TeachingScenario } from './types';
import { ShieldCheck, Tv, Network, HelpCircle, GraduationCap, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';

export default function App() {
  // 1. STATE INITIALIZATION
  const [senderId, setSenderId] = useState<DeviceId>('pc_a');
  const [receiverId, setReceiverId] = useState<DeviceId>('server');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [annotationsEnabled, setAnnotationsEnabled] = useState<boolean>(true);
  const [teacherGuideEnabled, setTeacherGuideEnabled] = useState<boolean>(true);
  const [selectedDeviceTooltip, setSelectedDeviceTooltip] = useState<Device | null>(null);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>('scenario_switch_direct');

  // Load initial preset scenario if present
  useEffect(() => {
    const initialScenario = TEACHING_SCENARIOS.find(s => s.id === 'scenario_switch_direct');
    if (initialScenario) {
      setSenderId(initialScenario.senderId);
      setReceiverId(initialScenario.receiverId);
    }
  }, []);

  // 2. SIMULATION GENERATION
  // Regenerate steps whenever sender, receiver or active path changes
  const steps = useMemo(() => {
    return generateSimulationSteps(senderId, receiverId);
  }, [senderId, receiverId]);

  const activeStep = useMemo(() => {
    if (steps.length === 0) return null;
    return steps[currentStepIndex] || null;
  }, [steps, currentStepIndex]);

  const activeScenario = useMemo(() => {
    return TEACHING_SCENARIOS.find(s => s.id === activeScenarioId) || null;
  }, [activeScenarioId]);

  // 3. EFFECT FOR PLAYBACK LOOP
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 3000); // 3 seconds per step is the perfect sweet spot for classroom whiteboard reading
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, steps.length]);

  // 4. EVENT HANDLERS
  const handleSenderChange = (id: DeviceId) => {
    setIsPlaying(false);
    setSenderId(id);
    setCurrentStepIndex(0);
    setActiveScenarioId(null); // Custom routing resets preloaded scenario script
    setSelectedDeviceTooltip(null);
  };

  const handleReceiverChange = (id: DeviceId) => {
    setIsPlaying(false);
    setReceiverId(id);
    setCurrentStepIndex(0);
    setActiveScenarioId(null);
    setSelectedDeviceTooltip(null);
  };

  const handleStartSimulation = () => {
    setCurrentStepIndex(0);
    setIsPlaying(true);
    setSelectedDeviceTooltip(null);
  };

  const handlePauseToggle = () => {
    setIsPlaying(!isPlaying);
  };

  const handleResetSimulation = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setSelectedDeviceTooltip(null);
  };

  const handleStepChange = (index: number) => {
    setIsPlaying(false);
    setCurrentStepIndex(index);
  };

  const handleToggleAnnotations = () => {
    setAnnotationsEnabled(!annotationsEnabled);
    setSelectedDeviceTooltip(null);
  };

  const handleSelectScenario = (scenario: TeachingScenario) => {
    setIsPlaying(false);
    setSenderId(scenario.senderId);
    setReceiverId(scenario.receiverId);
    setCurrentStepIndex(0);
    setActiveScenarioId(scenario.id);
    setSelectedDeviceTooltip(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col">
      {/* GLAMOROUS CLASSROOM TOP BANNER HEADER */}
      <header className="bg-slate-900 border-b border-slate-800 py-5 px-6 shadow-md shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner">
              <Network className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center justify-center md:justify-start gap-2">
                Mô phỏng mạng LAN & Đường truyền dữ liệu
              </h1>
              <p className="text-xs md:text-sm text-slate-400 font-medium mt-0.5">
                Công cụ hỗ trợ giảng thuyết thiết bị kết nối vật lý lớp học (Switch, Hub, Máy chủ, Máy trạm)
              </p>
            </div>
          </div>

          {/* Quick Display Info Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-slate-950/80 hover:bg-slate-950 text-slate-350 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-800">
              <Tv className="w-4 h-4 text-emerald-400" />
              Tối ưu hóa Projector / Tivi
            </div>
            <button
              onClick={() => setTeacherGuideEnabled(!teacherGuideEnabled)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                teacherGuideEnabled
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              {teacherGuideEnabled ? 'ẨN BẢNG LỜI DẪN' : 'HIỆN BẢNG LỜI DẪN'}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN SINGLE-SCREEN WORKSPACE CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COMPONENT COLUMN (TOPOLOGY CANVAS + TEACHERS GUIDE) */}
        <div className="lg:col-span-7 flex flex-col gap-6 w-full">
          {/* Interactive Topology Visualizer */}
          <NetworkTopology
            devices={DEVICES}
            connections={CONNECTIONS}
            currentStep={activeStep}
            annotationsEnabled={annotationsEnabled}
            senderId={senderId}
            receiverId={receiverId}
            setSenderId={handleSenderChange}
            setReceiverId={handleReceiverChange}
            isPlaying={isPlaying}
            onSelectDeviceTooltip={setSelectedDeviceTooltip}
            selectedDeviceTooltip={selectedDeviceTooltip}
          />

          {/* Real-time Narrative HUD Tracker */}
          {activeStep && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-lg">
              <div className="p-2 bg-sky-950/80 rounded-xl text-sky-400 border border-sky-900 flex-shrink-0 animate-pulse">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-mono text-sky-400 uppercase tracking-widest font-extrabold block mb-0.5">
                  Nhật ký truyền dẫn Live
                </span>
                <p className="text-sm font-semibold text-slate-200 leading-snug">
                  {activeStep.description}
                </p>
              </div>
              <div className="text-right flex-shrink-0 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-850">
                <span className="text-xs font-bold text-slate-400 block font-mono">Trạng thái</span>
                <span className="text-xs font-black uppercase text-emerald-400 font-mono tracking-wider">
                  {isPlaying ? 'Đang chạy' : 'Dừng'}
                </span>
              </div>
            </div>
          )}

          {/* Collapsible Teachers Guide Panel */}
          {teacherGuideEnabled && (
            <TeachersGuide
              currentStep={activeStep}
              activeScenario={activeScenario}
              currentStepIndex={currentStepIndex}
            />
          )}
        </div>

        {/* RIGHT COMPONENT COLUMN (CONTROL CORE PANEL + LEGEND) */}
        <div className="lg:col-span-5 flex flex-col gap-6 w-full">
          {/* Main Controls Panel */}
          <ControlPanel
            senderId={senderId}
            receiverId={receiverId}
            currentStepIndex={currentStepIndex}
            steps={steps}
            isPlaying={isPlaying}
            annotationsEnabled={annotationsEnabled}
            onSenderChange={handleSenderChange}
            onReceiverChange={handleReceiverChange}
            onStartSimulation={handleStartSimulation}
            onPauseToggle={handlePauseToggle}
            onResetSimulation={handleResetSimulation}
            onStepChange={handleStepChange}
            onToggleAnnotations={handleToggleAnnotations}
            onSelectScenario={handleSelectScenario}
            activeScenarioId={activeScenarioId}
          />

          {/* Quick Classroom Teaching Manual Cards */}
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 shadow-md flex flex-col gap-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Hướng dẫn giáo án nhanh trên lớp
            </h4>
            <ul className="text-xs text-slate-400 flex flex-col gap-2.5 leading-relaxed">
              <li className="flex gap-2 items-start">
                <span className="bg-slate-950 text-slate-300 w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold shrink-0">1</span>
                <span><b>Chọn kịch bản mẫu:</b> Giáo viên có thể dùng các kịch bản 1, 2, 3, 4 để học sinh quan sát rõ sự khác biệt của cơ chế Switch bảo trì gói tin so với Hub phát rác.</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="bg-slate-950 text-slate-300 w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold shrink-0">2</span>
                <span><b>Giải thích bảng địa chỉ MAC:</b> Khi xem kịch bản 1, khuyên học sinh bật "Chú thích mạng", nhấp vào Switch để đối chiếu <b>Bảng MAC</b> vật lý để họ nhận thức sự định hướng thông minh.</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="bg-slate-950 text-slate-300 w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold shrink-0">3</span>
                <span><b>Câu hỏi thảo luận:</b> Chuyển sang thẻ "Câu hỏi thảo luận lớp" trên bảng lời dẫn để phát hành các câu đố phản biện cho học sinh, mở đáp án trực tiếp để giải nghĩa.</span>
              </li>
            </ul>
          </div>
        </div>

      </main>

      {/* FOOTER SYSTEM STATS - MINIMALIST */}
      <footer className="bg-slate-950 py-6 border-t border-slate-900 mt-auto shrink-0 select-none">
        <div className="max-w-7xl mx-auto px-6 text-center flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-mono">
          <p>© 2026 Học liệu điện tử - Môn Tin học THPT & THCS</p>
          <div className="flex gap-4">
            <span>Tiêu chuẩn: SGK Kết nối tri thức & Cánh diều</span>
            <span>Phiên bản: 2D Interactive LAN Sim v2.1</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
