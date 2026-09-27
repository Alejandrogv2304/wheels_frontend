let pendingRequests = 0;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export const requestLoader = {
  start() {
    pendingRequests += 1;
    notify();
  },
  finish() {
    pendingRequests = Math.max(0, pendingRequests - 1);
    notify();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return pendingRequests > 0;
  },
  getServerSnapshot() {
    return false;
  },
};