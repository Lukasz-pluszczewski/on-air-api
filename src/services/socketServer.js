import createIo from 'socket.io';
import _ from 'lodash';

const createSocketServer = ({
  server,
  socketEventHandlers = {
    disconnect: ({ params, socket, io }) => console.log('Disconnected', socket.id),
  },
  eventHandlers = {
    connection: ({ params: [socket], io }) => console.log('Connected', socket.id),
  },
}) => {
  const io = createIo(server);

  const { connection: connectionEventHandler, ...restEventHandlers } = eventHandlers;

  io.on('connection', socket => {
    connectionEventHandler({ params: [socket], io });
    _.forEach(
      socketEventHandlers,
      (eventHandler, eventName) => socket.on(eventName, (...params) => eventHandler({ params, socket, io }))
    );
  });

  _.forEach(
    restEventHandlers,
    (eventHandler, eventName) => io.on(eventName, (...params) => eventHandler({ params, io }))
  );

  return io;
};

export default createSocketServer;
