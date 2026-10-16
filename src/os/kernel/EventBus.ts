/**
 * Android Binder IPC & EventBus Simulation
 * Allows system services and applications to publish and subscribe to OS intents
 */

type Listener<T = any> = (payload: T) => void;

class SystemEventBus {
  private listeners: Map<string, Set<Listener>> = new Map();

  public on<T = any>(event: string, listener: Listener<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    return () => {
      this.off(event, listener);
    };
  }

  public off<T = any>(event: string, listener: Listener<T>): void {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(listener);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  public emit<T = any>(event: string, payload?: T): void {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((listener) => {
        try {
          listener(payload);
        } catch (err) {
          console.error(`[EventBus] Error in listener for event "${event}":`, err);
        }
      });
    }
  }
}

export const EventBus = new SystemEventBus();
