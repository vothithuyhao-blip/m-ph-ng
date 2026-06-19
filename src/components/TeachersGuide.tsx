import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, AlertCircle, HelpCircle, CheckCircle, ChevronDown, ChevronUp, Copy, BookOpenCheck } from 'lucide-react';
import { SimulationStep, TeachingScenario } from '../types';

interface TeachersGuideProps {
  currentStep: SimulationStep | null;
  activeScenario: TeachingScenario | null;
  currentStepIndex: number;
}

export const TeachersGuide: React.FC<TeachersGuideProps> = ({
  currentStep,
  activeScenario,
  currentStepIndex,
}) => {
  const [activeTab, setActiveTab] = useState<'script' | 'concepts' | 'quiz'>('script');
  const [expandedQuiz, setExpandedQuiz] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Preloaded classic classroom interactive questions based on Computer Network textbook standard (SGK)
  const DISCUSSION_QUESTIONS = [
    {
      question: '1. Tại sao Hub lại phát tín hiệu tới tất cả các cổng khi chỉ có một máy nhận?',
      answer: 'Hub hoạt động ở Lớp 1 (Vật lý). Nó không có bộ xử lý thông tin để lưu trữ bảng địa chỉ MAC và không hiểu cấu trúc gói tin. Nó chỉ đơn thuần lấy tín hiệu điện ở cổng vào, khuếch đại lên rồi truyền sang toàn bộ các cổng vật lý khác.',
      hints: 'Liên hệ tivi quảng bá truyền hình analog so với cuộc gọi điện thoại riêng tư.'
    },
    {
      question: '2. Làm thế nào Switch biết được gói tin cần gửi chính xác đến cổng nào?',
      answer: 'Switch hoạt động ở Lớp 2 (Liên kết dữ liệu). Nó tích hợp bộ nhớ chứa Bảng Địa Chỉ MAC (MAC Address Table). Khi thiết bị gửi truyền tin, Switch ghi nhận MAC nguồn vào bảng. Khi nhận gói tin đích, Switch tra cứu bảng này để tìm cổng tương ứng và truyền trực tiếp.',
      hints: 'Bảng địa chỉ MAC hoạt động giống như danh bạ điện thoại lưu số nhà tương ứng với số phòng.'
    },
    {
      question: '3. Trong mô phỏng, tại sao khi PC C gửi tin cho PC D, Switch lại nhận được rác nhưng sau đó báo đỏ "Lọc/Hủy rác"?',
      answer: 'Do PC C nối với Hub, Hub quảng bá tới cả PC D lẫn Switch. Khi gói tin rác đi tới Switch, Switch kiểm tra thấy MAC đích (PC D) cũng đang nằm trên cổng 4 (cổng vừa nhận gói tin). Switch nhận ra gói này thuộc nội bộ mạng Hub và không có ích gì cho phần còn lại, nên nó tự chặn bỏ, chống nghẽn mạng.',
      hints: 'Đây là vai trò "Lọc rác" cực kỳ quan trọng của Switch khi ghép nối các đoạn mạng lai.'
    },
    {
      question: '4. Đường truyền dây cáp sáng nhấp nháy chuyển động biểu thị điều gì ngoài đời thực?',
      answer: 'Đó là biểu thị của các tín hiệu điện (trong cáp đồng xoắn đôi) hoặc xung ánh sáng (trong cáp quang) mang mã nhị phân 0 và 1 truyền tải dữ liệu với tốc độ cao trong mạng LAN.',
      hints: 'Băng thông mạng đo bằng Megabit trên giây (Mbps) hoặc Gigabit trên giây (Gbps).'
    }
  ];

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl w-full flex flex-col gap-5">
      {/* Header and Toggle Label */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-indigo-400" />
          <h2 className="text-lg font-bold text-slate-100 font-sans">
            Bảng Lời Dẫn và Bài Giảng cho Giáo Viên
          </h2>
        </div>
        <span className="text-xs bg-indigo-950/80 text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-900 font-mono font-bold">
          Tích hợp bài dạy SGK
        </span>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-950 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('script')}
          className={`flex-1 text-center py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'script'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🎙️ Lời giảng trực quan
        </button>
        <button
          onClick={() => setActiveTab('concepts')}
          className={`flex-1 text-center py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'concepts'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          📖 Khái niệm cốt lõi
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 text-center py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'quiz'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          ❓ Câu hỏi thảo luận lớp
        </button>
      </div>

      {/* Tab Contents */}
      <div className="min-h-[260px]">
        {/* TAB 1: SCRIPT & LIVE TELEPROMPTER */}
        {activeTab === 'script' && (
          <div className="flex flex-col gap-4">
            {/* Live narrative narration context */}
            <div className="bg-slate-950 border-l-4 border-indigo-500 rounded-r-xl p-4">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1.5 font-mono">
                Thuyết minh Tiến trình (Dành cho Máy chiếu/Tivi)
              </h4>
              <p className="text-base text-slate-100 leading-relaxed font-medium">
                {currentStep?.narrativeText || 'Vui lòng chọn Thiết bị gửi & nhận và nhấn nút "Gửi dữ liệu" để xem thuyết minh trực quan.'}
              </p>
            </div>

            {/* Teaching script teleprompter suggestions matching active scenario */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                💬 Gợi ý lời nói của giáo viên tại lớp học:
              </h4>

              {activeScenario ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs text-indigo-400 font-bold mb-1">
                    <span>Kịch bản: {activeScenario.title}</span>
                    <span>Ý tưởng thảo luận ({currentStepIndex + 1}/{activeScenario.teacherScript.length ? activeScenario.teacherScript.length : 4})</span>
                  </div>
                  
                  {/* Pull script based on step bounds safely */}
                  {activeScenario.teacherScript && activeScenario.teacherScript.length > 0 ? (
                    (() => {
                      // fallback to step index or clamp to max script size
                      const scriptIdx = Math.min(currentStepIndex, activeScenario.teacherScript.length - 1);
                      const speech = activeScenario.teacherScript[scriptIdx];
                      return (
                        <div className="flex gap-3 justify-between items-start">
                          <p className="text-sm text-indigo-200 italic leading-relaxed flex-1">
                            {`"${speech || 'Tiếp tục mô tả quá trình cho học sinh dựa trên đồ họa đang sáng lên.'}"`}
                          </p>
                          <button
                            onClick={() => handleCopyText(speech, scriptIdx)}
                            className="bg-slate-950 border border-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg ml-2"
                            title="Sao chép câu nói"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })()
                  ) : (
                    <p className="text-sm text-slate-500 italic">
                      Không có tài liệu lời dẫn cố định cho kịch bản tự do này.
                    </p>
                  )}
                  {copiedIndex !== null && (
                    <span className="text-[10px] text-emerald-400 text-right font-mono animate-fade-in self-end">
                      ✓ Đã sao chép vào khay nhớ tạm!
                    </span>
                  )}
                </div>
              ) : (
                <div className="bg-slate-950 text-slate-400 text-sm italic rounded-xl p-4 border border-slate-850">
                  ⚡ Giáo viên hãy bấm chọn một trong bốn <b>Kịch bản giảng dạy mẫu</b> ở phía trên để kích hoạt máy nhắc lời nói giáo viên tương ứng theo từng bước chuyển gói tin!
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: THEORY CONCEPTS SUMMARY */}
        {activeTab === 'concepts' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <h4 className="text-sm font-bold font-sans">Mạng LAN là gì?</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Mạng máy tính cục bộ (Local Area Network) kết nối các thiết bị trong không gian nhỏ (trường học, văn phòng). Giúp chia sẻ tài nguyên cáp, tệp tin và dùng chung máy in.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <h4 className="text-sm font-bold font-sans">Bộ chuyển mạch (Switch)</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Thiết bị kết nối trung tâm thông minh. Khả năng đọc địa chỉ MAC của gói tin để định tuyến chính xác dữ liệu qua cổng đích, bảo mật tốt, tránh xung đột và nâng cao hiệu năng.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-indigo-400">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <h4 className="text-sm font-bold font-sans">Bộ tập trung (Hub)</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Thiết bị kết nối thô sơ. Hub chỉ chuyển tiếp xung điện thô sơ qua toàn bộ các cổng khác một cách vô điều kiện (phát tán - broadcast), gây chiếm băng thông mạng quá mức.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: INTERACTIONS QUESTIONS & DISCUSSIONS */}
        {activeTab === 'quiz' && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-slate-400 italic mb-1.5">
              💡 Bấm vào từng câu hỏi dưới đây để mở lời giải thích chi tiết nâng cao giúp giảng dạy trên máy chiếu nhanh chóng:
            </p>

            <div className="flex flex-col gap-2.5">
              {DISCUSSION_QUESTIONS.map((q, idx) => {
                const isExpanded = expandedQuiz === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950"
                  >
                    <button
                      onClick={() => setExpandedQuiz(isExpanded ? null : idx)}
                      className="w-full flex items-center justify-between p-3.5 text-left font-sans font-bold text-sm text-slate-150 hover:bg-slate-900 transition-colors"
                    >
                      <span className="flex items-center gap-2.5 flex-1 select-none text-slate-100">
                        <HelpCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        {q.question}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 flex-shrink-0 text-slate-400" /> : <ChevronDown className="w-4 h-4 flex-shrink-0 text-slate-400" />}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-slate-900 bg-slate-900/40"
                        >
                          <div className="p-4 flex flex-col gap-3 text-xs leading-relaxed">
                            <p className="text-indigo-200">
                              <b>🟢 Câu trả lời mẫu:</b> {q.answer}
                            </p>
                            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 flex gap-2 text-slate-400">
                              <span className="text-amber-400 font-bold font-mono">Gợi ý dạy:</span>
                              <p className="italic text-slate-300">{q.hints}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
