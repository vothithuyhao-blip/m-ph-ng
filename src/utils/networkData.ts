import { Device, Connection, TeachingScenario } from '../types';

export const DEVICES: Device[] = [
  {
    id: 'server',
    name: 'Máy chủ (Server)',
    type: 'server',
    ipAddress: '192.168.1.100',
    macAddress: '00:1A:2B:3C:4D:00',
    x: 180,
    y: 80,
    portConnections: { 1: 'switch' },
    description: 'Nơi lưu trữ dữ liệu trung tâm của mạng, cung cấp dịch vụ như Web, Mail, File và cấp phát IP.',
    details: 'Được kết nối vào Cổng 1 của Switch. Trong một mảng LAN công nghiệp, máy chủ chịu trách nhiệm xử lý các luồng công việc nặng và kiểm soát quyền truy cập.'
  },
  {
    id: 'switch',
    name: 'Bộ chuyển mạch (Switch)',
    type: 'switch',
    x: 390,
    y: 180,
    portConnections: { 1: 'server', 2: 'pc_a', 3: 'pc_b', 4: 'hub' },
    description: 'Thiết bị kết nối thông minh ở lớp 2 (Data Link). Chỉ chuyển tiếp dữ liệu tới đúng thiết bị nhận dựa vào bảng địa chỉ MAC.',
    details: 'Trong sơ đồ này, Switch có 4 cổng hoạt động. Cổng 1 kết nối Máy chủ, Cổng 2 kết nối PC A, Cổng 3 kết nối PC B, và Cổng 4 kết nối sang Hub. Khi nhận gói tin, Switch đọc MAC đích để chọn cổng tương ứng, giúp giảm thiểu xung đột dữ liệu.'
  },
  {
    id: 'hub',
    name: 'Bộ tập trung (Hub)',
    type: 'hub',
    x: 640,
    y: 290,
    portConnections: { 1: 'switch', 2: 'pc_c', 3: 'pc_d' },
    description: 'Thiết bị kết nối thô sơ ở lớp 1 (Physical). Khi nhận gói tin, Hub nhân bản và phát tán (broadcast) ra toàn bộ các cổng khác.',
    details: 'Hub kết nối đoạn mạng thứ hai gồm PC C và PC D vào cổng phụ thông qua cáp liên kết Switch. Hub không thể đọc địa chỉ MAC, dẫn tới tình trạng dư thừa gói tin và khả năng gây nghẽn mạng trên các thiết bị không liên quan.'
  },
  {
    id: 'pc_a',
    name: 'Máy trạm A (PC A)',
    type: 'workstation',
    ipAddress: '192.168.1.1',
    macAddress: '00:1A:2B:3C:4D:01',
    x: 180,
    y: 290,
    portConnections: { 1: 'switch' },
    description: 'Máy tính của người dùng thuộc phân đoạn mạng Switch thông minh.',
    details: 'Kết nối trực tiếp vào Cổng 2 của Switch.'
  },
  {
    id: 'pc_b',
    name: 'Máy trạm B (PC B)',
    type: 'workstation',
    ipAddress: '192.168.1.2',
    macAddress: '00:1A:2B:3C:4D:02',
    x: 340,
    y: 370,
    portConnections: { 1: 'switch' },
    description: 'Máy tính trạm thứ hai được đấu nối trực tiếp vào phân đoạn Switch thông minh.',
    details: 'Kết nối trực tiếp vào Cổng 3 của Switch.'
  },
  {
    id: 'pc_c',
    name: 'Máy trạm C (PC C)',
    type: 'workstation',
    ipAddress: '192.168.1.3',
    macAddress: '00:1A:2B:3C:4D:03',
    x: 550,
    y: 410,
    portConnections: { 1: 'hub' },
    description: 'Máy tính trạm ở phân đoạn Hub (truyền thông quảng bá vật lý).',
    details: 'Kết nối vào Cổng 2 của Hub. Nhận mọi gói tin do Hub khuếch đại, ngay cả khi gói tin đó không gửi cho mình.'
  },
  {
    id: 'pc_d',
    name: 'Máy trạm D (PC D)',
    type: 'workstation',
    ipAddress: '192.168.1.4',
    macAddress: '00:1A:2B:3C:4D:04',
    x: 770,
    y: 410,
    portConnections: { 1: 'hub' },
    description: 'Máy tính trạm thứ hai ở phân đoạn Hub, chia sẻ chung một xung đột mạng.',
    details: 'Kết nối vào Cổng 3 của Hub. Phải tự lọc bỏ các gói tin không trùng khớp địa chỉ MAC của mình.'
  }
];

export const CONNECTIONS: Connection[] = [
  { id: 'conn_server_switch', from: 'server', to: 'switch', fromPortName: 'Cổng LAN', toPortName: 'Cổng 1' },
  { id: 'conn_pca_switch', from: 'pc_a', to: 'switch', fromPortName: 'Cổng LAN', toPortName: 'Cổng 2' },
  { id: 'conn_pcb_switch', from: 'pc_b', to: 'switch', fromPortName: 'Cổng LAN', toPortName: 'Cổng 3' },
  { id: 'conn_switch_hub', from: 'switch', to: 'hub', fromPortName: 'Cổng 4', toPortName: 'Cổng 1' },
  { id: 'conn_pcc_hub', from: 'pc_c', to: 'hub', fromPortName: 'Cổng LAN', toPortName: 'Cổng 2' },
  { id: 'conn_pcd_hub', from: 'pc_d', to: 'hub', fromPortName: 'Cổng LAN', toPortName: 'Cổng 3' }
];

