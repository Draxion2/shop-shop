export function pluralize(name, count) {
  if (count === 1) {
    return name
  }
  return name + 's'
};

export function idbPromise(storeName, method, object) {
  return new Promise((resolve, reject) => {
    // open connection to the db 'shop-shop' with the version of 1
    const request = window.indexedDB.open('shop-shop', 1);

    // create var to hold ref to the db, transaction (tx) and obj store
    let db, tx, store;

    // if version has changed (or if this is the first time), run this method and create the three obj stores
    request.onupgradeneeded = function(e) {
      // create obj store for each type of data and set 'primary' key index to be the '_id' of the data
      db.createObjectStore('products', { keyPath: '_id' });
      db.createObjectStore('categories', { keyPath: '_id' });
      db.createObjectStore('cart', { keyPath: '_id' });
    };

    // handle any errs with connecting
    request.onerror = function(e) {
      console.log("There was an error");
    }

    // on db open success
    request.onsuccess = function(e) {
      // save a ref of the db to the 'db' var
      db = request.result;
      // open a transaction do whatever we pass into `storeName` (must match one of the object store names)
      tx = db.transaction(storeName, 'readwrite');
      // save a ref to that obj store
      store = tx.objectStore(storeName);

      // if there's any errs, let us know
      db.onerror = function(e) {
        console.log('error', e);
      };

      switch(method) {
        case 'put':
          store.put(object);
          resolve(object);
          break;
        case 'get':
          const all = store.getAll();
          all.onsuccess = function() {
            resolve(all.result);
          };
          break;
        case 'delete':
          store.delete(object._id);
          break;
        default:
          console.log('No valid method');
          break;
      }

      // when the transaction is completed, close the connection
      tx.oncomplete = function() {
        db.close();
      };
    };
  });
};