const direntTypeMap = new Map([
  [0, 'UV_DIRENT_UNKNOWN'],
  [1, 'UV_DIRENT_FILE'],
  [2, 'UV_DIRENT_DIR'],
  [3, 'UV_DIRENT_LINK'],
  [4, 'UV_DIRENT_FIFO'],
  [5, 'UV_DIRENT_SOCKET'],
  [6, 'UV_DIRENT_CHAR'],
  [7, 'UV_DIRENT_BLOCK']
]);

const arr = [];
direntTypeMap.forEach((value, key) => {
  arr.push([key, value.split('_').pop().toLowerCase()]);
});

const direntTypeKeysMap = new Map(arr);

module.exports = {
  direntTypeMap,
  direntTypeKeysMap
}
