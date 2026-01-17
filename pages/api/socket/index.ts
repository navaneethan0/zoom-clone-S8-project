import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import { NextApiResponseServerIO } from '@/types/socket';

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.IO server...');
    const path = '/api/socket';
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: path,
      addTrailingSlash: false,
    });
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('Socket connected on server:', socket.id);

      socket.on('join-room', (roomId: string) => {
        if (!roomId) {
          console.error('Join-room failed: No roomId provided');
          return;
        }
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);

        // Confirm join to client
        socket.emit('joined-room', roomId);
      });

      socket.on('send-message', (data: { roomId: string; message: any }) => {
        const { roomId, message } = data;
        console.log(`Message received on server for room ${roomId} from ${socket.id}:`, message);

        if (!roomId) {
          console.error('Send-message failed: No roomId provided');
          return;
        }

        // Broadcast to everyone in the room (including sender)
        io.to(roomId).emit('receive-message', message);
        console.log(`Message broadcasted to room ${roomId}`);
      });

      socket.on('disconnect', (reason) => {
        console.log(`Socket ${socket.id} disconnected. Reason: ${reason}`);
      });
    });
  }

  res.end();
};

export default ioHandler;
