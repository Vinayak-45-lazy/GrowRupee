import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

let db = null;
let isMockDb = false;

// In-Memory / File-Persisted Mock Store for instant out-of-the-box evaluation
const MOCK_DATA_FILE = path.join(__dirname, '../data/mock_db.json');

const loadMockData = () => {
  try {
    if (fs.existsSync(MOCK_DATA_FILE)) {
      return JSON.parse(fs.readFileSync(MOCK_DATA_FILE, 'utf-8'));
    }
  } catch (err) {
    console.warn('[Mock DB] Error loading file, initializing empty store:', err.message);
  }
  return { merchants: {}, products: {}, orders: {} };
};

const saveMockData = (data) => {
  try {
    const dir = path.dirname(MOCK_DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(MOCK_DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('[Mock DB] Error saving data:', err.message);
  }
};

let mockStore = loadMockData();

// Initialize Firebase Admin or Fallback
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    const formattedPrivateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: formattedPrivateKey,
      }),
    });
    db = admin.firestore();
    console.log('✅ Connected to Real Firebase Firestore via Admin SDK');
  } catch (err) {
    console.error('❌ Firebase Admin initialization failed, switching to Mock DB:', err.message);
    isMockDb = true;
  }
} else {
  console.log('ℹ️ Firebase credentials missing in .env — using Mock Firestore Database for seamless local testing.');
  isMockDb = true;
}

// Wrapper to provide standard Firestore interface for both Real and Mock Firestore
class MockCollectionRef {
  constructor(collectionName) {
    this.collectionName = collectionName;
    if (!mockStore[collectionName]) {
      mockStore[collectionName] = {};
    }
    this.conditions = [];
  }

  where(field, op, value) {
    this.conditions.push({ field, op, value });
    return this;
  }

  async get() {
    let items = Object.entries(mockStore[this.collectionName] || {}).map(([id, data]) => ({
      id,
      data: () => data,
      exists: true,
    }));

    // Filter based on where clauses
    for (const cond of this.conditions) {
      items = items.filter(item => {
        const val = item.data()[cond.field];
        if (cond.op === '==') return val === cond.value;
        if (cond.op === '!=') return val !== cond.value;
        if (cond.op === '>') return val > cond.value;
        if (cond.op === '>=') return val >= cond.value;
        if (cond.op === '<') return val < cond.value;
        if (cond.op === '<=') return val <= cond.value;
        if (cond.op === 'array-contains') return Array.isArray(val) && val.includes(cond.value);
        return true;
      });
    }

    return {
      empty: items.length === 0,
      size: items.length,
      docs: items,
      forEach: (cb) => items.forEach(cb),
    };
  }

  doc(docId) {
    const self = this;
    const id = docId || 'doc_' + Math.random().toString(36).substring(2, 10);
    return {
      id,
      async get() {
        const data = mockStore[self.collectionName]?.[id];
        return {
          id,
          exists: !!data,
          data: () => data,
        };
      },
      async set(data, options = {}) {
        if (!mockStore[self.collectionName]) mockStore[self.collectionName] = {};
        if (options.merge && mockStore[self.collectionName][id]) {
          mockStore[self.collectionName][id] = { ...mockStore[self.collectionName][id], ...data };
        } else {
          mockStore[self.collectionName][id] = { ...data };
        }
        saveMockData(mockStore);
        return true;
      },
      async update(data) {
        if (!mockStore[self.collectionName]) mockStore[self.collectionName] = {};
        mockStore[self.collectionName][id] = { ...(mockStore[self.collectionName][id] || {}), ...data };
        saveMockData(mockStore);
        return true;
      },
      async delete() {
        if (mockStore[self.collectionName]?.[id]) {
          delete mockStore[self.collectionName][id];
          saveMockData(mockStore);
        }
        return true;
      }
    };
  }

  async add(data) {
    const id = 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const docRef = this.doc(id);
    await docRef.set(data);
    return docRef;
  }
}

export const getDb = () => {
  if (db && !isMockDb) return db;
  return {
    collection: (name) => new MockCollectionRef(name),
  };
};

export const getIsMockDb = () => isMockDb;
export { mockStore, saveMockData };
