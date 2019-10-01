const initializeStorage = async (fields = [], dynamicFields = false) => {
  const storageData = new Map();
  const cbMaps = new Map();
  const globalCb = new Set();
  const addField = field => {
    storageData.set(field, storageData.get(field) || null);
    cbMaps.set(field, cbMaps.get(field) || new Set());
  };

  const removeField = field => {
    storageData.delete(field);
    cbMaps.delete(field);
  };

  fields.forEach(addField);

  const storageInstance = {
    on: (field, cb) => {
      if (!cb) {
        if (typeof field !== 'function') {
          throw new Error('You must provide a function or a string and a function as arguments to .on method');
        }
        return globalCb.add(field);
      }

      if (dynamicFields && !cbMaps.has(field)) {
        addField(field);
      }
      if (!cbMaps.has(field)) {
        throw new Error(`Field "${field}" not found in storage`);
      }
      return cbMaps.get(field).add(cb);
    },
    off: (field, cb) => {
      if (!cb) {
        if (typeof field !== 'function') {
          throw new Error('You must provide a function or a string and a function as arguments to .off method');
        }
        return globalCb.delete(field);
      }

      if (dynamicFields && !cbMaps.has(field)) {
        addField(field);
      }
      if (!cbMaps.has(field)) {
        throw new Error(`Field "${field}" not found in storage`);
      }
      return cbMaps.get(field).delete(cb);
    },
    get: field => {
      if (dynamicFields && !storageData.has(field)) {
        addField(field);
      }
      if (!storageData.has(field)) {
        throw new Error(`Field "${field}" not found in storage`);
      }

      return storageData.get(field);
    },
    set: (field, value) => {
      if (dynamicFields && (!storageData.has(field) || !cbMaps.has(field))) {
        addField(field);
      }
      if (!storageData.has(field)) {
        throw new Error(`Field "${field}" not found in storage`);
      }

      const newValue = typeof value === 'function' ? value(storageData.get(field)) : value;

      storageData.set(field, newValue);
      cbMaps.get(field).forEach(cb => cb(newValue));
      globalCb.forEach(cb => cb(field, newValue));
    },
    addField,
    removeField,
    getFields: () => storageData.keys(),
    getStorage: () => storageData,
  };

  return storageInstance;
};

export default initializeStorage;
