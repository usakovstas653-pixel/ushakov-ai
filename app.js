function showPage(id) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  const page = document.getElementById(id);
  if (page) page.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function addMessage(text, type) {
  const result = document.getElementById('chatResult');
  if (!result) return;
  const div = document.createElement('div');
  div.className = 'message ' + type;
  div.textContent = text;
  result.appendChild(div);
  result.scrollTop = result.scrollHeight;
}

function sendMessage() {
  const input = document.getElementById('chatInput');
  const result = document.getElementById('chatResult');
  if (!input || !result) return;
  const text = input.value.trim();
  if (!text) return;

  if (result.textContent.trim() === 'Здесь появится ответ.') result.textContent = '';
  addMessage(text, 'user-message');
  input.value = '';

  const thinking = document.createElement('div');
  thinking.className = 'message ai-message';
  thinking.textContent = '🤖 Думаю...';
  result.appendChild(thinking);
  result.scrollTop = result.scrollHeight;

  setTimeout(() => {
    thinking.remove();
    addMessage(getDemoAnswer(text), 'ai-message');
  }, 700);
}

function getDemoAnswer(text) {
  const q = text.toLowerCase();
  if (q.includes('привет') || q.includes('здравств')) return 'Привет! 👋 Я Ushakov AI. Задавай вопрос — помогу разобраться.';
  if (q.includes('пифагор')) return 'Теорема Пифагора: в прямоугольном треугольнике a² + b² = c², где c — гипотенуза. Например, если катеты 3 и 4, то c = 5.';
  if (q.includes('математ')) return 'Давай решим по шагам. Напиши само выражение или условие задачи.';
  if (q.includes('истори')) return 'Могу помочь разобрать историческую тему: причины, события, даты и последствия. Напиши тему.';
  return 'Я пока работаю в демо-режиме. Реальный AI подключим следующим этапом через безопасный сервер. А пока можешь попросить меня объяснить тему, решить пример или составить план.';
}

const photoInput = document.getElementById('photoInput');
if (photoInput) {
  photoInput.addEventListener('change', () => {
    const result = document.getElementById('photoResult');
    if (photoInput.files.length && result) {
      result.textContent = '📸 Фото получено! Настоящее распознавание задания подключим следующим этапом.';
    }
  });
}

function makeSummary() {
  const input = document.getElementById('summaryInput');
  const result = document.getElementById('summaryResult');
  if (!input || !result) return;
  const text = input.value.trim();
  if (!text) { result.textContent = 'Сначала вставь текст.'; return; }
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  const short = sentences.slice(0, Math.max(1, Math.ceil(sentences.length / 3))).join(' ');
  result.textContent = '📝 Демо-конспект:\n\n' + short;
}

function makeTest() {
  const input = document.getElementById('testInput');
  const result = document.getElementById('testResult');
  if (!input || !result) return;
  const topic = input.value.trim();
  if (!topic) { result.textContent = 'Напиши тему.'; return; }
  result.innerHTML = `<strong>🎯 Тренировка: ${escapeHtml(topic)}</strong><br><br>1. Назови главное понятие по теме.<br>2. Каковы основные причины или особенности?<br>3. Приведи пример.<br><br>Настоящую генерацию вопросов подключим вместе с AI.`;
}

function makeImage() {
  const input = document.getElementById('imageInput');
  const result = document.getElementById('imageResult');
  if (!input || !result) return;
  const prompt = input.value.trim();
  result.textContent = prompt
    ? '🎨 Промпт принят: «' + prompt + '». Настоящую генерацию изображения подключим следующим этапом.'
    : 'Напиши описание картинки.';
}

function activatePromo() {
  const input = document.getElementById('promoInput');
  const result = document.getElementById('promoResult');
  if (!input || !result) return;
  const code = input.value.trim().toUpperCase();
  const valid = ['WELCOME', 'PRO7', 'PRO30'];
  if (valid.includes(code)) {
    localStorage.setItem('ushakovPro', 'true');
    const plan = document.getElementById('plan');
    if (plan) plan.textContent = 'PRO';
    result.textContent = '🔥 Промокод активирован! Тариф PRO включён в этом браузере.';
  } else {
    result.textContent = '❌ Такой промокод не найден.';
  }
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
}

window.addEventListener('DOMContentLoaded', () => {
  const plan = document.getElementById('plan');
  if (plan && localStorage.getItem('ushakovPro') === 'true') plan.textContent = 'PRO';
});
