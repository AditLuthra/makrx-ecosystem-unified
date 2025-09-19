import { Server as HttpServer, IncomingMessage } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
type WsRawData = string | Buffer | ArrayBuffer | Buffer[];

// Inbound messages from clients
type AuthenticateMessage = {
  type: 'authenticate';
  userId: string;
};

type SubscribeMessage = {
  type: 'subscribe';
  channel: string;
};

type UnsubscribeMessage = {
  type: 'unsubscribe';
  channel: string;
};

type PingMessage = {
  type: 'ping';
};

type InboundClientMessage =
  | AuthenticateMessage
  | SubscribeMessage
  | UnsubscribeMessage
  | PingMessage;

// Outbound messages from server
type ConnectionAckMessage = {
  type: 'connection';
  status: 'connected';
  clientId: string;
};

type PongMessage = {
  type: 'pong';
};

type NotificationMessage<T = unknown> = {
  type: 'notification';
  data: T;
};

type LeaderboardUpdateMessage<T = unknown> = {
  type: 'leaderboard_update';
  eventId: string;
  data: T;
};

type TournamentUpdateMessage<T = unknown> = {
  type: 'tournament_update';
  tournamentId: string;
  data: T;
};

type OutboundServerMessage =
  | ConnectionAckMessage
  | PongMessage
  | NotificationMessage
  | LeaderboardUpdateMessage
  | TournamentUpdateMessage;

interface ClientConnection {
  ws: WebSocket;
  userId?: string;
  eventId?: string;
  subscriptions: Set<string>;
}

function rawDataToString(data: WsRawData): string {
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return Buffer.concat(data).toString('utf8');
  if (data instanceof ArrayBuffer) return Buffer.from(data).toString('utf8');
  // Buffer
  return (data as Buffer).toString('utf8');
}

function safeParseJSON<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function isInboundMessage(msg: unknown): msg is InboundClientMessage {
  if (!msg || typeof msg !== 'object') return false;
  const t = (msg as { type?: unknown }).type;
  if (t !== 'authenticate' && t !== 'subscribe' && t !== 'unsubscribe' && t !== 'ping') {
    return false;
  }
  switch (t) {
    case 'authenticate':
      return typeof (msg as AuthenticateMessage).userId === 'string';
    case 'subscribe':
    case 'unsubscribe':
      return typeof (msg as SubscribeMessage | UnsubscribeMessage).channel === 'string';
    case 'ping':
      return true;
    default:
      return false;
  }
}

export class WebSocketService {
  private readonly wss: InstanceType<typeof WebSocketServer>;
  private readonly clients: Map<string, ClientConnection> = new Map();

  constructor(server: HttpServer) {
    this.wss = new WebSocketServer({
      server,
      path: '/ws',
      perMessageDeflate: false,
    });
    this.setupWebSocketServer();
  }

  private setupWebSocketServer(): void {
    this.wss.on(
      'connection',
      (socket: InstanceType<typeof WebSocket>, _request: IncomingMessage) => {
        const clientId = this.generateClientId();
        const client: ClientConnection = {
          ws: socket,
          subscriptions: new Set<string>(),
        };
        this.clients.set(clientId, client);

        socket.on('message', (data: WsRawData) => {
          const asText = rawDataToString(data);
          const parsed = safeParseJSON<unknown>(asText);
          if (!isInboundMessage(parsed)) {
            // Ignore invalid messages
            return;
          }
          this.handleMessage(clientId, parsed);
        });

        socket.on('close', () => {
          this.clients.delete(clientId);
        });

        socket.on('error', () => {
          // Remove on error to avoid leaks
          this.clients.delete(clientId);
        });

        // Send connection acknowledgment
        this.safeSend(client.ws, {
          type: 'connection',
          status: 'connected',
          clientId,
        });
      },
    );
  }

  private handleMessage(clientId: string, message: InboundClientMessage): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'authenticate': {
        client.userId = message.userId;
        break;
      }
      case 'subscribe': {
        const { channel } = message;
        client.subscriptions.add(channel);
        // If subscribing to an event channel, store eventId (assumes format event:<id>[:...])
        if (channel.startsWith('event:')) {
          const parts = channel.split(':');
          if (parts.length >= 2) {
            client.eventId = parts[1] ?? undefined;
          }
        }
        break;
      }
      case 'unsubscribe': {
        client.subscriptions.delete(message.channel);
        break;
      }
      case 'ping': {
        this.safeSend(client.ws, { type: 'pong' });
        break;
      }
    }
  }

  // Broadcast leaderboard updates to all clients subscribed to an event
  broadcastLeaderboardUpdate<T = unknown>(eventId: string, leaderboardData: T): void {
    const channel = `event:${eventId}:leaderboard`;
    const message: LeaderboardUpdateMessage<T> = {
      type: 'leaderboard_update',
      eventId,
      data: leaderboardData,
    };
    this.broadcastToChannel(channel, message);
  }

  // Broadcast tournament match updates
  broadcastTournamentUpdate<T = unknown>(tournamentId: string, matchData: T): void {
    const channel = `tournament:${tournamentId}`;
    const message: TournamentUpdateMessage<T> = {
      type: 'tournament_update',
      tournamentId,
      data: matchData,
    };
    this.broadcastToChannel(channel, message);
  }

  // Broadcast notifications to specific users
  broadcastToUser<T = unknown>(userId: string, notification: T): void {
    this.clients.forEach((client) => {
      if (
        client.userId === userId &&
        client.ws.readyState === (WebSocket as unknown as { OPEN: number }).OPEN
      ) {
        const message: NotificationMessage<T> = { type: 'notification', data: notification };
        this.safeSend(client.ws, message);
      }
    });
  }

  // Broadcast to all clients subscribed to a channel
  private broadcastToChannel(channel: string, message: OutboundServerMessage): void {
    this.clients.forEach((client) => {
      if (
        client.subscriptions.has(channel) &&
        client.ws.readyState === (WebSocket as unknown as { OPEN: number }).OPEN
      ) {
        this.safeSend(client.ws, message);
      }
    });
  }

  private safeSend(ws: InstanceType<typeof WebSocket>, message: OutboundServerMessage): void {
    if (ws.readyState !== (WebSocket as unknown as { OPEN: number }).OPEN) return;
    try {
      ws.send(JSON.stringify(message));
    } catch {
      // Ignore send errors for individual clients
    }
  }

  private generateClientId(): string {
    // eslint-disable-next-line no-bitwise
    const random = Math.random().toString(36).slice(2, 11);
    return `client_${Date.now()}_${random}`;
  }

  // Get connection statistics
  getStats(): { totalConnections: number; activeConnections: number } {
    const totalConnections = this.clients.size;
    const activeConnections = Array.from(this.clients.values()).filter(
      (client) => client.ws.readyState === WebSocket.OPEN,
    ).length;
    return { totalConnections, activeConnections };
  }

  // Optional: close all connections and the server
  close(): void {
    this.clients.forEach((client) => {
      try {
        client.ws.close();
      } catch {
        // ignore
      }
    });
    this.clients.clear();
    this.wss.close();
  }
}

let wsService: WebSocketService | null = null;

export function initializeWebSocketService(server: HttpServer): WebSocketService {
  if (!wsService) {
    wsService = new WebSocketService(server);
  }
  return wsService;
}

export function getWebSocketService(): WebSocketService | null {
  return wsService;
}
