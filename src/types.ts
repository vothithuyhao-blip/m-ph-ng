export type DeviceId = 'server' | 'switch' | 'hub' | 'pc_a' | 'pc_b' | 'pc_c' | 'pc_d';

export interface Device {
  id: DeviceId;
  name: string;
  type: 'server' | 'switch' | 'hub' | 'workstation';
  ipAddress?: string;
  macAddress?: string;
  x: number;
  y: number;
  portConnections: { [port: number]: string };
  description: string;
  details: string;
}

export interface Connection {
  id: string;
  from: DeviceId;
  to: DeviceId;
  fromPortName?: string;
  toPortName?: string;
}

export interface SimulationStep {
  stepIndex: number;
  description: string;
  activeLinks: string[]; // List of connection IDs
  // Packets currently in transit during this step
  activePackets: {
    id: string;
    from: DeviceId;
    to: DeviceId;
    state: 'sending' | 'processing' | 'received' | 'rejected' | 'filtered';
    payload: {
      senderId: DeviceId;
      receiverId: DeviceId;
      type: 'data' | 'broadcast' | 'arp';
    };
  }[];
  // Status overlay on specific devices
  deviceStatuses: {
    [deviceId in DeviceId]?: 'idle' | 'sending' | 'receiving' | 'accepted' | 'rejected' | 'filtered' | 'processing';
  };
  narrativeText: string;
}

export interface TeachingScenario {
  id: string;
  title: string;
  description: string;
  senderId: DeviceId;
  receiverId: DeviceId;
  teacherScript: string[]; // Live cues/talking points for the teacher
}
