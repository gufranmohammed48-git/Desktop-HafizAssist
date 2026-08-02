// =========================================================================
// QURAN.COM API WRAPPER
// Fetches text + audio + page layout from the official Quran.com API.
// Free, no API key required for basic endpoints.
// Docs: https://quran.api-docs.io/
// =========================================================================
const QURAN_API_BASE = 'https://api.quran.com/api/v4';
const QURAN_AUDIO_BASE = 'https://audio.qurancdn.com/';  // base for relative audio URLs
const QURAN_TEXT_BASE = 'https://api.quran.com/api/v4/quran/verses/uthmani';  // full Uthmani text

// Simple in-memory cache to avoid re-fetching
const _cache = {
  chapters: null,           // {1: {name, verses, pages}, ...}
  pages: {},                // {1: {verses: [...], words: [...]}, ...}
  audio: {}                 // {verseKey: url}
};

/**
 * Fetch metadata for all 114 surahs (chapter).
 * @returns {Promise<Array>} Array of chapter objects
 */
async function fetchAllChapters(){
  if(_cache.chapters) return _cache.chapters;
  const url = `${QURAN_API_BASE}/chapters?language=en`;
  const res = await fetch(url);
  if(!res.ok) throw new Error(`fetchAllChapters failed: ${res.status}`);
  const data = await res.json();
  _cache.chapters = data.chapters;
  return _cache.chapters;
}

/**
 * Get a single chapter's metadata.
 * @param {number} num - chapter number (1-114)
 * @returns {Promise<Object>} Chapter object
 */
async function fetchChapter(num){
  const all = await fetchAllChapters();
  return all.find(c => c.id === num);
}

/**
 * Fetch all verses on a specific mushaf page (1-604).
 * @param {number} pageNum - mushaf page number (1-604)
 * @param {boolean} includeWords - include word-by-word data
 * @returns {Promise<Object>} {verses: [...], page_number: N}
 */
async function fetchPage(pageNum, includeWords = true){
  if(_cache.pages[pageNum]) return _cache.pages[pageNum];
  let url = `${QURAN_API_BASE}/verses/by_page/${pageNum}?language=en&fields=text_uthmani`;
  if(includeWords){
    url += '&words=true&word_fields=text_uthmani,text_imlaei,transliteration';
  }
  const res = await fetch(url);
  if(!res.ok) throw new Error(`fetchPage(${pageNum}) failed: ${res.status}`);
  const data = await res.json();
  _cache.pages[pageNum] = data;
  return data;
}

/**
 * Fetch all verses in a specific chapter.
 * @param {number} chapterNum - chapter (surah) number (1-114)
 * @param {boolean} includeWords - include word-by-word data
 * @returns {Promise<Object>} {verses: [...]}
 */
async function fetchChapterVerses(chapterNum, includeWords = true){
  let url = `${QURAN_API_BASE}/verses/by_chapter/${chapterNum}?language=en&fields=text_uthmani`;
  if(includeWords){
    url += '&words=true&word_fields=text_uthmani,text_imlaei,transliteration';
  }
  const res = await fetch(url);
  if(!res.ok) throw new Error(`fetchChapterVerses(${chapterNum}) failed: ${res.status}`);
  return await res.json();
}

/**
 * Get audio URL for a verse.
 * @param {string} verseKey - e.g., "1:1" (surah:ayah)
 * @param {number} recitationId - reciter ID (default 2 = AbdulBaset Murattal)
 * @returns {Promise<string>} Full audio URL
 */
async function fetchVerseAudio(verseKey, recitationId = 2){
  const cacheKey = `${recitationId}:${verseKey}`;
  if(_cache.audio[cacheKey]) return _cache.audio[cacheKey];
  const url = `${QURAN_API_BASE}/recitations/${recitationId}/by_ayah/${verseKey}`;
  const res = await fetch(url);
  if(!res.ok) throw new Error(`fetchVerseAudio failed: ${res.status}`);
  const data = await res.json();
  const audioUrl = data.audio_files?.[0]?.url;
  if(!audioUrl) throw new Error('No audio URL in response');
  // Make absolute if relative
  const fullUrl = audioUrl.startsWith('http') ? audioUrl : QURAN_AUDIO_BASE + audioUrl;
  _cache.audio[cacheKey] = fullUrl;
  return fullUrl;
}

/**
 * Get the list of available reciters.
 * @returns {Promise<Array>} Array of {id, name, style}
 */
async function fetchRecitations(){
  const url = `${QURAN_API_BASE}/resources/recitations?language=en`;
  const res = await fetch(url);
  if(!res.ok) throw new Error('fetchRecitations failed');
  const data = await res.json();
  return data.recitations;
}

/**
 * Flatten page data into a list of words (for the matcher).
 * Skips Bismillah if it's already part of the first verse.
 * @param {Object} pageData - result of fetchPage()
 * @returns {Array<{text, surah, ayah, position}>}
 */
function flattenPageWords(pageData){
  const words = [];
  for(const verse of pageData.verses){
    if(verse.words){
      for(const w of verse.words){
        // Skip 'end' markers (verse end markers like ﴿﴾)
        if(w.char_type_name === 'end') continue;
        if(w.char_type_name === 'pause') continue;
        const [surah, ayah] = verse.verse_key.split(':').map(Number);
        words.push({
          text: w.text_uthmani || w.text,
          surah,
          ayah,
          position: w.position,
          verseKey: verse.verse_key,
          pageNumber: pageData.page_number || w.page_number
        });
      }
    }
  }
  return words;
}

// Export for use in the main app
window.QuranAPI = {
  fetchAllChapters,
  fetchChapter,
  fetchPage,
  fetchChapterVerses,
  fetchVerseAudio,
  fetchRecitations,
  flattenPageWords,
  clearCache: () => { _cache.chapters = null; _cache.pages = {}; _cache.audio = {}; }
};
