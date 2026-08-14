/* ================= AI ADMISSION MENTOR - MindPal Chatbot Integration ================= */
(function(){
  'use strict';

  /* Add AI Mentor to render dispatch */
  const originalRender = window.render;
  window.render = function(){
    const p = Router.path;
    if(p === 'ai-mentor') return renderAIMentor();
    return originalRender.apply(this, arguments);
  };

  /* AI Mentor removed from navigation; it now lives as a Command Center shortcut below */

  /* Update baseTab function to handle ai-mentor route */
  const originalBaseTab = window.baseTab;
  window.baseTab = function(path){
    if(path.startsWith('ai-mentor')) return 'ai-mentor';
    return originalBaseTab.apply(this, arguments);
  };

  /* Main render function for AI Mentor page */
  function renderAIMentor(){
    const html = `
      <div class="ai-mentor-page">
        <!-- Header Card -->
        <div class="card premium-card ai-mentor-header fade-in">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div style="font-size: 32px;">🧠</div>
            <div style="flex: 1;">
              <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #fff;">AI Admission Mentor</h2>
              <p style="margin: 4px 0 0; font-size: 12px; color: rgba(255,255,255,0.8);">বাংলা ভাষায় ভর্তি প্রস্তুতি সহায়ক</p>
            </div>
          </div>
          <div style="background: rgba(255,255,255,0.1); border-radius: 10px; padding: 10px 12px; font-size: 12px; color: rgba(255,255,255,0.9); line-height: 1.5;">
            📚 প্রশ্ন সমাধান, ভুল বিশ্লেষণ, পড়াশোনার রুটিন ও GK - সব কিছুতে AI সহায়তা পান।
          </div>
        </div>

        <!-- Features Grid -->
        <div class="ai-mentor-features fade-in" style="animation-delay: 0.1s;">
          <div class="feature-item">
            <div class="feature-icon">📖</div>
            <div class="feature-title">প্রশ্ন সমাধান</div>
            <div class="feature-desc">যেকোনো প্রশ্নের বিস্তারিত ব্যাখ্যা পান</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">❌</div>
            <div class="feature-title">ভুল বিশ্লেষণ</div>
            <div class="feature-desc">ভুলের কারণ খুঁজে পান এবং শিখুন</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📅</div>
            <div class="feature-title">পড়াশোনার পরিকল্পনা</div>
            <div class="feature-desc">আপনার জন্য কাস্টম রুটিন তৈরি করুন</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🌍</div>
            <div class="feature-title">সাধারণ জ্ঞান</div>
            <div class="feature-desc">GK প্রশ্নের উত্তর এবং টিপস জানুন</div>
          </div>
        </div>

        <!-- AI Chatbot Container -->
        <div class="ai-mentor-chatbot fade-in" style="animation-delay: 0.2s;">
          <iframe
            src="https://chatbot.getmindpal.com/bengali-admission-mentor-ffw"
            allow="clipboard-read; clipboard-write; microphone"
            style="width: 100%; height: 700px; border: none; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);"
            title="AI Admission Mentor Chatbot">
          </iframe>
        </div>

        <!-- Info Card -->
        <div class="card ai-mentor-info fade-in" style="animation-delay: 0.3s;">
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 10px; color: var(--text);">💡 টিপস:</div>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: var(--sub); line-height: 1.6;">
            <li style="margin-bottom: 8px;">প্রশ্নের ধরন অনুযায়ী AI-কে সাহায্য করতে বলুন</li>
            <li style="margin-bottom: 8px;">বিস্তারিত উত্তর পেতে শট প্রশ্ন না করে সম্পূর্ণ প্রেক্ষাপট শেয়ার করুন</li>
            <li style="margin-bottom: 8px;">ভুল উত্তর হলে এটি সংশোধন করতে বলতে পারেন</li>
            <li>আপনার পড়াশোনার গতিপ্রণালী উন্নত করতে নিয়মিত AI-র সাথে যোগাযোগ করুন</li>
          </ul>
        </div>

        <!-- Back to Dashboard -->
        <div style="margin-top: 20px; text-align: center;">
          <button class="btn secondary btn-press" onclick="navigate('dashboard')" style="max-width: 300px;">
            ← ড্যাশবোর্ডে ফিরুন
          </button>
        </div>
      </div>
    `;

    renderShell(html, {
      title: 'AI Admission Mentor',
      back: 'navigate("dashboard")'
    });
  }

  /* CSS Styles for AI Mentor */
  const style = document.createElement('style');
  style.id = 'ai-mentor-styles';
  style.textContent = `
    .ai-mentor-page {
      padding: 16px 0;
    }

    .ai-mentor-header {
      animation: fadeUp 0.5s ease-out forwards;
    }

    .ai-mentor-features {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 20px;
      animation: fadeUp 0.5s ease-out forwards;
    }

    .feature-item {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 14px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .feature-item:active {
      transform: scale(0.96);
    }

    .feature-icon {
      font-size: 24px;
      margin-bottom: 8px;
    }

    .feature-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 4px;
    }

    .feature-desc {
      font-size: 11px;
      color: var(--sub);
      line-height: 1.4;
    }

    .ai-mentor-chatbot {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      margin-bottom: 20px;
      animation: fadeUp 0.5s ease-out forwards;
    }

    .ai-mentor-chatbot iframe {
      display: block;
      width: 100%;
    }

    .ai-mentor-info {
      animation: fadeUp 0.5s ease-out forwards;
      border-left: 4px solid var(--emerald);
    }

    @media (max-width: 560px) {
      .ai-mentor-features {
        grid-template-columns: 1fr;
      }

      .ai-mentor-chatbot iframe {
        min-height: 600px;
      }
    }

    @media (max-width: 390px) {
      .ai-mentor-header {
        padding: 14px;
      }

      .feature-item {
        padding: 12px;
      }

      .feature-title {
        font-size: 12px;
      }

      .feature-desc {
        font-size: 10px;
      }

      .ai-mentor-chatbot iframe {
        min-height: 500px;
      }
    }

    /* iPad/Tablet optimization */
    @media (min-width: 768px) {
      .ai-mentor-features {
        grid-template-columns: repeat(4, 1fr);
      }

      .ai-mentor-chatbot iframe {
        min-height: 800px;
      }
    }

    /* Light theme */
    .ai-mentor-header {
      background: linear-gradient(135deg, var(--emerald), var(--emerald-d));
      color: #fff;
      border: none;
    }

    /* Fade-in animation */
    @keyframes fadeUp {
      from {
        opacity: 0;
        transform: translateY(6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .fade-in {
      animation: fadeUp 0.5s ease-out forwards;
    }
  `;

  if(document.head) {
    document.head.appendChild(style);
  } else {
    document.addEventListener('DOMContentLoaded', () => document.head.appendChild(style));
  }

  /* Add AI Mentor as a shortcut tile in the Dashboard Command Center carousel */
  function injectAIMentorCommandTile(){
    const track = document.getElementById('commandTrack');
    if(!track || track.querySelector('[data-ai-mentor-tile]')) return;
    const tile = document.createElement('button');
    tile.className = 'p3-command-card-v3';
    tile.setAttribute('data-ai-mentor-tile', 'true');
    tile.type = 'button';
    tile.innerHTML = '<span class="p3-command-icon-v3">🧠</span><span class="p3-command-title-v3">AI Mentor</span><span class="p3-command-subtitle-v3">ভর্তি AI সহকারী</span>';
    tile.addEventListener('click', () => navigate('ai-mentor'));
    track.appendChild(tile);
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', injectAIMentorCommandTile);
  } else {
    injectAIMentorCommandTile();
  }

  console.log('✅ AI Admission Mentor Integration Loaded');
})();
