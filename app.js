const API_URL = "https://ushakov-ai-api123.usakovstas653.workers.dev";

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initChat();
  initPhoto();
  initSummary();
  initTests();
  initImage();
  initProfile();
});

function initNavigation() {
  document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", () => {
      openPage(button.dataset.page);
    });
  });
}

function openPage(pageName) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  const page = document.getElementById(pageName);

  if (page) {
    page.classList.add("active");
    window.scrollTo(0, 0);
  }
}

async function apiRequest(body) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error("HTTP " + response.status);
  }

  return await response.json();
}

function getText(data) {
  if (!data) return "Пустой ответ";

  if (typeof data === "string") return data;

  return (
    data.text ||
    data.response ||
    data.answer ||
    data.result ||
    data.message ||
    JSON.stringify(data, null, 2)
  );
}

function setLoading(button, loading, text) {
  button.disabled = loading;
  button.textContent = loading ? "Загрузка..." : text;
}


// ЧАТ

function initChat() {
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");
  const messages = document.getElementById("chatMessages");

  if (!form || !input || !messages) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const text = input.value.trim();

    if (!text) return;

    addMessage(messages, text, "user");
    input.value = "";

    const loading = addMessage(messages, "Думаю...", "ai");

    try {
      const data = await apiRequest({
        action: "chat",
        message: text
      });

      loading.textContent = getText(data);
    } catch (error) {
      console.error(error);
      loading.textContent = "Ошибка соединения с AI.";
    }
  });
}

function addMessage(container, text, type) {
  const element = document.createElement("div");

  element.className = "message " + type;
  element.textContent = text;

  container.appendChild(element);
  container.scrollTop = container.scrollHeight;

  return element;
}


// ФОТО

let selectedPhoto = null;

function initPhoto() {
  const input = document.getElementById("photoInput");
  const preview = document.getElementById("photoPreview");
  const button = document.getElementById("photoSend");
  const result = document.getElementById("photoResult");

  if (!input || !preview || !button || !result) return;

  input.addEventListener("change", () => {
    const file = input.files[0];

    if (!file) return;

    selectedPhoto = file;

    preview.src = URL.createObjectURL(file);
    preview.classList.remove("hidden");
    button.disabled = false;
  });

  button.addEventListener("click", async () => {
    if (!selectedPhoto) return;

    setLoading(button, true, "Решить задание");

    try {
      const base64 = await fileToBase64(selectedPhoto);

      const data = await apiRequest({
        action: "photo",
        image: base64,
        mimeType: selectedPhoto.type
      });

      result.textContent = getText(data);
    } catch (error) {
      console.error(error);
      result.textContent = "Ошибка обработки фото.";
    }

    setLoading(button, false, "Решить задание");
  });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result.split(",")[1]);
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}


// КОНСПЕКТ

function initSummary() {
  const input = document.getElementById("summaryInput");
  const button = document.getElementById("summarySend");
  const result = document.getElementById("summaryResult");

  if (!input || !button || !result) return;

  button.addEventListener("click", async () => {
    const text = input.value.trim();

    if (!text) {
      result.textContent = "Сначала вставь текст.";
      return;
    }

    setLoading(button, true, "Создать конспект");

    try {
      const data = await apiRequest({
        action: "summary",
        text: text
      });

      result.textContent = getText(data);
    } catch (error) {
      console.error(error);
      result.textContent = "Ошибка создания конспекта.";
    }

    setLoading(button, false, "Создать конспект");
  });
}


// ТЕСТЫ

function initTests() {
  const input = document.getElementById("testTopic");
  const button = document.getElementById("testSend");
  const result = document.getElementById("testResult");

  if (!input || !button || !result) return;

  button.addEventListener("click", async () => {
    const topic = input.value.trim();

    if (!topic) {
      result.textContent = "Напиши тему теста.";
      return;
    }

    setLoading(button, true, "Создать тест");

    try {
      const data = await apiRequest({
        action: "test",
        topic: topic
      });

      result.textContent = getText(data);
    } catch (error) {
      console.error(error);
      result.textContent = "Ошибка создания теста.";
    }

    setLoading(button, false, "Создать тест");
  });
}


// КАРТИНКА

function initImage() {
  const input = document.getElementById("imagePrompt");
  const button = document.getElementById("imageSend");
  const result = document.getElementById("imageResult");

  if (!input || !button || !result) return;

  button.addEventListener("click", async () => {
    const prompt = input.value.trim();

    if (!prompt) {
      result.textContent = "Напиши описание картинки.";
      return;
    }

    setLoading(button, true, "Создать картинку");

    try {
      const data = await apiRequest({
        action: "image",
        prompt: prompt
      });

      const imageData = data.image || data.imageData || data.data;

      if (imageData) {
        const img = document.createElement("img");

        img.src = imageData.startsWith("data:")
          ? imageData
          : "data:image/png;base64," + imageData;

        result.innerHTML = "";
        result.appendChild(img);
      } else {
        result.textContent = getText(data);
      }
    } catch (error) {
      console.error(error);
      result.textContent = "Ошибка генерации картинки.";
    }

    setLoading(button, false, "Создать картинку");
  });
}


// ПРОФИЛЬ

function initProfile() {
  const button = document.getElementById("checkButton");
  const status = document.getElementById("status");

  if (!button || !status) return;

  button.addEventListener("click", async () => {
    setLoading(button, true, "Проверить соединение");

    try {
      const response = await fetch(API_URL);

      if (response.ok) {
        status.textContent = "✓ Сервер доступен";
      } else {
        status.textContent =
          "Сервер ответил: " + response.status;
      }
    } catch (error) {
      console.error(error);
      status.textContent = "✕ Сервер недоступен";
    }

    setLoading(button, false, "Проверить соединение");
  });
    }
