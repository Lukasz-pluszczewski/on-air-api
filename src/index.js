import config from './config';

import simpleExpress from 'services/simpleExpress/simpleExpress';
import createSocketServer from 'services/socketServer';
import initializeStorage from 'services/storage';

const UPDATE_EVENT_NAME = 'update';
const UPDATE_NAME_EVENT_NAME = 'update-name';
const USERS_UPDATE_EVENT_NAME = 'users-update';


(async function() {
  const statusStorage = await initializeStorage([], true);
  const nameStorage = await initializeStorage([], true);

  const isOnAir = () => {
    let onAir = false;
    statusStorage.getStorage().forEach((value) => {
      if (value === 'on-air') {
        onAir = true;
      }
    });
    return onAir;
  };

  simpleExpress({ port: config.port })
    .then(({ app, server }) => {
      const notifyClients = () => {
        const onAir = isOnAir();
        const users = [...statusStorage.getFields()].map(socket => ({
          id: socket.id,
          name: nameStorage.get(socket),
          status: statusStorage.get(socket),
        }));

        [...statusStorage.getFields()].forEach(socket => {
          socket.emit(UPDATE_EVENT_NAME, onAir ? 'on-air' : 'free');
          socket.emit(USERS_UPDATE_EVENT_NAME, users);
        });
      };
      statusStorage.on(notifyClients);
      nameStorage.on(notifyClients);

      createSocketServer({
        server,
        eventHandlers: {
          connection: ({ params: [socket] }) => {
            statusStorage.addField(socket);
            nameStorage.addField(socket);

            notifyClients();
          },
        },
        socketEventHandlers: {
          disconnect: ({ socket }) => {
            statusStorage.removeField(socket);
            nameStorage.removeField(socket);

            notifyClients();
          },
          [UPDATE_EVENT_NAME]: ({ params: [newStatus], socket}) => {
            statusStorage.set(socket, newStatus);
          },
          [UPDATE_NAME_EVENT_NAME]: ({ params: [newName], socket }) => {
            nameStorage.set(socket, newName);
          },
        },

      });

      console.log(`Started on port ${app.server.address().port}`);
    })
    .catch(error => console.error('Error', error));
})();