export const TEACHING_SCENARIOS: TeachingScenario[] = [
  {
    id: 'scenario_switch_direct',
    title: '1. Truyền thông minh (PC A gửi đến Máy chủ qua Switch)',
    description: 'Minh họa cơ chế lọc địa chỉ MAC thông minh của Switch. Gói tin chỉ đi thẳng từ Máy trạm A qua Switch đến trực tiếp Máy chủ, các máy khác không chịu ảnh hưởng.',
    senderId: 'pc_a',
    receiverId: 'server',
    teacherScript: [
      'Bắt đầu bài giảng bằng cách đưa gói tin từ Máy trạm A gửi lên Máy chủ.',
      'Quan sát kỹ: Khi gói tin lên đến Switch, Switch phân tích bảng địa chỉ MAC và lập tức nhận ra Máy chủ đang ở Cổng 1.',
      'Hãy nhấn mạnh với học sinh rằng gói tin chỉ truyền sang Cổng 1 nối tiếp Máy chủ. Cổng 3 (PC B) và Cổng 4 (Hub) hoàn toàn không nhận tín hiệu thừa. Đây là sự khác biệt lớn của Switch!',
      'Học sinh sẽ nhận ra ưu điểm: Bảo mật tốt hơn, băng thông tối ưu, không có xung đột xảy ra.'
    ]
  },
  {
    id: 'scenario_hub_broadcast',
    title: '2. Phát tán vật lý (PC C gửi đến PC D qua Hub)',
    description: 'Minh họa cách hoạt động thô sơ của Hub. Khi PC C gửi dữ liệu mạng, Hub nhận được và buộc phải sao chép gói tin ra tất cả các ngõ ra còn lại, bao gồm cả ngõ Switch.',
    senderId: 'pc_c',
    receiverId: 'pc_d',
    teacherScript: [
      'Hướng dẫn học sinh chú ý phân đoạn kết nối Hub bên phải.',
      'Khi PC C phát gói tin lên Hub, thiết bị này sao chép và đồng thời đẩy tín hiệu xuống PC D và sang Switch.',
      'Lưu ý học sinh: PC D kiểm tra thấy trùng khớp địa chỉ MAC của mình nên chấp nhận gói tin (Biểu tượng tích xanh).',
      'Trong lúc đó, Switch cũng nhận gói tin từ Hub. Switch nhận dạng được địa chỉ MAC đích là PC D vốn đã thuộc ngõ Hub, nên Switch học địa chỉ và lọc bỏ gói tin tại đây mà không đẩy ngược lại các PC thông minh khác. Điều này bảo vệ phân đoạn Switch khỏi sóng rác Hub.'
    ]
  },
  {
    id: 'scenario_hybrid_transmission',
    title: '3. Truyền hỗn hợp (PC A gửi đến PC C)',
    description: 'Sau quá trình Switch định tuyến thông minh sang cổng Hub, Hub tiếp tục thực hiện broadcast. Bài học kết hợp nâng cao về vai trò lai giữa Switch lọc rác và Hub quảng bá.',
    senderId: 'pc_a',
    receiverId: 'pc_c',
    teacherScript: [
      'Gói tin xuất phát từ PC A gửi đến cổng đích PC C.',
      'Đầu tiên, Switch tiếp nhận gói tin từ đối tượng thông minh PC A. Switch biết PC C nằm ở cổng số 4 (phía sau Hub), do đó nó chỉ chuyển gói tin qua cổng 4.',
      'Khi gói tin đến Hub, do Hub không có bộ nhớ MAC, Hub broadcast gói tin tới đồng thời PC C (đích thực sự) và PC D (người nghe ngoài ý muốn).',
      'Giải thích cho học sinh: PC D nhận gói tin vô ích, mở header kiểm tra thấy không trùng địa chỉ vật lý nên báo đỏ hủy bỏ. PC C tiếp nhận bình thường.',
      'Qua đây, giáo viên phân tích: Sử dụng Hub làm suy giảm tính riêng tư và gây lãng phí tài nguyên của PC D.'
    ]
  },
  {
    id: 'scenario_hub_to_switch',
    title: '4. Từ Hub sang Switch (PC C gửi đến PC B)',
    description: 'Học sinh hiểu cách mạng LAN hoạt động hai chiều nối tiếp. Hub nhận xung truyền hình rồi phát trực tiếp, Switch sau đó chặn rác rồi định hướng thông minh.',
    senderId: 'pc_c',
    receiverId: 'pc_b',
    teacherScript: [
      'Kịch bản này thể hiện sự tương tác đa lớp thiết bị.',
      'PC C (đầu cắm Hub) gửi tin đến PC B (đầu cắm Switch).',
      'Bước 1: Hub nhận tin và broadcast cực kỳ thô sơ tới cả PC D và Switch.',
      'Bước 2: PC D kiểm tra địa chỉ và từ chối vì không khớp địa chỉ.',
      'Bước 3: Gói tin đến Switch. Switch tinh khôn phát hiện địa chỉ MAC đích của PC B đang nằm ở Cổng 3 riêng của mình. Switch liền gửi độc quyền gói tin đó cho PC B mà không gửi sang Máy chủ (Cổng 1) hay PC A (Cổng 2).',
      'Đúc kết: Dù khởi đầu bằng quảng bá lãng phí ở nhánh Hub, nhánh Switch vẫn được vận hành thông minh và an toàn tối đa.'
    ]
  }
];
