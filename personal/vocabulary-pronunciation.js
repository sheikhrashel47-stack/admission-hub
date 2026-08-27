/* Direct, mobile-safe Vocabulary pronunciation. Runs synchronously on the tap gesture. */
(() => {
  'use strict';
  const supported = () => 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const englishVoices = () => (window.speechSynthesis?.getVoices?.() || []).filter(voice => /^en(-|_)/i.test(voice.lang || ''));
  const pickVoice = () => {
    const voices = englishVoices();
    const natural = /samantha|ava|karen|daniel|moira|allison|serena|aria|jenny|zira|sonia|google uk english female|google us english|microsoft.*online|natural|enhanced/i;
    const ranked = voices.map(voice => {
      const name = String(voice.name || '');
      const lang = String(voice.lang || '').toLowerCase();
      let score = 0;
      if (natural.test(name)) score += 50;
      if (lang === 'en-us') score += 20;
      if (lang === 'en-gb') score += 12;
      if (voice.localService) score += 5;
      if (/compact|espeak|festival|robot/i.test(name)) score -= 30;
      return { voice, score };
    }).sort((a, b) => b.score - a.score);
    return ranked[0]?.voice || voices[0] || null;
  };
  const speak = raw => {
    const word = String(raw || '').trim().replace(/[^A-Za-z' -]/g, '');
    if (!word) return;
    if (!supported()) { window.toast?.('এই device-এ pronunciation available নয়'); return; }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = .88;
      utterance.pitch = 1.02;
      utterance.volume = 1;
      const voice = pickVoice();
      if (voice) { utterance.voice = voice; utterance.lang = voice.lang || utterance.lang; }
      window.speechSynthesis.speak(utterance);
    } catch (_) {
      window.toast?.('Pronunciation শুরু করা যায়নি');
    }
  };
  if (supported()) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', () => window.speechSynthesis.getVoices());
  }
  window.VocabularyPronunciation = { play: speak, stop: () => window.speechSynthesis?.cancel?.() };
})();
