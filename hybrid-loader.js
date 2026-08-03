// =========================================================================
// HYBRID LOADER - Quran.com API + local fallback
// Tries API first, falls back to phonemes-data.js if API fails
// Caches API responses in localStorage for offline use
// =========================================================================
const HYBRID_CACHE_KEY = 'hifzapp-api-cache-v1';

let _hybridData = {
  chapters: null,      // {1: {name, verses, pages:[start,end], ...}, ...}
  pages: {},            // {1: {verses:[...]}, 2: {...}, ...}
  source: null          // 'api' or 'local' - where data came from
};

/**
 * Load chapter metadata (114 surahs).
 * Tries API first, then localStorage cache, then local phonemes-data.js.
 * @returns {Promise<Array>} Array of chapter objects
 */
async function loadChaptersHybrid(){
  // Try API first
  if(window.QuranAPI){
    try {
      const chapters = await window.QuranAPI.fetchAllChapters();
      _hybridData.chapters = chapters;
      // Save to localStorage for offline use
      try {
        localStorage.setItem(HYBRID_CACHE_KEY + '-chapters', JSON.stringify(chapters));
      } catch(e){}
      return chapters;
    } catch(e){
      console.warn('[hybrid] API failed, trying cache', e);
    }
  }
  // Try localStorage cache
  try {
    const cached = localStorage.getItem(HYBRID_CACHE_KEY + '-chapters');
    if(cached){
      _hybridData.chapters = JSON.parse(cached);
      return _hybridData.chapters;
    }
  } catch(e){}
  // Fall back to local phonemes-data.js
  return null;
}

/**
 * Load all verses for a chapter (or specific pages).
 * Returns flat array of word objects.
 * @param {number} chapterNum - chapter number 1-114
 * @returns {Promise<Array<{text, surah, ayah, position, verseKey, pageNumber}>>}
 */
async function loadChapterVersesHybrid(chapterNum){
  if(!window.QuranAPI) return null;
  // Try API
  try {
    const data = await window.QuranAPI.fetchChapterVerses(chapterNum, true);
    const words = window.QuranAPI.flattenPageWords(data);
    // Save to localStorage
    try {
      localStorage.setItem(HYBRID_CACHE_KEY + '-chapter-' + chapterNum, JSON.stringify(words));
    } catch(e){}
    _hybridData.pages[chapterNum] = words;
    return words;
  } catch(e){
    console.warn('[hybrid] API failed for chapter', chapterNum, e);
  }
  // Try localStorage cache
  try {
    const cached = localStorage.getItem(HYBRID_CACHE_KEY + '-chapter-' + chapterNum);
    if(cached){
      const words = JSON.parse(cached);
      _hybridData.pages[chapterNum] = words;
      return words;
    }
  } catch(e){}
  return null;
}

/**
 * Load all verses on a specific mushaf page (1-604).
 * @param {number} pageNum - mushaf page 1-604
 * @returns {Promise<Array<{text, surah, ayah, position, verseKey, pageNumber}>>}
 */
async function loadPageVersesHybrid(pageNum){
  if(!window.QuranAPI) return null;
  // Try API
  try {
    const data = await window.QuranAPI.fetchPage(pageNum, true);
    const words = window.QuranAPI.flattenPageWords(data);
    // Save to localStorage
    try {
      localStorage.setItem(HYBRID_CACHE_KEY + '-page-' + pageNum, JSON.stringify(words));
    } catch(e){}
    _hybridData.pages['page-' + pageNum] = words;
    return words;
  } catch(e){
    console.warn('[hybrid] API failed for page', pageNum, e);
  }
  // Try localStorage cache
  try {
    const cached = localStorage.getItem(HYBRID_CACHE_KEY + '-page-' + pageNum);
    if(cached){
      const words = JSON.parse(cached);
      _hybridData.pages['page-' + pageNum] = words;
      return words;
    }
  } catch(e){}
  return null;
}

/**
 * Build the global word array (allRefWords) for the matcher.
 * Uses the existing phonemizeArabic() to generate IPA on the fly.
 * @param {Array} words - word objects from API or local data
 * @param {Array} bismillahWords - Bismillah word objects
 * @returns {Array<{text, norm, phoneme, surah, ayah, position, globalIndex}>}
 */
function buildRefWordsFromAPI(words, bismillahWords){
  const refWords = [];
  // Group by surah
  const bySurah = {};
  for(const w of words){
    if(!bySurah[w.surah]) bySurah[w.surah] = [];
    bySurah[w.surah].push(w);
  }
  // For each surah, prepend Bismillah if not already there
  for(let s = 1; s <= 114; s++){
    const surahWords = bySurah[s] || [];
    if(surahWords.length === 0) continue;
    // Check if first verse is Bismillah (surah 1)
    const firstWord = surahWords[0];
    const isFatihah = (s === 1);
    // For surahs 2-114 (except 9), prepend Bismillah
    if(!isFatihah && s !== 9){
      for(const bw of bismillahWords){
        refWords.push({
          ...bw,
          surah: s,
          globalIndex: refWords.length
        });
      }
    }
    // Add the surah's words
    for(const w of surahWords){
      refWords.push({
        text: w.text,
        norm: normalize(w.text),
        phoneme: phonemizeArabic(w.text),
        rules: [],
        surah: w.surah,
        ayah: w.ayah,
        position: w.position,
        verseKey: w.verseKey,
        pageNumber: w.pageNumber,
        globalIndex: refWords.length
      });
    }
  }
  return refWords;
}

// Export
window.HybridLoader = {
  loadChaptersHybrid,
  loadChapterVersesHybrid,
  loadPageVersesHybrid,
  buildRefWordsFromAPI,
  getData: () => _hybridData
};
