const QueryCache = (function() {
    'use strict';

    const CACHE_CONTEXT = 'QueryCache';
    const MEMORY_CACHE = new Map();
    const INFLIGHT_REQUESTS = new Map();
    const STORAGE_PREFIX = 'qc_';
    
    const DEFAULT_TTL = 60 * 1000;
    const STORAGE_TTL = 5 * 60 * 1000;
    const MAX_MEMORY_ENTRIES = 100;

    let _enabled = true;
    let _stats = {
        hits: 0,
        misses: 0,
        deduped: 0,
        errors: 0
    };

    function log(message, meta = null) {
        const timestamp = new Date().toISOString();
        console.log(
            `%c[INFO]%c ${timestamp} [${CACHE_CONTEXT}] ${message}`,
            'color: #9C27B0; font-weight: bold; background: #F3E5F5; padding: 2px 6px; border-radius: 3px;',
            'color: inherit;'
        );
        if (meta) console.log('  Meta:', meta);
    }

    function warn(message) {
        console.warn(`[${CACHE_CONTEXT}] ${message}`);
    }

    function generateCacheKey(table, query) {
        const queryStr = JSON.stringify(query);
        return `${table}:${simpleHash(queryStr)}`;
    }

    function simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }

    function getFromMemory(key) {
        const entry = MEMORY_CACHE.get(key);
        if (entry && Date.now() < entry.expires) {
            _stats.hits++;
            return entry.data;
        }
        if (entry) {
            MEMORY_CACHE.delete(key);
        }
        return null;
    }

    function setInMemory(key, data, ttl = DEFAULT_TTL) {
        if (MEMORY_CACHE.size >= MAX_MEMORY_ENTRIES) {
            const firstKey = MEMORY_CACHE.keys().next().value;
            MEMORY_CACHE.delete(firstKey);
        }
        MEMORY_CACHE.set(key, {
            data: data,
            expires: Date.now() + ttl,
            created: Date.now()
        });
    }

    function getFromStorage(key) {
        try {
            const stored = localStorage.getItem(STORAGE_PREFIX + key);
            if (stored) {
                const entry = JSON.parse(stored);
                if (Date.now() < entry.expires) {
                    return entry.data;
                }
                localStorage.removeItem(STORAGE_PREFIX + key);
            }
        } catch (e) {
            warn('Storage read error: ' + e.message);
        }
        return null;
    }

    function setInStorage(key, data, ttl = STORAGE_TTL) {
        try {
            localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify({
                data: data,
                expires: Date.now() + ttl,
                created: Date.now()
            }));
        } catch (e) {
            warn('Storage write error: ' + e.message);
        }
    }

    function get(key, useStorage = false) {
        if (!_enabled) return null;

        const memoryResult = getFromMemory(key);
        if (memoryResult !== null) {
            return memoryResult;
        }

        if (useStorage) {
            const storageResult = getFromStorage(key);
            if (storageResult !== null) {
                setInMemory(key, storageResult);
                _stats.hits++;
                return storageResult;
            }
        }

        _stats.misses++;
        return null;
    }

    function set(key, data, options = {}) {
        if (!_enabled) return;

        const memoryTtl = options.memoryTtl || DEFAULT_TTL;
        const storageTtl = options.storageTtl || STORAGE_TTL;
        const persist = options.persist !== false;

        setInMemory(key, data, memoryTtl);

        if (persist) {
            setInStorage(key, data, storageTtl);
        }
    }

    function invalidate(keyPattern) {
        let count = 0;

        for (const key of MEMORY_CACHE.keys()) {
            if (key.includes(keyPattern)) {
                MEMORY_CACHE.delete(key);
                count++;
            }
        }

        try {
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key && key.startsWith(STORAGE_PREFIX) && key.includes(keyPattern)) {
                    localStorage.removeItem(key);
                    count++;
                }
            }
        } catch (e) {
            warn('Storage invalidation error: ' + e.message);
        }

        if (count > 0) {
            log(`Invalidated ${count} cache entries matching: ${keyPattern}`);
        }

        return count;
    }

    async function dedupedFetch(key, fetchFn) {
        if (INFLIGHT_REQUESTS.has(key)) {
            _stats.deduped++;
            log(`Request deduped: ${key}`);
            return INFLIGHT_REQUESTS.get(key);
        }

        const promise = (async () => {
            try {
                const result = await fetchFn();
                return result;
            } finally {
                INFLIGHT_REQUESTS.delete(key);
            }
        })();

        INFLIGHT_REQUESTS.set(key, promise);
        return promise;
    }

    async function cachedQuery(table, queryBuilder, options = {}) {
        if (!_enabled) {
            return await queryBuilder();
        }

        const cacheKey = options.cacheKey || generateCacheKey(table, options.queryId || 'default');
        const useStorage = options.persist !== false;
        const ttl = options.ttl || DEFAULT_TTL;

        const cached = get(cacheKey, useStorage);
        if (cached !== null) {
            log(`Cache hit: ${cacheKey}`);
            return { data: cached, error: null, fromCache: true };
        }

        return await dedupedFetch(cacheKey, async () => {
            const startTime = Date.now();
            const result = await queryBuilder();
            const elapsed = Date.now() - startTime;

            if (!result.error && result.data) {
                set(cacheKey, result.data, { 
                    memoryTtl: ttl, 
                    storageTtl: options.storageTtl || STORAGE_TTL,
                    persist: useStorage 
                });
                log(`Cached query result: ${cacheKey} (${elapsed}ms)`);
            }

            return { ...result, fromCache: false, fetchTime: elapsed };
        });
    }

    function clear() {
        MEMORY_CACHE.clear();
        INFLIGHT_REQUESTS.clear();

        try {
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key && key.startsWith(STORAGE_PREFIX)) {
                    localStorage.removeItem(key);
                }
            }
        } catch (e) {
            warn('Storage clear error: ' + e.message);
        }

        log('Cache cleared');
    }

    function getStats() {
        const total = _stats.hits + _stats.misses;
        return {
            ..._stats,
            hitRate: total > 0 ? (_stats.hits / total * 100).toFixed(1) + '%' : '0%',
            memorySize: MEMORY_CACHE.size,
            inflightCount: INFLIGHT_REQUESTS.size
        };
    }

    function enable() {
        _enabled = true;
        log('Cache enabled');
    }

    function disable() {
        _enabled = false;
        log('Cache disabled');
    }

    function isEnabled() {
        return _enabled;
    }

    return {
        get,
        set,
        invalidate,
        cachedQuery,
        dedupedFetch,
        clear,
        getStats,
        enable,
        disable,
        isEnabled,
        generateCacheKey
    };
})();

if (typeof window !== 'undefined') {
    window.QueryCache = QueryCache;
}
