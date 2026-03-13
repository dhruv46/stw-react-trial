type Callback = () => void;

class EventBus {
  private events: Record<string, Set<Callback>> = {};

  on(event: string, cb: Callback) {
    if (!this.events[event]) {
      this.events[event] = new Set();
    }

    this.events[event].add(cb);
  }

  off(event: string, cb: Callback) {
    this.events[event]?.delete(cb);
  }

  emit(event: string) {
    this.events[event]?.forEach((cb) => cb());
  }
}

export default new EventBus();
