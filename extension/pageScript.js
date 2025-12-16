// This script runs in the page context to access React fiber data
(function initPageScript() {
  const MESSAGE_TYPES = {
    REQUEST: 'GET_LOCATION_DATA',
    RESPONSE: 'LOCATION_DATA_RESULT',
  };

  const MAX_FIBER_DEPTH = 20;

  const sendResponse = (id, data = null) => {
    window.postMessage({ type: MESSAGE_TYPES.RESPONSE, id, data }, '*');
  };

  const getReactFiber = (element) => {
    const fiberKey = Object.keys(element).find((key) => key.startsWith('__reactFiber'));
    return fiberKey ? element[fiberKey] : null;
  };

  const extractLocationFromFiber = (fiber) => {
    let currentFiber = fiber;
    let depth = 0;

    while (currentFiber && depth < MAX_FIBER_DEPTH) {
      const pin = currentFiber.memoizedProps?.business?.location?.pin;

      if (pin?.latitude && pin?.longitude) {
        return { latitude: pin.latitude, longitude: pin.longitude };
      }

      currentFiber = currentFiber.return;
      depth++;
    }

    return null;
  };

  const handleLocationRequest = (event) => {
    if (event.source !== window || event.data.type !== MESSAGE_TYPES.REQUEST) return;

    const { id } = event.data;
    const element = document.querySelector(`[data-location-id="${id}"]`);

    if (!element) {
      sendResponse(id);
      return;
    }

    const fiber = getReactFiber(element);
    if (!fiber) {
      sendResponse(id);
      return;
    }

    const location = extractLocationFromFiber(fiber);
    sendResponse(id, location);
  };

  window.addEventListener('message', handleLocationRequest);
}());
