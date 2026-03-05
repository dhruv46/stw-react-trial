// type StompFrame = {
//   command: string;
//   headers: Record<string, string>;
//   body: string;
// };

// class SocketService {
//   private ws: WebSocket | null = null;
//   private isConnected = false;
//   private sendQueue: string[] = [];
//   private activeTopics: Set<string> = new Set();
//   private messageCallbacks: Record<string, (frame: StompFrame) => void> = {};

//   connect() {
//     if (this.ws) return;

//     this.ws = new WebSocket("wss://stw.coupsoft.com/ws");

//     this.ws.onopen = () => {
//       this.isConnected = true;

//       this.sendFrame("CONNECT", {
//         "accept-version": "1.2",
//       });

//       setTimeout(() => {
//         this.flushQueue();
//         this.resubscribeAll();
//       }, 0);
//     };

//     this.ws.onmessage = (event) => {
//       const raw = event.data as string;
//       const frames = raw.split("\0").filter((f) => f.trim());

//       for (const f of frames) {
//         const frame = this.parseFrame(f);

//         if (frame.command === "MESSAGE") {
//           const topic = frame.headers["destination"];
//           this.messageCallbacks[topic]?.(frame);
//         }
//       }
//     };

//     this.ws.onclose = () => {
//       this.isConnected = false;
//       this.ws = null;

//       setTimeout(() => {
//         this.connect();
//       }, 1000);
//     };

//     this.ws.onerror = (err) => {
//       console.error("WebSocket error:", err);
//     };
//   }

//   subscribe(topic: string, callback: (frame: StompFrame) => void) {
//     if (!this.ws) this.connect();

//     this.messageCallbacks[topic] = callback;
//     this.activeTopics.add(topic);

//     this.sendFrame("SUBSCRIBE", {
//       destination: topic,
//       id: topic,
//     });
//   }

//   unsubscribe(topic: string) {
//     this.sendFrame("UNSUBSCRIBE", { id: topic });
//     delete this.messageCallbacks[topic];
//     this.activeTopics.delete(topic);
//   }

//   disconnect() {
//     this.sendFrame("DISCONNECT");
//     this.ws?.close();
//     this.ws = null;
//     this.isConnected = false;
//   }

//   private sendFrame(
//     command: string,
//     headers: Record<string, string> = {},
//     body = "",
//   ) {
//     let frame = command + "\n";

//     for (const key in headers) {
//       frame += `${key}:${headers[key]}\n`;
//     }

//     frame += "\n" + body + "\\x00";

//     if (this.ws && this.ws.readyState === WebSocket.OPEN) {
//       this.ws.send(frame);
//     } else {
//       this.sendQueue.push(frame);
//     }
//   }

//   private flushQueue() {
//     while (
//       this.ws &&
//       this.ws.readyState === WebSocket.OPEN &&
//       this.sendQueue.length > 0
//     ) {
//       const frame = this.sendQueue.shift();
//       if (frame) this.ws.send(frame);
//     }
//   }

//   private parseFrame(frame: string): StompFrame {
//     const lines = frame.split("\n");
//     const command = lines[0].trim();
//     const headers: Record<string, string> = {};
//     let idx = 1;

//     while (lines[idx] !== "" && idx < lines.length) {
//       const [key, value] = lines[idx].split(":");
//       headers[key.trim()] = value?.trim() || "";
//       idx++;
//     }

//     const body = lines
//       .slice(idx + 1)
//       .join("\n")
//       .replace(/\0/g, "")
//       .trim();

//     return { command, headers, body };
//   }

//   private resubscribeAll() {
//     this.activeTopics.forEach((topic) => {
//       this.sendFrame("SUBSCRIBE", {
//         destination: topic,
//         id: topic,
//       });
//     });
//   }
// }

// export default new SocketService();

// ==============================
// STOMP Frame Type
// ==============================
export type StompFrame = {
  command: string;
  headers: Record<string, string>;
  body: string;
};

type Callback = (data: any, frame: StompFrame) => void;

// ==============================
// Socket Service
// ==============================
class SocketService {
  private ws: WebSocket | null = null;
  private reconnectTimer: any = null;

  private isConnected = false;

  private sendQueue: string[] = [];

