const hasWindow = () => typeof window !== 'undefined'

const getStorage = () => {
  if (!hasWindow()) {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

export const getFromStorage = (key, defaultValue) => {
  const storage = getStorage()

  if (!storage) {
    return defaultValue
  }

  try {
    const raw = storage.getItem(key)

    if (!raw) {
      return defaultValue
    }

    return JSON.parse(raw)
  } catch {
    return defaultValue
  }
}

export const saveToStorage = (key, value) => {
  const storage = getStorage()

  if (!storage) {
    return false
  }

  try {
    storage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export const removeFromStorage = (key) => {
  const storage = getStorage()

  if (!storage) {
    return false
  }

  try {
    storage.removeItem(key)
    return true
  } catch {
    return false
  }
}

export const clearStorageByPrefix = (prefix) => {
  const storage = getStorage()

  if (!storage) {
    return false
  }

  try {
    const keysToDelete = []

    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index)

      if (typeof key === 'string' && key.startsWith(prefix)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach((key) => storage.removeItem(key))
    return true
  } catch {
    return false
  }
}
