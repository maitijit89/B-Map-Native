import { Platform } from 'react-native';

const DEFAULT_PORT = 8080;

function getDefaultHost(): string {
  if (Platform.OS === 'android') {
    // Android emulator alias for host machine
    return '10.0.2.2';
  }
  // Web & iOS simulator default
  return 'localhost';
}

let currentHost = getDefaultHost();
let currentPort = DEFAULT_PORT;

export function getApiBaseUrl(): string {
  return `http://${currentHost}:${currentPort}/api/v1`;
}

export function getWebSocketBaseUrl(clientId: string): string {
  return `ws://${currentHost}:${currentPort}/api/v1/fleet/ws?client_id=${encodeURIComponent(clientId)}`;
}

export function getTileUrl(z: number, x: number, y: number): string {
  return `http://${currentHost}:${currentPort}/api/v1/tiles/${z}/${x}/${y}`;
}

export function getMapStyleUrl(theme: 'standard' | 'dark' | 'satellite' | 'traffic' = 'standard'): string {
  return `http://${currentHost}:${currentPort}/api/v1/maps/style.json?theme=${theme}`;
}

export function setCustomBackendHost(host: string, port = DEFAULT_PORT): void {
  currentHost = host.trim();
  currentPort = port;
}

export function getCurrentBackendHost(): string {
  return currentHost;
}
