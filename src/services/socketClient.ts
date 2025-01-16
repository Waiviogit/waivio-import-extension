// import WebSocket from 'ws';
import { EventEmitter } from 'events';

const emitter = new EventEmitter();
const SOCKET_URL = 'ws://localhost:4000/notifications-api';
// const SOCKET_URL = 'wss://waiviodev.com/notifications-api';

const REQUESTS_TO_DISABLE = 15;
const REQUESTS_TO_RENEW = 3000;
const REQUEST_TIMEOUT = 10000;

const HIVE_SOCKET_ERR = {
  ERROR: 'error socket closed',
  DISABLED: 'socket disabled',
  CLOSED: 'connection close',
  TIMEOUT: 'Timeout exceed',
};

type SendMessageResponse = { error?: Error; data?: any };

const parseJson = (json: string): any => {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return null;
  }
};

class SocketClient {
  private url: string;

  private ws!: WebSocket;

  private timeoutCount = 0;

  private isInitialized = false;

  constructor(url: string) {
    this.url = url;
    this.init(); // Automatically initialize the socket connection
  }

  private async init(): Promise<void> {
    return new Promise((resolve) => {
      this.ws = new WebSocket(this.url);

      this.ws.addEventListener('error', () => {
        console.error('Socket encountered an error and will close.');
        this.ws.close();
      });

      this.ws.addEventListener('message', (message) => {
        const data = parseJson(message.data);
        emitter.emit(data?.id, { data, error: data?.error });
      });

      this.ws.addEventListener('open', () => {
        setTimeout(() => {
          console.info('Socket connection established.');
          this.isInitialized = true;
          resolve();
        }, 100);
      });

      this.ws.addEventListener('close', () => {
        console.warn('Socket connection closed. Attempting to reconnect...');
        this.isInitialized = false;
        setTimeout(() => this.init(), 1000); // Reconnect after 1 second
      });
    });
  }

  async sendMessage(message: Record<string, any> = {}): Promise<SendMessageResponse> {
    if (this.timeoutCount >= REQUESTS_TO_DISABLE) {
      this.timeoutCount++;
      if (this.timeoutCount > REQUESTS_TO_RENEW) {
        this.timeoutCount = 0;
      }
      return { error: new Error(HIVE_SOCKET_ERR.TIMEOUT) };
    }

    if (!this.isInitialized || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('Socket is not ready. Reinitializing...');
      await this.init();
    }

    return new Promise((resolve) => {
      if (this.ws.readyState !== WebSocket.OPEN) {
        resolve({ error: new Error(HIVE_SOCKET_ERR.CLOSED) });
      }

      const { id } = message;

      this.ws.send(JSON.stringify(message));

      emitter.once(id, ({ data, error }) => {
        if (error) resolve({ error });
        else resolve({ data });
      });

      setTimeout(() => {
        if (emitter.eventNames().includes(id)) {
          this.timeoutCount++;
          emitter.off(id, () => {});
          resolve({ error: new Error(HIVE_SOCKET_ERR.TIMEOUT) });
        }
      }, REQUEST_TIMEOUT);
    });
  }
}

const socketClient = new SocketClient(SOCKET_URL);
export default socketClient;
