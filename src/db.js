// db.js - tiny IndexedDB wrapper for songs & playlists;
const DB_NAME = 'bolly-player-db';
const DB_VERSION = 1;
const STORE_SONGS = 'songs';
const STORE_PLAYLISTS = 'playlists';
const jsmediatags = window.jsmediatags;



function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_SONGS)) {
        db.createObjectStore(STORE_SONGS, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORE_PLAYLISTS)) {
        db.createObjectStore(STORE_PLAYLISTS, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

function getDurationFromBlob(blob) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio();
    audio.src = url;
    const cleanup = () => { try { URL.revokeObjectURL(url); } catch (err) {} };
    audio.addEventListener('loadedmetadata', () => {
      const d = audio.duration || 0;
      cleanup();
      resolve(isFinite(d) ? d : 0);
    });
    audio.addEventListener('error', () => {
      cleanup();
      resolve(0);
    });
  });
}

export async function addSong(file) {
  const duration = await getDurationFromBlob(file);
  const metadata = await new Promise((resolve) => {
    new jsmediatags.Reader(file)
      .read({
        onSuccess: (tag) => {
          resolve({
            title: tag.tags.title || '',
            artist: tag.tags.artist || ''
          });
        },
        onError: () => resolve({ title: '', artist: '' })
      });
  });

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SONGS, 'readwrite');
    const store = tx.objectStore(STORE_SONGS);
    const item = {
      name: file.name,
      title: metadata.title || file.name,  // fallback
      artist: metadata.artist || 'Unknown Artist',
      type: file.type,
      size: file.size,
      addedAt: Date.now(),
      duration,
      blob: file
    };
    const req = store.add(item);
    req.onsuccess = (e) => {
      item.id = e.target.result;
      resolve(item);
    };
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function getAllSongs() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SONGS, 'readonly');
    const store = tx.objectStore(STORE_SONGS);
    const req = store.getAll();
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function getSongBlob(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SONGS, 'readonly');
    const store = tx.objectStore(STORE_SONGS);
    const req = store.get(id);
    req.onsuccess = (e) => {
      const record = e.target.result;
      if (record) resolve(record.blob);
      else resolve(null);
    };
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function deleteSong(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SONGS, 'readwrite');
    const store = tx.objectStore(STORE_SONGS);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e.target.error);
  });
}

// Playlists
export async function createPlaylist(name, songIds = []) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PLAYLISTS, 'readwrite');
    const store = tx.objectStore(STORE_PLAYLISTS);
    const data = { name, songIds, createdAt: Date.now() };
    const req = store.add(data);
    req.onsuccess = (e) => { data.id = e.target.result; resolve(data); };
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function getAllPlaylists() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PLAYLISTS, 'readonly');
    const store = tx.objectStore(STORE_PLAYLISTS);
    const req = store.getAll();
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = e => reject(e.target.error);
  });
}

export async function updatePlaylist(playlist) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PLAYLISTS, 'readwrite');
    const store = tx.objectStore(STORE_PLAYLISTS);
    const req = store.put(playlist);
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function deletePlaylist(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PLAYLISTS, 'readwrite');
    const store = tx.objectStore(STORE_PLAYLISTS);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e.target.error);
  });
}
