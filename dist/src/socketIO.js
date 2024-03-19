import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Server as SocketServer } from 'socket.io';
dotenv.config();
let socketIO = null;
export function initSocketIO(server) {
    socketIO = socketIO || new SocketServer(server, { cors: { origin: '*' } });
    socketIO.on('connect', connectListener);
    return socketIO;
}
export function getSocketIO() {
    if (!socketIO) {
        throw new Error('Socket server not yet initial');
    }
    return socketIO;
}
function connectListener(socket) {
    const token = String(socket.handshake.auth.token || '');
    if (token === '') {
        socket.emit('requiredToken');
        socket.disconnect();
        return;
    }
    try {
        const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'token';
        const jwtPayload = jwt.verify(token, JWT_SECRET_KEY);
        const userAccountId = String(jwtPayload.id);
        socket.join(userAccountId);
    }
    catch (error) {
        console.log(error.message);
        socket.emit('expiredToken');
        socket.disconnect();
    }
}
