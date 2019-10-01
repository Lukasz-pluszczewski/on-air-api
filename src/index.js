import config from './config';
import createIo from 'socket.io';

import simpleExpress from 'services/simpleExpress/simpleExpress';
import initializeStorage from 'services/storage';

const UPDATE_EVENT_NAME = 'update';

(async function() {
  const storage = await initializeStorage([], true);

  simpleExpress({
    port: config.port,
    routes: [],
    routeParams: { storage },
  })
    .then(({ app, server }) => {
      const io = createIo(server);

      const isOnAir = () => {
        let onAir = false;
        storage.getStorage().forEach((value) => {
          if (value === 'on-air') {
            onAir = true;
          }
        });
        return onAir;
      };

      const updateHandler = () => {
        const onAir = isOnAir();

        [...storage.getFields()].forEach(socket => {
          socket.emit('update', onAir ? 'on-air' : 'free');
        });
      };
      storage.on(updateHandler);

      io.on('connection', socket => {
        storage.addField(socket);
        socket.emit('update', isOnAir() ? 'on-air' : 'free');
        socket.on('disconnect', () => {
          storage.removeField(socket);
        });
        socket.on(UPDATE_EVENT_NAME, (status) => {
          storage.set(socket, status);
        });
      });
      console.log(`Started on port ${app.server.address().port}`);
    })
    .catch(error => console.error('Error', error));
})();