  // topic -> callbacks
  private subscribers: Record<string, Set<Callback>> = {};

  private activeTopics = new Set<string>();

  private SOCKET_URL = "wss://stw.coupsoft.com/ws";

  // ==============================
  // CONNECT
  // ==============================
  connect() {
    if (this.ws) return;

    console.log("Socket Connecting...");

    this.ws = new WebSocket(this.SOCKET_URL);

    this.ws.onopen = () => {
      console.log("Socket Connected");

      this.isConnected = true;

      this.sendFrame("CONNECT", {
        "accept-version": "1.2",
      });

      this.flushQueue();
      this.resubscribeAll();
    };

    this.ws.onmessage = (event) => {
      const raw = event.data as string;

      const frames = raw.split("\0").filter(Boolean);

      frames.forEach((f) => {
        const frame = this.parseFrame(f);

        if (frame.command === "MESSAGE") {
          const topic = frame.headers.destination;

          const body = this.safeJSON(frame.body);

          this.subscribers[topic]?.forEach((cb) => cb(body, frame));
        }
      });
    };

    this.ws.onclose = () => {
      console.log("Socket Closed → Reconnecting");

      this.cleanup();

      this.reconnectTimer = setTimeout(() => {
        this.connect();
      }, 2000);
    };

    this.ws.onerror = (error) => {
      console.error("Socket Error:", error);
    };
  }

  // ==============================
  // SUBSCRIBE
  // ==============================
  subscribe(topic: string, callback: Callback) {
    this.connect();

    if (!this.subscribers[topic]) {
      this.subscribers[topic] = new Set();
    }

    this.subscribers[topic].add(callback);

    // prevent duplicate subscribe
    if (!this.activeTopics.has(topic)) {
      this.activeTopics.add(topic);

      this.sendFrame("SUBSCRIBE", {
        id: topic,
        destination: topic,
      });
    }
  }

  // ==============================
  // UNSUBSCRIBE
  // ==============================
  unsubscribe(topic: string, callback?: Callback) {
    if (!this.subscribers[topic]) return;

    if (callback) {
      this.subscribers[topic].delete(callback);
    }

    if (!callback || this.subscribers[topic].size === 0) {
      delete this.subscribers[topic];

      this.activeTopics.delete(topic);

      this.sendFrame("UNSUBSCRIBE", {
        id: topic,
      });
    }
  }

  // ==============================
  // DISCONNECT
  // ==============================
  disconnect() {
    this.sendFrame("DISCONNECT");

    this.ws?.close();

    this.cleanup();
  }

  // ==============================
  // SEND FRAME
  // ==============================
  private sendFrame(
    command: string,
    headers: Record<string, string> = {},
    body = "",
  ) {
    let frame = command + "\n";

    Object.entries(headers).forEach(([k, v]) => {
      frame += `${k}:${v}\n`;
    });

    frame += "\n" + body + "\\x00";

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(frame);
    } else {
      this.sendQueue.push(frame);
    }
  }

  // ==============================
  // QUEUE FLUSH
  // ==============================
  private flushQueue() {
    while (this.ws?.readyState === WebSocket.OPEN && this.sendQueue.length) {
      const frame = this.sendQueue.shift();

      if (frame) this.ws.send(frame);
    }
  }

  // ==============================
  // RESUBSCRIBE
  // ==============================
  private resubscribeAll() {
    this.activeTopics.forEach((topic) => {
      this.sendFrame("SUBSCRIBE", {
        id: topic,
        destination: topic,
      });
    });
  }

  // ==============================
  // PARSE STOMP
  // ==============================
  private parseFrame(frame: string): StompFrame {
    const lines = frame.split("\n");

    const command = lines[0].trim();

    const headers: Record<string, string> = {};

    let i = 1;

    while (lines[i] !== "") {
      const [key, value] = lines[i].split(":");
      headers[key.trim()] = value?.trim() || "";
      i++;
    }

    const body = lines
      .slice(i + 1)
      .join("\n")
      .replace(/\0/g, "")
      .trim();

    return {
      command,
      headers,
      body,
    };
  }

  private safeJSON(data: string) {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }

  private cleanup() {
    this.isConnected = false;
    this.ws = null;
  }
}

export default new SocketService();
