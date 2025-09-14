import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface ClientConnection {
  ws: WebSocket;
  userId?: string;
  eventId?: string;
  subscriptions: Set<string>;
}

export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Map<string, ClientConnection> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws',
      perMessageDeflate: false 
    });

    this.setupWebSocketServer();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket, request) => {
      const clientId = this.generateClientId();
      const client: ClientConnection = {
        ws,
        subscriptions: new Set(),
      };

      this.clients.set(clientId, client);

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(clientId, message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(clientId);
      });

      // Send connection acknowledgment
      ws.send(JSON.stringify({
        type: 'connection',
        status: 'connected',
        clientId,
      }));
    });
  }

  private handleMessage(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'authenticate':
        client.userId = message.userId;
        break;

      case 'subscribe':
        const channel = message.channel;
        client.subscriptions.add(channel);
        
        // If subscribing to event channel, store eventId
        if (channel.startsWith('event:')) {
          client.eventId = channel.split(':')[1];
        }
        break;

      case 'unsubscribe':
        client.subscriptions.delete(message.channel);
        break;

      case 'ping':
        client.ws.send(JSON.stringify({ type: 'pong' }));
        break;
    }
  }

  // Broadcast leaderboard updates to all clients subscribed to an event
  broadcastLeaderboardUpdate(eventId: string, leaderboardData: any) {
    const channel = `event:${eventId}:leaderboard`;
    this.broadcastToChannel(channel, {
      type: 'leaderboard_update',
      eventId,
      data: leaderboardData,
    });
  }

  // Broadcast tournament match updates
  broadcastTournamentUpdate(tournamentId: string, matchData: any) {
    const channel = `tournament:${tournamentId}`;
    this.broadcastToChannel(channel, {
      type: 'tournament_update',
      tournamentId,
      data: matchData,
    });
  }

  // Broadcast notifications to specific users
  broadcastToUser(userId: string, notification: any) {
    this.clients.forEach((client, clientId) => {
      if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify({
          type: 'notification',
          data: notification,
        }));
      }
    });
  }

  // Broadcast to all clients subscribed to a channel
  private broadcastToChannel(channel: string, message: any) {
    this.clients.forEach((client, clientId) => {
      if (client.subscriptions.has(channel) && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get connection statistics
  getStats() {
    return {
      totalConnections: this.clients.size,
      activeConnections: Array.from(this.clients.values())
        .filter(client => client.ws.readyState === WebSocket.OPEN).length,
    };
  }
}

let wsService: WebSocketService | null = null;

export function initializeWebSocketService(server: Server): WebSocketService {
  if (!wsService) {
    wsService = new WebSocketService(server);
  }
  return wsService;
}

export function getWebSocketService(): WebSocketService | null {
  return wsService;
}