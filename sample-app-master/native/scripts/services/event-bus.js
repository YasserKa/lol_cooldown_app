define([], function () {
  let _listeners = [];

  function addListener(eventHandler) {
    _listeners = [eventHandler];
    // if (_listeners.length === 0) {
    // _listeners.push(eventHandler);
    // }
  }

  function trigger(data) {
    // Calling it again because it gets called before run() in appController which adds the listener
    if (_listeners.length === 0) {
      setTimeout(trigger, 2000, data);
      return;
    }

    console.log('triggering in bus');
    console.log(_listeners[0]);
    _listeners.forEach(listener => listener(data))
  }

  return {
    addListener,
    trigger
  }
});