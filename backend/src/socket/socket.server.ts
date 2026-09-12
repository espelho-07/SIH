import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { TeleconsultationService } from '../modules/teleconsultation/teleconsultation.service';

interface SocketUser {
  userId: string;
  email: string;
  role: string;
}

interface AuthenticatedSocket extends Socket {
  user?: SocketUser;
}

let ioInstance: SocketIOServer | null = null;

export function getSocketServer(): SocketIOServer | null {
  return ioInstance;
}

export function broadcastTokenCalled(token: any): void {
  if (ioInstance) {
    ioInstance.emit('token:called', token);
  }
}

export function broadcastQueueUpdated(queueState: any): void {
  if (ioInstance) {
    ioInstance.emit('queue:updated', queueState);
  }
}

export function initSocketServer(httpServer: HttpServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH'],
    },
  });

  ioInstance = io;
  const teleconsultationService = new TeleconsultationService();

  // Socket Authentication Middleware (Optional - allow unauthenticated guests for live queues)
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers.authorization
          ? socket.handshake.headers.authorization.split(' ')[1]
          : null);

      if (token) {
        try {
          const decoded = jwt.verify(token, env.JWT_SECRET) as SocketUser;
          socket.user = decoded;
        } catch {
          // Allow connection anyway as guest
        }
      }
      next();
    } catch (error) {
      next();
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const user = socket.user;

    socket.on('join_consultation', async (data: { consultationId: string }, callback?: Function) => {
      try {
        const { consultationId } = data;
        if (!consultationId) {
          if (callback) callback({ success: false, message: 'consultationId required' });
          return;
        }

        if (!user) {
          if (callback) callback({ success: false, message: 'Authentication required for consultation' });
          return;
        }

        // Verify authorization for consultation
        const consultationDetails = await teleconsultationService.getConsultationDetails(
          consultationId,
          user.userId,
          user.role
        );

        const roomName = `consultation:${consultationId}`;
        socket.join(roomName);

        if (callback) {
          callback({
            success: true,
            message: `Joined room ${roomName}`,
            consultation: consultationDetails.consultation,
          });
        }
      } catch (error: any) {
        if (callback) {
          callback({ success: false, message: error.message || 'Failed to join consultation room' });
        }
      }
    });

    socket.on('send_message', async (data: { consultationId: string; message: string }, callback?: Function) => {
      try {
        const { consultationId, message } = data;
        if (!consultationId || !message) {
          if (callback) callback({ success: false, message: 'consultationId and message required' });
          return;
        }

        if (!user) {
          if (callback) callback({ success: false, message: 'Authentication required for chat' });
          return;
        }

        const savedMessage = await teleconsultationService.sendChatMessage(
          consultationId,
          user.userId,
          message,
          user.role
        );

        const roomName = `consultation:${consultationId}`;
        io.to(roomName).emit('receive_message', { message: savedMessage });

        if (callback) {
          callback({ success: true, message: savedMessage });
        }
      } catch (error: any) {
        if (callback) {
          callback({ success: false, message: error.message || 'Failed to send message' });
        }
      }
    });

    socket.on('leave_consultation', (data: { consultationId: string }) => {
      if (data && data.consultationId) {
        socket.leave(`consultation:${data.consultationId}`);
      }
    });
  });

  return io;
}
