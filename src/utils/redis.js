const { createClient } = require("redis");

const client = createClient();

module.exports.initConnection = async function() {
  await client.connect();
}

// module.exports.cacheItem = function(key: string, value: string) {
//   return new Promise<string | null>((resolve, reject) => {
//     client.set(key, value).then(resolve).catch(reject);
//   });
// }

// export function hCacheItem(key: string, field: string, value: string) {
//   return new Promise<number>((resolve, reject) => {
//     client.hSet(key, field, value).then(resolve).catch(reject);
//   });
// }

module.exports.getItem = function(key) {
  return new Promise((resolve, reject) => {
    client.get(key).then(resolve).then(reject);
  });
}

module.exports.hGetItems = function(key) {
  return new Promise((resolve, reject) => {
    client.hGetAll(key).then(resolve).catch(reject);
  });
}

module.exports.checkIfItemExists = function(key) {
  return new Promise((resolve, reject) => {
    client
      .exists(key)
      .then(val => resolve(val === 1))
      .catch(reject);
  });
}

module.exports.getAllKeysMatchingPattern = function(pattern) {
  return new Promise((resolve, reject) => {
    client
      .keys(pattern + '*')
      .then(resolve)
      .catch(reject);
  });
}