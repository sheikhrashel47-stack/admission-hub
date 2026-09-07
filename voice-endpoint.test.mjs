// admission-hub: voice-এন্ডপয়েন্ট-সুরক্ষা (২০২৬-০৯-০৭)
// নিয়ম: কোনো *.workers.dev-ডিফল্ট/সেভ-নয়; ডিফল্ট = pages.dev-প্রক্সি (নেটে-খোলে+voice-worker-এ-পৌঁছে)।
import { readFileSync } from 'fs';
let pass = 0, fail = 0;
const t = (n, c) => { if (c) { pass++; console.log('  ✓', n); } else { fail++; console.log('  ✗', n); } };
const VE = readFileSync('vocabulary-elevenlabs.js', 'utf8');
const H = readFileSync('index.html', 'utf8');
const SW = readFileSync('sw.js', 'utf8');
t('ডিফল্ট-এন্ডপয়েন্ট = https://admissionhub.pages.dev (এবং-ভেতরে-/api/voice-ডাকা)', VE.includes("const DEFAULT_LIVE = 'https://admissionhub.pages.dev'") && VE.includes("proxyUrl + '/api/voice'"));
t('workers.dev-মাইগ্রেশন: সেভ-ভ্যালু-workers.dev-হলে → pages.dev-ডিফল্ট', VE.includes("proxyUrl.includes('.workers.dev')") && VE.includes('localStorage.setItem(LS_ENDPOINT, DEFAULT_LIVE)'));
t('কোডে-কোনো-workers.dev-স্কিম-ডিফল্ট-নেই (কমেন্ট-বাদ-দিয়ে-সত্য-মান-চেক)', !/DEFAULT_LIVE = '[^']*\.workers\.dev'/.test(VE) && !/DEFAULT_ENDPOINT = '[^']*\.workers\.dev'/.test(VE));
t('ভার্সন-সুসংগত: el-voice-v108 (index+sw) + sw v193-voice-pagesproxy-20260907', H.includes('vocabulary-elevenlabs.js?v=el-voice-v108') && SW.includes("'./vocabulary-elevenlabs.js?v=el-voice-v108'") && SW.includes("const BUILD_ID = 'v193-voice-pagesproxy-20260907'") && H.includes('v193-voice-pagesproxy-20260907'));
console.log(`\nHUB-VOICE-ENDPOINT: ${pass} pass / ${fail} fail`);
process.exit(fail ? 1 : 0);
