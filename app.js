const API_URL = 'https://ushakov-ai-api123.usakovstas653.workers.dev';

function showPage(id) {
  const pages = document.querySelectorAll('.page');

  pages.forEach(function(page) {
    page.style.display = 'none';
  });

  const selected = document.getElementById(id);

  if (selected) {
    selected.style.display = 'block';
  }
}

function addMessage(text, type) {
  const messages = document.getElementById('messages');

  if (!messages) return;

  const message = document.createElement('div');
  message.className = 'message ' + type;
  message.textContent = text;

  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const messages = document.getElementById('messages');

  if (!input || !messages) return;

  const text = input.value.trim();

  if (!text) return;

  addMessage(text, 'user');

  input.value = '';

  const thinking = document.createElement('div');
  thinking.className = 'message ai';
  thinking.textContent = '🤖 Думаю...';

  messages.appendChild(thinking);

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


/* =========================
   PHOTO HOMEWORK
========================= */

async function prepareImage(file) {
  return new Promise(function(resolve, reject) {

    const reader = new FileReader();

    reader.onload = function(event) {

      const image = new Image();

      image.onload = function() {

        const maxSize = 1600;

        let width = image.width;
        let height = image.height;

        if (width > maxSize || height > maxSize) {

          if (width > height) {
            height = Math.round(
              height * maxSize / width
            );

            width = maxSize;

          } else {
            width = Math.round(
              width * maxSize / height
            );

            height = maxSize;
          }
        }

        const canvas = document.createElement('canvas');

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');

        ctx.drawImage(
          image,
          0,
          0,
          width,
          height
        );

        const dataUrl = canvas.toDataURL(
          'image/jpeg',
          0.8
        );

        resolve(dataUrl);
      };

      image.onerror = reject;

      image.src = event.target.result;
    };

    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}


async function solvePhoto() {

  const input = document.getElementById('photoInput');
  const preview = document.getElementById('photoPreview');
  const status = document.getElementById('photoStatus');
  const result = document.getElementById('photoResult');

  if (!input || !input.files || !input.files[0]) {
    return;
  }

  const file = input.files[0];

  status.textContent = '⏳ Загружаю и анализирую фото...';

  result.innerHTML = '';

  try {

    const dataUrl = await prepareImage(file);

    preview.src = dataUrl;
    preview.style.display = 'block';

    const base64 = dataUrl.split(',')[1];

    const response = await fetch(API_URL, {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({

        message:
          'На изображении домашнее задание. ' +
          'Распознай условие задачи, реши её пошагово ' +
          'и объясни ответ простыми словами. ' +
          'Если часть задания не видна или фото нечёткое, ' +
          'скажи об этом.',

        image: {
          mimeType: 'image/jpeg',
          data: base64
        }

      })
    });

    const data = await response.json();

    if (!response.ok) {

      status.textContent =
        '❌ Ошибка: ' +
        (data.error || 'неизвестная ошибка');

      return;
    }

    status.textContent = '✅ Готово!';

    const answer = document.createElement('div');

    answer.className = 'message ai';

    answer.textContent =
      data.answer ||
      '🤖 AI не вернул решение.';

    result.appendChild(answer);

  } catch (error) {

    console.error(error);

    status.textContent =
      '❌ Не удалось обработать фотографию.';
  }
}


/* =========================
   START
========================= */

document.addEventListener(
  'DOMContentLoaded',
  function() {

    const sendButton =
      document.getElementById('sendButton');

    const chatInput =
      document.getElementById('chatInput');

    const photoButton =
      document.getElementById('photoButton');

    const photoInput =
      document.getElementById('photoInput');


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


    if (photoButton && photoInput) {

      photoButton.addEventListener(
        'click',
        function() {
          photoInput.click();
        }
      );


      photoInput.addEventListener(
        'change',
        solvePhoto
      );
    }

  }
);
