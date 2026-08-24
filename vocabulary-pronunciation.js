/* Direct, mobile-safe Vocabulary pronunciation. Runs synchronously on the tap gesture. */
(() => {
  'use strict';
  const supported = () => 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const englishVoices = () => (window.speechSynthesis?.getVoices?.() || []).filter(voice => /^en(-|_)/i.test(voice.lang || ''));
  const pickVoice = () => {
    const voices = englishVoices();
    const natural = /samantha|ava|karen|daniel|moira|allison|serena|aria|jenny|zira|sonia|google uk english female|google us english|natural|enhanced/i;
    return voices.find(voice => natural.test(voice.name || '')) || voices.find(voice => voice.localService) || voices[0] || null;
  };
  const speak = raw => {
    const word = String(raw || '').trim().replace(/[^A-Za-z' -]/g, '');
    if (!word) return;
    if (!supported()) { window.toast?.('এই device-এ pronunciation available নয়'); return; }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = .76;
      utterance.pitch = 1;
      utterance.volume = 1;
      const voice = pickVoice();
      if (voice) utterance.voice = voice;
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
