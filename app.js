```js
const API_URL =
  "https://ushakov-ai-api123.usakovstas653.workers.dev";


// ================================
// НАВИГАЦИЯ
// ================================

function showPage(id) {

  document.querySelectorAll(".page").forEach(page => {
    page.style.display = "none";
  });

  const page = document.getElementById(id);

  if (page) {
    page.style.display = "block";
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// ================================
// ОБЩИЙ API
// ================================

async function callAI(payload) {

  const response = await fetch(API_URL, {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify(payload)

  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("Сервер вернул неправильный ответ.");
  }

  if (!response.ok) {

    throw new Error(
      data.error ||
      "Ошибка AI."
    );
  }

  return data;
}


// ================================
// CHAT
// ================================

function addMessage(text, type) {

  const messages =
    document.getElementById("messages");

  if (!messages) return;

  const message =
    document.createElement("div");

  message.className =
    "message " + type;

  message.textContent = text;

  messages.appendChild(message);

  messages.scrollTop =
    messages.scrollHeight;
}


async function sendMessage() {

  const input =
    document.getElementById("chatInput");

  const text =
    input.value.trim();

  if (!text) return;

  addMessage(text, "user");

  input.value = "";

  const thinking =
    document.createElement("div");

  thinking.className =
    "message ai";

  thinking.textContent =
    "🤖 Думаю...";

  document
    .getElementById("messages")
    .appendChild(thinking);


  try {

    const data =
      await callAI({

        action: "chat",

        message: text

      });


    thinking.remove();

    addMessage(
      data.answer ||
      "AI не вернул ответ.",
      "ai"
    );

  } catch (error) {

    thinking.remove();

    addMessage(
      "❌ " + error.message,
      "ai"
    );
  }
}


// ================================
// IMAGE PREPARATION
// ================================

function prepareImage(file) {

  return new Promise((resolve, reject) => {

    const reader =
      new FileReader();


    reader.onload = event => {

      const image =
        new Image();


      image.onload = () => {

        const maxSize = 1600;

        let width =
          image.width;

        let height =
          image.height;


        if (
          width > maxSize ||
          height > maxSize
        ) {

          if (width > height) {

            height =
              Math.round(
                height *
                maxSize /
                width
              );

            width = maxSize;

          } else {

            width =
              Math.round(
                width *
                maxSize /
                height
              );

            height = maxSize;
          }
        }


        const canvas =
          document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;


        const ctx =
          canvas.getContext("2d");

        ctx.drawImage(
          image,
          0,
          0,
          width,
          height
        );


        resolve(
          canvas.toDataURL(
            "image/jpeg",
            0.82
          )
        );
      };


      image.onerror = reject;

      image.src =
        event.target.result;
    };


    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}


// ================================
// PHOTO
// ================================

async function solvePhoto() {

  const input =
    document.getElementById("photoInput");

  const file =
    input.files[0];

  if (!file) return;


  const status =
    document.getElementById("photoStatus");

  const preview =
    document.getElementById("photoPreview");

  const result =
    document.getElementById("photoResult");


  status.textContent =
    "⏳ Анализирую фотографию...";

  result.innerHTML = "";


  try {

    const dataUrl =
      await prepareImage(file);


    preview.src =
      dataUrl;

    preview.style.display =
      "block";


    const base64 =
      dataUrl.split(",")[1];


    const data =
      await callAI({

        action: "photo",

        message:
          "Распознай задачу на фотографии. " +
          "Перепиши условие, реши задачу " +
          "пошагово и объясни ответ простыми " +
          "словами школьнику. " +
          "Если часть изображения не читается, " +
          "сообщи об этом.",

        image: {

          mimeType:
            "image/jpeg",

          data:
            base64
        }

      });


    status.textContent =
      "✅ Готово!";


    const answer =
      document.createElement("div");

    answer.className =
      "message ai";

    answer.textContent =
      data.answer ||
      "AI не смог решить задачу.";


    result.appendChild(answer);


  } catch (error) {

    status.textContent =
      "❌ " + error.message;
  }
}


// ================================
// SUMMARY
// ================================

async function createSummary() {

  const input =
    document.getElementById("summaryInput");

  const status =
    document.getElementById("summaryStatus");

  const result =
    document.getElementById("summaryResult");


  const text =
    input.value.trim();


  if (!text) {

    status.textContent =
      "⚠️ Вставь текст.";

    return;
  }


  status.textContent =
    "⏳ Создаю конспект...";

  result.innerHTML = "";


  try {

    const data =
      await callAI({

        action: "summary",

        message: text

      });


    status.textContent =
      "✅ Конспект готов!";


    result.textContent =
      data.answer ||
      "Не удалось создать конспект.";

  } catch (error) {

    status.textContent =
      "❌ " + error.message;
  }
}


// ================================
// TESTS
// ================================

async function createTest() {

  const topic =
    document
      .getElementById("testTopic")
      .value
      .trim();


  const count =
    document
      .getElementById("testCount")
      .value;


  const status =
    document.getElementById("testStatus");

  const result =
    document.getElementById("testResult");


  if (!topic) {

    status.textContent =
      "⚠️ Напиши тему.";

    return;
  }


  status.textContent =
    "⏳ Создаю тест...";

  result.innerHTML = "";


  try {

    const data =
      await callAI({

        action: "test",

        message:
          "Создай тест по теме: " +
          topic +
          ". Нужно " +
          count +
          " вопросов. " +
          "Для каждого вопроса сделай " +
          "4 варианта ответа и в конце " +
          "укажи правильные ответы. " +
          "Уровень — школьный."

      });


    status.textContent =
      "✅ Тест готов!";


    result.textContent =
      data.answer ||
      "Не удалось создать тест.";

  } catch (error) {

    status.textContent =
      "❌ " + error.message;
  }
}


// ================================
// IMAGE GENERATION
// ================================

async function generateImage() {

  const input =
    document.getElementById("imagePrompt");

  const status =
    document.getElementById("imageStatus");

  const result =
    document.getElementById("imageResult");


  const prompt =
    input.value.trim();


  if (!prompt) {

    status.textContent =
      "⚠️ Опиши изображение.";

    return;
  }


  status.textContent =
    "⏳ Генерирую изображение...";

  result.innerHTML = "";


  try {

    const data =
      await callAI({

        action: "image",

        message: prompt

      });


    status.textContent =
      "✅ Изображение готово!";


    if (data.image) {

      const img =
        document.createElement("img");

      img.src =
        "data:" +
        data.mimeType +
        ";base64," +
        data.image;

      img.style.maxWidth =
        "100%";

      img.style.borderRadius =
        "20px";

      result.appendChild(img);

    } else {

      result.textContent =
        data.answer ||
        "Изображение не получено.";
    }


  } catch (error) {

    status.textContent =
      "❌ " + error.message;
  }
}


// ================================
// START
// ================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    // По умолчанию главная

    showPage("home");


    // CHAT

    const sendButton =
      document.getElementById("sendButton");

    const chatInput =
      document.getElementById("chatInput");


    if (sendButton) {

      sendButton.addEventListener(
        "click",
        sendMessage
      );
    }


    if (chatInput) {

      chatInput.addEventListener(
        "keydown",
        event => {

          if (event.key === "Enter") {

            event.preventDefault();

            sendMessage();
          }
        }
      );
    }


    // PHOTO

    const photoButton =
      document.getElementById("photoButton");

    const photoInput =
      document.getElementById("photoInput");


    if (photoButton && photoInput) {

      photoButton.addEventListener(
        "click",
        () => photoInput.click()
      );


      photoInput.addEventListener(
        "change",
        solvePhoto
      );
    }


    // SUMMARY

    const summaryButton =
      document.getElementById("summaryButton");


    if (summaryButton) {

      summaryButton.addEventListener(
        "click",
        createSummary
      );
    }


    // TESTS

    const testButton =
      document.getElementById("testButton");


    if (testButton) {

      testButton.addEventListener(
        "click",
        createTest
      );
    }


    // IMAGE

    const imageButton =
      document.getElementById("imageButton");


    if (imageButton) {

      imageButton.addEventListener(
        "click",
        generateImage
      );
    }

  }
);
```
