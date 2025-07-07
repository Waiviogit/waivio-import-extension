interface LoadingEventData {
  step: string;
  message?: string;
  progress?: number;
  data?: any;
}

class LoadingEvent extends CustomEvent<LoadingEventData> {
  constructor(type: string, detail: LoadingEventData) {
    super(type, { detail });
  }
}

const emitter = new EventTarget();

export const emitLoadingEvent = (type: string, data: LoadingEventData) => {
  const event = new LoadingEvent(type, data);
  emitter.dispatchEvent(event);
};

export default emitter;
