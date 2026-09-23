export async function fetchJson(url, { signal } = {}) {
    const response = await fetch(url, {
        signal
    });

    if (!response.ok) {
        const error = new Error(
            `HTTP ${response.status}: ${response.statusText}`
        );

        error.status = response.status;

        throw error;
    }

    return await response.json();
}


export function loadImage(url, { signal } = {}) {
    return new Promise((resolve, reject) => {
        const image = new Image();

        let aborted = false;

        const abortHandler = () => {
            aborted = true;
            image.src = "";

            reject(
                new DOMException(
                    "Завантаження скасовано",
                    "AbortError"
                )
            );
        };

        if (signal) {
            if (signal.aborted) {
                abortHandler();
                return;
            }

            signal.addEventListener(
                "abort",
                abortHandler,
                { once: true }
            );
        }

        image.onload = () => {
            if (signal) {
                signal.removeEventListener(
                    "abort",
                    abortHandler
                );
            }

            if (!aborted) {
                resolve(image);
            }
        };

        image.onerror = () => {
            if (signal) {
                signal.removeEventListener(
                    "abort",
                    abortHandler
                );
            }

            if (!aborted) {
                reject(
                    new Error(
                        `Не вдалося завантажити зображення: ${url}`
                    )
                );
            }
        };

        image.src = url;
    });
}


export async function loadAudio(
    ctx,
    url,
    { signal } = {}
) {
    const response = await fetch(url, {
        signal
    });

    if (!response.ok) {
        const error = new Error(
            `HTTP ${response.status}: ${response.statusText}`
        );

        error.status = response.status;

        throw error;
    }

    const arrayBuffer =
        await response.arrayBuffer();

    if (signal?.aborted) {
        throw new DOMException(
            "Завантаження скасовано",
            "AbortError"
        );
    }

    return await ctx.decodeAudioData(
        arrayBuffer
    );
}


export async function loadJson(
    url,
    { signal } = {}
) {
    return await fetchJson(url, {
        signal
    });
}


function sleep(ms, signal) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(
            resolve,
            ms
        );

        if (!signal) {
            return;
        }

        if (signal.aborted) {
            clearTimeout(timer);

            reject(
                new DOMException(
                    "Завантаження скасовано",
                    "AbortError"
                )
            );

            return;
        }

        signal.addEventListener(
            "abort",
            () => {
                clearTimeout(timer);

                reject(
                    new DOMException(
                        "Завантаження скасовано",
                        "AbortError"
                    )
                );
            },
            { once: true }
        );
    });
}


export async function withRetry(
    fn,
    {
        attempts = 3,
        baseMs = 300,
        signal
    } = {}
) {
    let lastError;

    for (
        let attempt = 1;
        attempt <= attempts;
        attempt++
    ) {
        if (signal?.aborted) {
            throw new DOMException(
                "Завантаження скасовано",
                "AbortError"
            );
        }

        try {
            return await fn(signal);

        } catch (error) {
            lastError = error;

            if (
                error.name === "AbortError"
            ) {
                throw error;
            }

            if (
                error.status >= 400 &&
                error.status < 500
            ) {
                throw error;
            }

            if (attempt === attempts) {
                throw lastError;
            }

            const exponentialDelay =
                baseMs *
                Math.pow(
                    2,
                    attempt - 1
                );

            const jitter =
                Math.random() * 100;

            await sleep(
                exponentialDelay + jitter,
                signal
            );
        }
    }

    throw lastError;
}


async function loadManifestItem(
    item,
    ctx,
    signal,
    baseUrl
) {
    // Перетворюємо "./sprites/ship.png"
    // у повний URL відносно manifest.json
    const url = new URL(
        item.url,
        baseUrl
    ).href;

    if (item.type === "image") {
        return await loadImage(url, {
            signal
        });
    }

    if (item.type === "audio") {
        return await loadAudio(
            ctx,
            url,
            { signal }
        );
    }

    if (item.type === "json") {
        return await loadJson(url, {
            signal
        });
    }

    throw new Error(
        `Невідомий тип ресурсу: ${item.type}`
    );
}


export async function loadAll(
    manifest,
    {
        onProgress = () => {},
        signal,
        audioContext,
        baseUrl
    } = {}
) {
    const items = [
        ...(manifest.sprites || []),
        ...(manifest.sounds || []),
        ...(manifest.data || [])
    ];

    const total = items.length;

    if (total === 0) {
        onProgress(1);
        return {};
    }

    let completed = 0;

    const loadedAssets = {};

    const promises = items.map(
        async (item) => {

            const result =
                await withRetry(
                    (currentSignal) =>
                        loadManifestItem(
                            item,
                            audioContext,
                            currentSignal,
                            baseUrl
                        ),
                    {
                        attempts: 3,
                        baseMs: 300,
                        signal
                    }
                );

            loadedAssets[item.name] =
                result;

            completed++;

            onProgress(
                completed / total
            );

            return result;
        }
    );

    await Promise.all(promises);

    return loadedAssets;
}