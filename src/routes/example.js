import { ObjectID } from 'mongodb';
import { find, findLast, insert, remove, update } from 'services/mongoDatabaseService';

const healthRoutes = [
  {
    path: '*',
    handlers: {
      get: ({ body, query, params, originalUrl, protocol, xhr, get, req, db }) => {
        return {
          body: {
            message: 'Request success',
            body,
            query,
            params,
            originalUrl,
            protocol,
            xhr,
          },
        };
      },
    },
  },
];

export default healthRoutes;
