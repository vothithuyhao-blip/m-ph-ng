import { DeviceId, SimulationStep } from '../types';
import { DEVICES } from './networkData';

/**
 * Returns whether a device is connected directly to Switch vs Hub.
 */
function getDeviceParent(id: DeviceId): 'switch' | 'hub' | 'root' {
  if (id === 'server' || id === 'pc_a' || id === 'pc_b') return 'switch';
  if (id === 'pc_c' || id === 'pc_d') return 'hub';
  return 'root';
}

export function generateSimulationSteps(senderId: DeviceId, receiverId: DeviceId): SimulationStep[] {
  const steps: SimulationStep[] = [];
  const senderName = DEVICES.find(d => d.id === senderId)?.name || '';
  const receiverName = DEVICES.find(d => d.id === receiverId)?.name || '';

  const senderParent = getDeviceParent(senderId);
  const receiverParent = getDeviceParent(receiverId);

  // Helper to init step structure
  const initStep = (idx: number, desc: string, narr: string): SimulationStep => ({
    stepIndex: idx,
    description: desc,
    activeLinks: [],
    activePackets: [],
    deviceStatuses: {},
    narrativeText: narr,
  });

  // --- STEP 0: Khởi tạo ---
  const step0 = initStep(
    0,
    'Khởi tạo truyền tin',
    `Thiết bị gửi [${senderName}] chuẩn bị truyền dữ liệu để gửi tới thiết bị nhận [${receiverName}]. Gói tin chứa địa chỉ IP nguồn/đích và địa chỉ MAC vật lý nguồn/đích tương ứng.`
  );
  step0.deviceStatuses[senderId] = 'sending';
  step0.deviceStatuses[receiverId] = 'idle';
  steps.push(step0);

  // --- CASES DEPENDING ON PATHS ---

  if (senderParent === 'switch' && receiverParent === 'switch') {
    // CASE 1: Switch direct segment (e.g., PC A to Server, PC A to PC B, Server to PC B)
    
    // Step 1: Sender -> Switch
    const s1Link = senderId === 'server' ? 'conn_server_switch' : `conn_${senderId}_switch`;
    const step1 = initStep(
      1,
      'Gửi lên bộ chuyển mạch (Switch)',
      `Gói tin di chuyển dọc theo đường cáp vật lý từ ${senderName} đi vào cổng kết nối riêng của Switch.`
    );
    step1.activeLinks = [s1Link];
    step1.activePackets = [{
      id: 'pkt_1',
      from: senderId,
      to: 'switch',
      state: 'sending',
      payload: { senderId, receiverId, type: 'data' }
    }];
    step1.deviceStatuses[senderId] = 'sending';
    step1.deviceStatuses['switch'] = 'processing';
    steps.push(step1);

    // Step 2: Switch Processing
    const step2 = initStep(
      2,
      'Switch kiểm tra bảng MAC',
      `Switch tiếp nhận gói tin tại cổng dịch vụ. Switch đọc thông tin địa chỉ MAC đích thiết bị, đối chiếu với [Bảng địa chỉ MAC] tích hợp của nó và tìm thấy cổng đích tối ưu kết nối với ${receiverName}.`
    );
    step2.deviceStatuses['switch'] = 'processing';
    steps.push(step2);

    // Step 3: Switch -> Receiver
    const s3Link = receiverId === 'server' ? 'conn_server_switch' : `conn_${receiverId}_switch`;
    const step3 = initStep(
      3,
      'Switch chuyển hướng thông minh',
      `Switch đóng vai trò thông minh: nó kích hoạt duy nhất cổng kết nối của ${receiverName} và chuyển tiếp gói tin độc quyền. Các máy tính khác trong mạng không hề bị ảnh hưởng.`
    );
    step3.activeLinks = [s3Link];
    step3.activePackets = [{
      id: 'pkt_2',
      from: 'switch',
      to: receiverId,
      state: 'sending',
      payload: { senderId, receiverId, type: 'data' }
    }];
    step3.deviceStatuses['switch'] = 'sending';
    step3.deviceStatuses[receiverId] = 'receiving';
    steps.push(step3);

    // Step 4: Finished Accept
    const step4 = initStep(
      4,
      'Đích nhận thành công',
      `Thiết bị nhận [${receiverName}] nhận gói tin, đối chiếu kiểm tra IP đích chính xác trùng khớp. Một tín hiệu phản hồi xanh báo nhận gói dữ liệu an toàn thành công!`
    );
    step4.deviceStatuses[receiverId] = 'accepted';
    steps.push(step4);

  } else if (senderParent === 'switch' && receiverParent === 'hub') {
    // CASE 2: Switch to Hub (e.g., PC A to PC C)

    // Step 1: Sender -> Switch
    const s1Link = senderId === 'server' ? 'conn_server_switch' : `conn_${senderId}_switch`;
    const step1 = initStep(
      1,
      'Gửi lên bộ chuyển mạch (Switch)',
      `Gói tin di chuyển dọc cáp kết nôi từ [${senderName}] lên bộ đầu lọc cơ sở của Switch.`
    );
    step1.activeLinks = [s1Link];
    step1.activePackets = [{
      id: 'pkt_1',
      from: senderId,
      to: 'switch',
      state: 'sending',
      payload: { senderId, receiverId, type: 'data' }
    }];
    step1.deviceStatuses[senderId] = 'sending';
    step1.deviceStatuses['switch'] = 'processing';
    steps.push(step1);

    // Step 2: Switch Lookup
    const step2 = initStep(
      2,
      'Switch lọc cổng ngõ Hub',
      `Switch tra địa chỉ MAC thấy đích đến là [${receiverName}] nằm ở phân đoạn mạng liên kết Cổng số 4. Switch tiến hành chuẩn bị đẩy dữ liệu sang nhánh này.`
    );
    step2.deviceStatuses['switch'] = 'processing';
    steps.push(step2);

    // Step 3: Switch -> Hub
    const step3 = initStep(
      3,
      'Chuyển tiếp đến Hub',
      `Gói tin được chuyển tải qua tuyến cáp liên kết cổng 4 từ bộ chuyển mạch Switch sang Hub đầu nhánh.`
    );
    step3.activeLinks = ['conn_switch_hub'];
    step3.activePackets = [{
      id: 'pkt_2',
      from: 'switch',
      to: 'hub',
      state: 'sending',
      payload: { senderId, receiverId, type: 'data' }
    }];
    step3.deviceStatuses['switch'] = 'sending';
    step3.deviceStatuses['hub'] = 'processing';
    steps.push(step3);

    // Step 4: Hub Broadcast (We send to BOTH PC C and PC D)
    const otherHubDevice = receiverId === 'pc_c' ? 'pc_d' : 'pc_c';
    const step4 = initStep(
      4,
      'Hub nhân bản phát tán (Broadcast)',
      `Hub nhận gói dữ liệu nhưng do thiết kế vật lý thô sơ, Hub không đọc được MAC. Nó bắt buộc nhân bản gói tin thành nhiều luồng và phát tán (broadcast) đồng loạt ra cổng kết nối của cả PC C và PC D.`
    );
    step4.activeLinks = ['conn_pcc_hub', 'conn_pcd_hub'];
    step4.activePackets = [
      {
        id: 'pkt_hub_target',
        from: 'hub',
        to: receiverId,
        state: 'sending',
        payload: { senderId, receiverId, type: 'data' }
      },
      {
        id: 'pkt_hub_other',
        from: 'hub',
        to: otherHubDevice,
        state: 'sending',
        payload: { senderId, receiverId, type: 'broadcast' }
      }
    ];
    step4.deviceStatuses['hub'] = 'sending';
    step4.deviceStatuses[receiverId] = 'receiving';
    step4.deviceStatuses[otherHubDevice] = 'receiving';
    steps.push(step4);

    // Step 5: Accept / Reject
    const step5 = initStep(
      5,
      'Nhận diện địa chỉ thiết bị',
      `Gói tin hạ cánh đồng thời: Thiết bị đích nhận dạng trùng thông tin nên phê duyệt nhận gói dữ liệu (Tích xanh), máy trạm còn lại hủy bỏ vì sai thông tin MAC đích (Dấu X đỏ).`
    );
    step5.deviceStatuses[receiverId] = 'accepted';
    step5.deviceStatuses[otherHubDevice] = 'rejected';
    steps.push(step5);

  } else if (senderParent === 'hub' && receiverParent === 'switch') {
    // CASE 3: Hub to Switch (e.g., PC C to PC A)

    // Step 1: Sender -> Hub
    const step1 = initStep(
      1,
      'Gửi lên thiết bị Hub (Bộ tập trung)',
      `Gói tin từ máy trạm khởi tạo mạng truyền theo cáp cổng cắm riêng lên Hub.`
    );
    step1.activeLinks = [`conn_${senderId}_hub`];
    step1.activePackets = [{
      id: 'pkt_1',
      from: senderId,
      to: 'hub',
      state: 'sending',
      payload: { senderId, receiverId, type: 'data' }
    }];
    step1.deviceStatuses[senderId] = 'sending';
    step1.deviceStatuses['hub'] = 'processing';
    steps.push(step1);

    // Step 2: Hub Broadcasts to other device AND Switch
    const siblingWorkstation = senderId === 'pc_c' ? 'pc_d' : 'pc_c';
    const step2 = initStep(
      2,
      'Hub nhân bản phát tán toàn nhánh',
      `Hub nhân bản tín hiệu vừa nhận và broadcast tới hai ngõ ra còn lại: Một ngõ nối trực tiếp máy bên cạnh [${DEVICES.find(d => d.id === siblingWorkstation)?.name}], một ngõ đi ngược lại liên kết với Switch thông minh.`
    );
    step2.activeLinks = [`conn_${siblingWorkstation}_hub`, 'conn_switch_hub'];
    step2.activePackets = [
      {
        id: 'pkt_hub_sibling',
        from: 'hub',
        to: siblingWorkstation,
        state: 'sending',
        payload: { senderId, receiverId, type: 'broadcast' }
      },
      {
        id: 'pkt_hub_switch',
        from: 'hub',
        to: 'switch',
        state: 'sending',
        payload: { senderId, receiverId, type: 'data' }
      }
    ];
    step2.deviceStatuses['hub'] = 'sending';
    step2.deviceStatuses[siblingWorkstation] = 'receiving';
    step2.deviceStatuses['switch'] = 'processing';
    steps.push(step2);

    // Step 3: Neighbor rejects, Switch analyzes
    const step3 = initStep(
      3,
      'Nhánh Hub từ chối, Switch học MAC',
      `Máy trạm cạnh bên [${DEVICES.find(d => d.id === siblingWorkstation)?.name}] phát hiện không phải địa chỉ của mình nên hủy gói tin (Màu đỏ). Trong khi đó, Switch nhận gói tin và bắt đầu tra cứu vị trí của thiết bị nhận thật.`
    );
    step3.deviceStatuses[siblingWorkstation] = 'rejected';
    step3.deviceStatuses['switch'] = 'processing';
    steps.push(step3);

    // Step 4: Switch -> Receiver
    const s4Link = receiverId === 'server' ? 'conn_server_switch' : `conn_${receiverId}_switch`;
    const step4 = initStep(
      4,
      'Switch chuyển tiếp thông minh',
      `Switch tra bảng quản lý MAC của mình, nhận biết thiết bị đích [${receiverName}] nằm ở cổng nhánh thông minh tương ứng. Do đó Switch truyền tin độc quyền trực tiếp sang đó.`
    );
    step4.activeLinks = [s4Link];
    step4.activePackets = [{
      id: 'pkt_switch_tgt',
      from: 'switch',
      to: receiverId,
      state: 'sending',
      payload: { senderId, receiverId, type: 'data' }
    }];
    step4.deviceStatuses['switch'] = 'sending';
    step4.deviceStatuses[receiverId] = 'receiving';
    steps.push(step4);

    // Step 5: Receiver accepts
    const step5 = initStep(
      5,
      'Mục tiêu chấp thuận nhận dữ liệu',
      `Thiết bị đích [${receiverName}] tiếp nhận gói tin thông suốt, thực hiện lưu trữ xử lý thông tin thành công và phản hồi kết quả hiển thị màu xanh lá.`
    );
    step5.deviceStatuses[receiverId] = 'accepted';
    steps.push(step5);

  } else if (senderParent === 'hub' && receiverParent === 'hub') {
    // CASE 4: Hub to Hub (PC C to PC D, or PC D to PC C)
    
    // Step 1: Sender -> Hub
    const step1 = initStep(
      1,
      'Truyền dẫn lên Hub trung gian',
      `Luồng gói tín được đẩy từ máy truyền gốc [${senderName}] đi thẳng trực tiếp tới thiết bị Hub.`
    );
    step1.activeLinks = [`conn_${senderId}_hub`];
    step1.activePackets = [{
      id: 'pkt_1',
      from: senderId,
      to: 'hub',
      state: 'sending',
      payload: { senderId, receiverId, type: 'data' }
    }];
    step1.deviceStatuses[senderId] = 'sending';
    step1.deviceStatuses['hub'] = 'processing';
    steps.push(step1);

    // Step 2: Hub broadcasts to other device AND Switch
    const step2 = initStep(
      2,
      'Hub nhân bản tín hiệu phát tán',
      `Vì hoạt động ở tầng vật lý, Hub không quan tâm MAC đích. Nó nhân bản tín hiệu và phát tán quảng bá đồng loạt qua cổng cáp nối máy nhận đích [${receiverName}] và cáp trục chính gửi đến Switch.`
    );
    step2.activeLinks = [`conn_${receiverId}_hub`, 'conn_switch_hub'];
    step2.activePackets = [
      {
        id: 'pkt_hub_recv',
        from: 'hub',
        to: receiverId,
        state: 'sending',
        payload: { senderId, receiverId, type: 'data' }
      },
      {
        id: 'pkt_hub_sw',
        from: 'hub',
        to: 'switch',
        state: 'sending',
        payload: { senderId, receiverId, type: 'data' }
      }
    ];
    step2.deviceStatuses['hub'] = 'sending';
    step2.deviceStatuses[receiverId] = 'receiving';
    step2.deviceStatuses['switch'] = 'processing';
    steps.push(step2);

    // Step 3: Receiver accepts & Switch filters
    const step3 = initStep(
      3,
      'Nhận thành công & Chặn rác ngược',
      `Kết quả: [${receiverName}] đối chiếu MAC nhận diện đúng nên báo chấp nhận thành công (Xanh lá). Phía bên kia, Switch nhận tin, xem xét MAC đích thấy thuộc cổng 4 (cổng nhận tin). Switch nhận ra gói này thuộc mạng nội bộ của Hub nên lập tức hủy gói tin, chặn rác lan truyền sang các máy khác.`
    );
    step3.deviceStatuses[receiverId] = 'accepted';
    step3.deviceStatuses['switch'] = 'filtered';
    steps.push(step3);
  }

  return steps;
}
