import axios from 'axios';

const configuredEndpoint = import.meta.env.VITE_ARGOS_URL?.trim();
const FALLBACK_ENDPOINTS = [
    'http://127.0.0.1:8000/translate',
    'http://127.0.0.1:5000/translate'
];
const TRANSLATE_ENDPOINTS = configuredEndpoint
    ? [configuredEndpoint, ...FALLBACK_ENDPOINTS]
    : [...FALLBACK_ENDPOINTS];

function splitIntoChunks(pageText, maxChunkSize = 500) {
    const chunks = [];
    const sentences = pageText.match(/[^.!?]+[.!?]+/g) || [pageText];
    let currentChunk = '';

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > maxChunkSize && currentChunk) {
            chunks.push(currentChunk.trim());
            currentChunk = sentence;
        } else {
            currentChunk += sentence;
        }
    }

    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    return chunks.length ? chunks : [pageText];
}

async function postToTranslate(text, sourceLang, targetLang) {
    let lastError = null;

    for (const endpoint of [...new Set(TRANSLATE_ENDPOINTS)]) {
        try {
            const response = await axios.post(
                endpoint,
                {
                    text,
                    source: sourceLang,
                    target: targetLang
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 20000
                }
            );

            const translatedText = response?.data?.translatedText;
            if (!translatedText) {
                throw new Error('Translation API returned empty response');
            }

            return translatedText;
        } catch (error) {
            const serverDetail = error?.response?.data?.detail;
            lastError = new Error(serverDetail || error?.message || `Request failed for ${endpoint}`);
            console.error('Translation request failed:', {
                endpoint,
                message: lastError.message,
                status: error?.response?.status
            });
        }
    }

    throw lastError || new Error('All translation endpoints failed');
}

async function translatePage(pageText, onProgress) {
    const chunks = splitIntoChunks(pageText, 500);

    const promises = chunks.map((chunk) =>
        postToTranslate(chunk, "en", "ml")
    );

    const translatedChunks = await Promise.all(promises);

    if (onProgress) {
        onProgress(chunks.length, chunks.length);
    }

    return translatedChunks.join(" ");
}

export async function translateDocument(pages, onProgress) {
    const results = [];

    for (let i = 0; i < pages.length; i++) {
        const pageText = pages[i].trim();

        if (!pageText) {
            results.push('');
            continue;
        }

        const translated = await translatePage(pageText, (done, total) => {
            if (onProgress) {
                const overallProgress = ((i + (done / total)) / pages.length) * 100;
                onProgress(Math.round(overallProgress), 100);
            }
        });

        results.push(translated);
    }

    return results;
}
