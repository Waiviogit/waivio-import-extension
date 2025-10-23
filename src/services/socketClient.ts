import { EventEmitter } from 'events';

const emitter = new EventEmitter();
const SOCKET_URL = 'wss://www.waivio.com/notifications-api';
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

const initConnection = async (url: string): Promise<WebSocket> => new Promise((resolve) => {
  const ws = new WebSocket(url);
  ws.addEventListener('error', () => {
    console.error('Socket encountered an error and will close.');
    ws.close();
  });
  ws.addEventListener('message', (message) => {
    const data = parseJson(message.data);
    emitter.emit(data?.id, { data, error: data?.error });
  });

  ws.addEventListener('open', () => {
    setTimeout(() => { resolve(ws); }, 100);
  });
});

const sendMessage = async (message: Record<string, any> = {}): Promise<SendMessageResponse> => {
  const ws = await initConnection(SOCKET_URL);

  return new Promise((resolve) => {
    if (ws.readyState !== WebSocket.OPEN) {
      resolve({ error: new Error(HIVE_SOCKET_ERR.CLOSED) });
      return;
    }

    const { id } = message;
    let isResolved = false;

    const handleResponse = ({ data, error }: { data: any; error: any }) => {
      if (isResolved) return;
      isResolved = true;

      emitter.off(id, handleResponse);
      ws.close();

      if (error) {
        resolve({ error });
      } else {
        resolve({ data });
      }
    };

    const handleTimeout = () => {
      if (isResolved) return;
      isResolved = true;

      emitter.off(id, handleResponse);
      ws.close();
      resolve({ error: new Error(HIVE_SOCKET_ERR.TIMEOUT) });
    };

    emitter.once(id, handleResponse);
    ws.send(JSON.stringify(message));

    setTimeout(handleTimeout, REQUEST_TIMEOUT);
  });
};

const socketClient = {
  sendMessage,
};
export default socketClient;
