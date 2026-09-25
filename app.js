const API_URL = 'https://ushakov-ai-api123.usakovstas653.workers.dev';

function showPage(id) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  const page = document.getElementById(id);

  if (page) {
    page.classList.add('active');
  }
}

function addMessage(text, type) {
  const result = document.getElementById('messages');

  if (!result) return;

  const div = document.createElement('div');
  div.className = 'message ' + type;
  div.textContent = text;

  result.appendChild(div);
  result.scrollTop = result.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const result = document.getElementById('messages');

  if (!input || !result) return;

  const text = input.value.trim();

  if (!text) return;

  addMessage(text, 'user');
  input.value = '';

  const thinking = document.createElement('div');
  thinking.className = 'message ai';
  thinking.textContent = '🤖 Думаю...';

  result.appendChild(thinking);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: text
      })
    });

    const data = await response.json();

    thinking.remove();

    if (!response.ok) {
      addMessage(
        '❌ Ошибка AI: ' + (data.error || 'неизвестная ошибка'),
        'ai'
      );
      return;
    }

    addMessage(
      data.answer || '🤖 AI не вернул ответ.',
      'ai'
    );

  } catch (error) {
    thinking.remove();

    addMessage(
      '❌ Ошибка подключения к Ushakov AI.',
      'ai'
    );
  }
}

const chatInput = document.getElementById('chatInput');

if (chatInput) {
  chatInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendMessage();
    }
  });
}

const photoInput = document.getElementById('photoInput');

if (photoInput) {
  photoInput.addEventListener('change', function() {
    const result = document.getElementById('photoResult');

    if (photoInput.files.length && result) {
      result.textContent =
        '📸 Фото получено! Распознавание подключим следующим этапом.';
    }
  });
}

function makeSummary() {
  const input = document.getElementById('summaryInput');
  const result = document.getElementById('summaryResult');

  if (!input || !result) return;

  const text = input.value.trim();

  if (!text) {
    result.textContent = 'Сначала вставь текст.';
    return;
  }

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  const short = sentences
    .slice(0, Math.max(1, Math.ceil(sentences.length / 3)))
    .join(' ');

  result.textContent = '📝 Демо-конспект:\n\n' + short;
}

function makeTest() {
  const input = document.getElementById('testInput');
  const result = document.getElementById('testResult');

  if (!input || !result) return;

  const topic = input.value.trim();

  if (!topic) {
    result.textContent = 'Напиши тему.';
    return;
  }

  result.textContent =
    '🎯 Тренировка: ' + topic +
    '\n\n1. Назови главное понятие по теме.' +
    '\n2. Каковы основные причины или особенности?' +
    '\n3. Приведи пример.';
}

function makeImage() {
  const input = document.getElementById('imageInput');
  const result = document.getElementById('imageResult');

  if (!input || !result) return;

  const prompt = input.value.trim();

  result.textContent = prompt
    ? '🎨 Идея принята: «' + prompt + '»'
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

    if (plan) {
      plan.textContent = 'PRO';
    }

    result.textContent =
      '🔥 Промокод активирован! Тариф PRO включён.';
  } else {
    result.textContent = '❌ Такой промокод не найден.';
  }
}

window.addEventListener('DOMContentLoaded', function() {
  const plan = document.getElementById('plan');

  if (
    plan &&
    localStorage.getItem('ushakovPro') === 'true'
  ) {
    plan.textContent = 'PRO';
  }
});
