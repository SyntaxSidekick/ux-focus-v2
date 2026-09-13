interface StorageBackend {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

interface StorageEnvironment {
  readonly uxFocusStorage?: StorageBackend;
  readonly localStorage: StorageBackend;
}

// Resolve lazily: importing this module does not access browser globals, and
// Electron reads/writes need not touch localStorage unless a value is missing.
export function createStorageAdapter(getEnvironment: () => StorageEnvironment = () => window) {
  const unreadableKeys = new Set<string>();

  function markUnreadable(key: string) {
    unreadableKeys.add(key);
  }

  function assertWritable(key: string, message = "The existing save could not be read; refusing to overwrite it.") {
    if (unreadableKeys.has(key)) throw new Error(message);
  }

  function read(key: string): string | null {
    try {
      const environment = getEnvironment();
      const desktop = environment.uxFocusStorage;
      const saved = desktop?.getItem(key);
      if (saved != null) return saved;
      const legacy = environment.localStorage.getItem(key);
      if (legacy != null && desktop) desktop.setItem(key, legacy);
      return legacy;
    } catch (error) {
      markUnreadable(key);
      throw error;
    }
  }

  function write(key: string, value: string) {
    assertWritable(key);
    const environment = getEnvironment();
    if (environment.uxFocusStorage) environment.uxFocusStorage.setItem(key, value);
    else environment.localStorage.setItem(key, value);
  }

  return { read, write, markUnreadable, assertWritable };
}

// One protection set per renderer lifetime, matching the former App.tsx state.
export const savedStorage = createStorageAdapter();
