const API_URL = 'https://ushakov-ai-api123.usakovstas653.workers.dev';

function showPage(id) {
  document.querySelectorAll('.page').forEach(function(page) {
    page.classList.remove('active');
  });

  const page = document.getElementById(id);

  if (page) {
    page.classList.add('active');
  }

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}


function addMessage(text, type) {
  const messages = document.getElementById('messages');

  if (!messages) {
    return;
  }

  const message = document.createElement('div');

  message.className = 'message ' + type;
  message.textContent = text;

  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
}


async function sendMessage() {

  const input = document.getElementById('chatInput');
  const messages = document.getElementById('messages');

  if (!input || !messages) {
    return;
  }

  const text = input.value.trim();

  if (!text) {
    return;
  }

  addMessage(text, 'user');

  input.value = '';

  const thinking = document.createElement('div');

  thinking.className = 'message ai';
  thinking.textContent = '🤖 Думаю...';

  messages.appendChild(thinking);

  messages.scrollTop = messages.scrollHeight;


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
        '❌ Ошибка AI: ' +
        (data.error || 'неизвестная ошибка'),
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
      '❌ Не удалось подключиться к серверу Ushakov AI.',
      'ai'
    );

  }
}


function makeSummary() {

  const input = document.getElementById('summaryInput');
  const result = document.getElementById('summaryResult');

  if (!input || !result) {
    return;
  }

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

  result.textContent =
    '📝 Конспект:\n\n' + short;
}


function makeTest() {

  const input = document.getElementById('testInput');
  const result = document.getElementById('testResult');

  if (!input || !result) {
    return;
  }

  const topic = input.value.trim();

  if (!topic) {
    result.textContent = 'Напиши тему.';
    return;
  }

  result.textContent =
    '🎯 Тренировка: ' + topic +
    '\n\n' +
    '1. Назови главное понятие по теме.\n' +
    '2. Назови основные причины или особенности.\n' +
    '3. Приведи пример.';
}


function makeImage() {

  const input = document.getElementById('imageInput');
  const result = document.getElementById('imageResult');

  if (!input || !result) {
    return;
  }

  const prompt = input.value.trim();

  if (!prompt) {
    result.textContent = 'Напиши описание картинки.';
    return;
  }

  result.textContent =
    '🎨 Идея принята: «' + prompt + '»';
}


function activatePromo() {

  const input = document.getElementById('promoInput');
  const result = document.getElementById('promoResult');
  const plan = document.getElementById('plan');

  if (!input || !result) {
    return;
  }

  const code = input.value.trim().toUpperCase();

  const validCodes = [
    'WELCOME',
    'PRO7',
    'PRO30'
  ];

  if (validCodes.includes(code)) {

    localStorage.setItem(
      'ushakovPro',
      'true'
    );

    if (plan) {
      plan.textContent = 'PRO';
    }

    result.textContent =
      '🔥 Промокод активирован! Тариф PRO включён.';

  } else {

    result.textContent =
      '❌ Такой промокод не найден.';

  }
}


document.addEventListener('DOMContentLoaded', function() {

  const sendButton =
    document.getElementById('sendButton');

  const chatInput =
    document.getElementById('chatInput');


  if (sendButton) {

    sendButton.addEventListener(
      'click',
      sendMessage
    );

  }


  if (chatInput) {

    chatInput.addEventListener(
      'keydown',
      function(event) {

        if (event.key === 'Enter') {

          event.preventDefault();

          sendMessage();

        }

      }
    );

  }


  const photoInput =
    document.getElementById('photoInput');


  if (photoInput) {

    photoInput.addEventListener(
      'change',
      function() {

        const result =
          document.getElementById('photoResult');

        if (
          photoInput.files.length &&
          result
        ) {

          result.textContent =
            '📸 Фото получено! ' +
            'Распознавание подключим следующим этапом.';

        }

      }
    );

  }


  const summaryButton =
    document.getElementById('summaryButton');

  if (summaryButton) {
    summaryButton.addEventListener(
      'click',
      makeSummary
    );
  }


  const testButton =
    document.getElementById('testButton');

  if (testButton) {
    testButton.addEventListener(
      'click',
      makeTest
    );
  }


  const imageButton =
    document.getElementById('imageButton');

  if (imageButton) {
    imageButton.addEventListener(
      'click',
      makeImage
    );
  }


  const promoButton =
    document.getElementById('promoButton');

  if (promoButton) {
    promoButton.addEventListener(
      'click',
      activatePromo
    );
  }


  const profileFromPro =
    document.getElementById('profileFromPro');

  if (profileFromPro) {

    profileFromPro.addEventListener(
      'click',
      function() {
        showPage('profile');
      }
    );

  }


  const getProButton =
    document.getElementById('getProButton');

  if (getProButton) {

    getProButton.addEventListener(
      'click',
      function() {
        showPage('pro');
      }
    );

  }


  const plan =
    document.getElementById('plan');


  if (
    plan &&
    localStorage.getItem('ushakovPro') === 'true'
  ) {

    plan.textContent = 'PRO';

  }

});
