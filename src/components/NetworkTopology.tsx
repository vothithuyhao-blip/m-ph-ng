import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Server, Layers, Share2, Monitor, CheckCircle2, XCircle, Info, Ban } from 'lucide-react';
import { Device, Connection, SimulationStep, DeviceId } from '../types';

interface NetworkTopologyProps {
  devices: Device[];
  connections: Connection[];
  currentStep: SimulationStep | null;
  annotationsEnabled: boolean;
  senderId: DeviceId;
  receiverId: DeviceId;
  setSenderId: (id: DeviceId) => void;
  setReceiverId: (id: DeviceId) => void;
  isPlaying: boolean;
  onSelectDeviceTooltip: (device: Device | null) => void;
  selectedDeviceTooltip: Device | null;
}

export const NetworkTopology: React.FC<NetworkTopologyProps> = ({
  devices,
  connections,
  currentStep,
  annotationsEnabled,
  senderId,
  receiverId,
  setSenderId,
  setReceiverId,
  isPlaying,
  onSelectDeviceTooltip,
  selectedDeviceTooltip,
}) => {
  // Check if a connection link is active in the current step
  const isLinkActive = (connId: string) => {
    return currentStep?.activeLinks.includes(connId) || false;
  };

  // Check if a packet is traveling between two devices in the current step
  const getPacketsOnLink = (fromId: DeviceId, toId: DeviceId) => {
    if (!currentStep) return [];
    return currentStep.activePackets.filter(
      (p) =>
        (p.from === fromId && p.to === toId) ||
        (p.from === toId && p.to === fromId)
    );
  };

  // Helper to obtain coordinates of a device
  const getDeviceCoords = (id: DeviceId) => {
    const dev = devices.find((d) => d.id === id);
    return dev ? { x: dev.x, y: dev.y } : { x: 0, y: 0 };
  };

  // Check current status of a device in the active step
  const getDeviceStatus = (deviceId: DeviceId) => {
    return currentStep?.deviceStatuses[deviceId] || 'idle';
  };

  const handleDeviceClick = (dev: Device) => {
    if (isPlaying) return; // Prevent changing setup during live animation
    if (annotationsEnabled) {
      onSelectDeviceTooltip(selectedDeviceTooltip?.id === dev.id ? null : dev);
    }
  };

  return (
    <div className="relative w-full overflow-auto custom-scrollbar bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-4 min-h-[500px]">
      {/* Topology Title & Status */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
        <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase font-mono">
          Trực quan hóa sơ đồ mạng LAN (2D Schematic)
        </h3>
        <p className="text-xs text-slate-500 font-mono">
          * Nhấp máy để chọn làm nguồn/đích. Nhấp Switch hoặc Hub để hiển thị thuộc tính.
        </p>
      </div>

      {/* Responsive canvas container */}
      <div className="relative w-[900px] h-[480px] mx-auto mt-4 select-none">
        {/* SVG connection lines (Cáp vật lý) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
          <defs>
            {/* Glow filters for active transmission */}
            <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            {/* Scrolling electron effect keyframes */}
            <style>
              {`
                @keyframes pulse-dash {
                  to {
                    stroke-dashoffset: -20;
                  }
                }
                .active-cable {
                  stroke-dasharray: 6, 4;
                  animation: pulse-dash 1s linear infinite;
                }
              `}
            </style>
          </defs>

          {connections.map((conn) => {
            const fromDev = devices.find((d) => d.id === conn.from);
            const toDev = devices.find((d) => d.id === conn.to);
            if (!fromDev || !toDev) return null;

            const active = isLinkActive(conn.id);

            return (
              <g key={conn.id}>
                {/* Secondary thick glow background line if active */}
                {active && (
                  <line
                    x1={fromDev.x}
                    y1={fromDev.y}
                    x2={toDev.x}
                    y2={toDev.y}
                    stroke="#10B981"
                    strokeWidth="10"
                    strokeLinecap="round"
                    opacity="0.35"
                    filter="url(#glow-green)"
                  />
                )}

                {/* Base solid cable */}
                <line
                  x1={fromDev.x}
                  y1={fromDev.y}
                  x2={toDev.x}
                  y2={toDev.y}
                  stroke={active ? '#10B981' : '#334155'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="transition-colors duration-300"
                />

                {/* Flowing electrons overlay if active */}
                {active && (
                  <line
                    x1={fromDev.x}
                    y1={fromDev.y}
                    x2={toDev.x}
                    y2={toDev.y}
                    stroke="#34D399"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="active-cable"
                  />
                )}

                {/* Render physical ports at the connection points */}
                <circle cx={fromDev.x + (toDev.x - fromDev.x) * 0.1} cy={fromDev.y + (toDev.y - fromDev.y) * 0.1} r="4" fill="#64748B" />
                <circle cx={toDev.x - (toDev.x - fromDev.x) * 0.1} cy={toDev.y - (toDev.y - fromDev.y) * 0.1} r="4" fill="#64748B" />
              </g>
            );
          })}
        </svg>

        {/* Dynamic Flying Packets layer */}
        <AnimatePresence>
          {connections.map((conn) => {
            const packets = getPacketsOnLink(conn.from, conn.to);
            if (packets.length === 0) return null;

            const fromCoords = getDeviceCoords(conn.from);
            const toCoords = getDeviceCoords(conn.to);

            return packets.map((pkt) => {
              // Determine direction logic from SimulationStep state
              const directionReversed = pkt.from === conn.to;
              const startPos = directionReversed ? toCoords : fromCoords;
              const endPos = directionReversed ? fromCoords : toCoords;

              // Color of packet based on its semantic role
              let packetBgColor = 'bg-sky-500'; // Default data
              let label = 'Dữ liệu';

              if (pkt.payload.type === 'broadcast') {
                packetBgColor = 'bg-amber-500';
                label = 'Rác / BC';
              } else if (pkt.payload.type === 'arp') {
                packetBgColor = 'bg-purple-500';
                label = 'Tìm MAC';
              }

              return (
                <motion.div
                  key={`${pkt.id}-${pkt.from}-${pkt.to}`}
                  initial={{
                    x: startPos.x,
                    y: startPos.y,
                    scale: 0.5,
                    opacity: 0,
                  }}
                  animate={{
                    x: endPos.x,
                    y: endPos.y,
                    scale: 1,
                    opacity: 1,
                  }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{
                    duration: 1.8,
                    ease: 'easeInOut',
                  }}
                  className="absolute pointer-events-none z-30"
                  style={{
                    marginLeft: -18,
                    marginTop: -18,
                  }}
                >
                  <div className="relative flex flex-col items-center">
                    {/* Pulsing halo */}
                    <div className={`absolute -inset-1 rounded-full ${packetBgColor} opacity-50 animate-ping`} />
                    
                    {/* Small visual card for the flying frame */}
                    <div className={`flex items-center justify-center p-2 rounded-lg ${packetBgColor} shadow-md border border-white/20 text-white font-mono text-[9px] font-bold uppercase tracking-tight`}>
                      ✉️ {label}
                    </div>
                  </div>
                </motion.div>
              );
            });
          })}
        </AnimatePresence>

        {/* Devices Nodes Layer */}
        {devices.map((dev) => {
          const isSender = senderId === dev.id;
          const isReceiver = receiverId === dev.id;
          const status = getDeviceStatus(dev.id);

          // Custom colors and styling based on device types and states
          let typeColorClass = 'bg-slate-800 border-slate-700 hover:border-slate-600 text-slate-100';
          let iconComponent = <Monitor className="w-6 h-6 text-slate-400" />;

          if (dev.type === 'server') {
            typeColorClass = 'bg-blue-950 border-blue-900 border-2 text-blue-100 hover:border-blue-700';
            iconComponent = <Server className="w-6 h-6 text-blue-400" />;
          } else if (dev.type === 'switch') {
            typeColorClass = 'bg-emerald-950 border-emerald-900 border-2 text-emerald-100 hover:border-emerald-700';
            iconComponent = <Layers className="w-6 h-6 text-emerald-400" />;
          } else if (dev.type === 'hub') {
            typeColorClass = 'bg-indigo-950 border-indigo-900 border-2 text-indigo-100 hover:border-indigo-700';
            iconComponent = <Share2 className="w-6 h-6 text-indigo-400" />;
          }

          // Active states override
          let statusOverlay = null;
          if (status === 'sending') {
            typeColorClass = 'bg-sky-950 border-sky-400 border-2 shadow-[0_0_15px_rgba(56,189,248,0.5)] text-sky-100';
            statusOverlay = (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
              </span>
            );
          } else if (status === 'receiving' || status === 'processing') {
            typeColorClass = 'bg-indigo-950 border-indigo-400 border-2 shadow-[0_0_15px_rgba(129,140,248,0.5)] text-indigo-100';
          } else if (status === 'accepted') {
            typeColorClass = 'bg-emerald-950 border-emerald-400 border-2 shadow-[0_0_20px_rgba(52,211,153,0.7)] text-emerald-100 animate-pulse';
            statusOverlay = (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg">
                <CheckCircle2 className="w-3 h-3" /> Thành công
              </div>
            );
          } else if (status === 'rejected') {
            typeColorClass = 'bg-rose-950 border-rose-400 border-2 shadow-[0_0_15px_rgba(244,63,94,0.6)] text-rose-100';
            statusOverlay = (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-rose-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg">
                <XCircle className="w-3 h-3" /> Từ chối
              </div>
            );
          } else if (status === 'filtered') {
            typeColorClass = 'bg-slate-900 border-amber-500 border-2 shadow-[0_0_15px_rgba(245,158,11,0.5)] text-amber-200';
            statusOverlay = (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg">
                <Ban className="w-3 h-3" /> Lọc / Hủy rác
              </div>
            );
          }

          // Special highlight border for current sender/receiver configuration
          let selectorBadge = null;
          if (!isPlaying) {
            if (isSender) {
              selectorBadge = (
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-sky-500 text-slate-950 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider shadow">
                  Nguồn
                </div>
              );
            } else if (isReceiver) {
              selectorBadge = (
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider shadow">
                  Đích
                </div>
              );
            }
          }

          return (
            <div
              key={dev.id}
              id={`device-${dev.id}`}
              onClick={() => handleDeviceClick(dev)}
              className={`absolute cursor-pointer rounded-xl p-3 border shadow-md transition-all duration-300 w-44 select-none ${typeColorClass}`}
              style={{
                left: dev.x,
                top: dev.y,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Status indicators */}
              {statusOverlay}
              {selectorBadge}

              {/* Node Contents */}
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-slate-950/40">
                  {iconComponent}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold truncate text-slate-100 font-sans">
                    {dev.name}
                  </h4>
                  {dev.ipAddress && (
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                      IP: {dev.ipAddress}
                    </p>
                  )}
                  {dev.macAddress && (
                    <p className="text-[9px] font-mono text-slate-500 truncate">
                      MAC: {dev.macAddress}
                    </p>
                  )}
                </div>
              </div>

              {/* Highlight active selection click setup triggers (Only when NOT running animation) */}
              {!isPlaying && dev.type !== 'switch' && dev.type !== 'hub' && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between gap-1 text-[10px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (receiverId === dev.id) return;
                      setSenderId(dev.id);
                    }}
                    disabled={isSender}
                    className={`flex-1 text-center py-1 rounded transition-colors ${
                      isSender
                        ? 'bg-sky-500/20 text-sky-400 font-semibold'
                        : 'bg-slate-950/60 hover:bg-sky-950/50 text-slate-400 hover:text-sky-300'
                    }`}
                  >
                    Chọn gửi
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (senderId === dev.id) return;
                      setReceiverId(dev.id);
                    }}
                    disabled={isReceiver}
                    className={`flex-1 text-center py-1 rounded transition-colors ${
                      isReceiver
                        ? 'bg-emerald-500/20 text-emerald-400 font-semibold'
                        : 'bg-slate-950/60 hover:bg-emerald-950/50 text-slate-400 hover:text-emerald-300'
                    }`}
                  >
                    Chọn nhận
                  </button>
                </div>
              )}

              {/* Tiny Port tags mapping indicators for Switch and Hub */}
              {(dev.type === 'switch' || dev.type === 'hub') && (
                <div className="mt-2.5 pt-2 border-t border-slate-700/40 flex flex-wrap gap-1 items-center justify-center">
                  <span className="text-[9px] bg-slate-950 text-slate-400 px-1 py-0.5 rounded font-mono uppercase">
                    {dev.type === 'switch' ? '4 Cổng MAC' : '3 Cổng Repeater'}
                  </span>
                </div>
              )}

              {/* Highlight click to view on device tooltip indicator */}
              {annotationsEnabled && (dev.type === 'switch' || dev.type === 'hub') && (
                <div className="absolute top-1 right-1">
                  <Info className="w-3.5 h-3.5 text-slate-500 animate-pulse hover:text-slate-300" />
                </div>
              )}
            </div>
          );
        })}

        {/* Dynamic Details Overlay Panel triggered by selecting a Switch or Hub */}
        {selectedDeviceTooltip && annotationsEnabled && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="absolute bottom-4 left-4 right-4 bg-slate-950/95 border-2 border-indigo-500 text-slate-100 rounded-xl p-4 z-40 shadow-2xl backdrop-blur-md font-sans"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-indigo-500/20 text-indigo-400">
                  {selectedDeviceTooltip.type === 'switch' ? <Layers className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                </span>
                <h4 className="text-base font-bold text-indigo-300">
                  {selectedDeviceTooltip.name} ({selectedDeviceTooltip.type.toUpperCase()})
                </h4>
              </div>
              <button
                onClick={() => onSelectDeviceTooltip(null)}
                className="text-xs text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 px-2 py-1 rounded"
              >
                Đóng ✕
              </button>
            </div>
            <p className="text-sm text-slate-300 mb-3">{selectedDeviceTooltip.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs border-t border-slate-800 pt-3">
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Cơ chế hoạt động lớp (OSI Layer):
                </span>
                <p className="text-slate-300 font-mono">
                  {selectedDeviceTooltip.type === 'switch'
                    ? '• Lớp 2 (Data Link): Có bộ nhớ kênh đệm MAC'
                    : '• Lớp 1 (Physical): Nhân bản điện áp đường truyền vật lý'}
                </p>
              </div>

              {selectedDeviceTooltip.type === 'switch' ? (
                <div>
                  <span className="font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                    Bảng địa chỉ MAC tích hợp (MAC Table):
                  </span>
                  <table className="w-full text-left font-mono text-[11px] text-slate-300 bg-slate-900/60 rounded">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="p-1">Cổng (Port)</th>
                        <th className="p-1">Địa chỉ MAC</th>
                        <th className="p-1">Thiết bị</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-1 border-r border-slate-800 text-emerald-400">Cổng 1</td>
                        <td className="p-1 border-r border-slate-800">00:1A:2B:3C:4D:00</td>
                        <td className="p-1 text-slate-300">Máy chủ (Server)</td>
                      </tr>
                      <tr>
                        <td className="p-1 border-r border-slate-800 text-emerald-400">Cổng 2</td>
                        <td className="p-1 border-r border-slate-800">00:1A:2B:3C:4D:01</td>
                        <td className="p-1 text-slate-300">PC A</td>
                      </tr>
                      <tr>
                        <td className="p-1 border-r border-slate-800 text-emerald-400">Cổng 3</td>
                        <td className="p-1 border-r border-slate-800">00:1A:2B:3C:4D:02</td>
                        <td className="p-1 text-slate-300">PC B</td>
                      </tr>
                      <tr>
                        <td className="p-1 border-r border-slate-800 text-emerald-400">Cổng 4</td>
                        <td className="p-1 border-r border-slate-800">Đã định tuyến Hub</td>
                        <td className="p-1 text-slate-400">Nhánh PC C, D</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div>
                  <span className="font-bold text-amber-400 uppercase tracking-wider block mb-1">
                    Đặc tính Hub:
                  </span>
                  <p className="text-amber-300">
                    ⚠️ Không học địa chỉ MAC. Luôn broadcast đến toàn bộ cổng (trừ cổng nhận nguồn). 
                    Dẫn tới hao phí băng thông và nguy cơ xung đột (Collision Domain).
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
