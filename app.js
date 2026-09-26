const API_URL =
  "https://ushakov-ai-api123.usakovstas653.workers.dev";

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initChat();
  initPhoto();
  initSummary();
  initTests();
  initImage();
  initProfile();
});


// =========================
// НАВИГАЦИЯ
// =========================

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}


// =========================
// ОБЩИЙ API
// =========================

async function apiRequest(body) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error("Ошибка сервера: " + response.status);
  }

  return await response.json();
}

function getText(data) {
  if (!data) return "Пустой ответ";

  if (typeof data === "string") {
    return data;
  }

  return (
    data.text ||
    data.response ||
    data.answer ||
    data.result ||
    data.message ||
    JSON.stringify(data, null, 2)
  );
}

function setLoading(button, loading, normalText) {
  button.disabled = loading;
  button.textContent = loading ? "Загрузка..." : normalText;
}


// =========================
// ЧАТ
// =========================

function initChat() {
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");
  const messages = document.getElementById("chatMessages");

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
      loading.textContent =
        "Не удалось получить ответ. Проверь соединение с AI.";
      console.error(error);
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


// =========================
// ФОТО
// =========================

let selectedPhoto = null;

function initPhoto() {
  const input = document.getElementById("photoInput");
  const preview = document.getElementById("photoPreview");
  const button = document.getElementById("photoSend");
  const result = document.getElementById("photoResult");

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
      result.textContent =
        "Не удалось обработать фото.";
      console.error(error);
    }

    setLoading(button, false, "Решить задание");
  });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      const base64 = result.split(",")[1];

      resolve(base64);
    };

    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}


// =========================
// КОНСПЕКТ
// =========================

function initSummary() {
  const input = document.getElementById("summaryInput");
  const button = document.getElementById("summarySend");
  const result = document.getElementById("summaryResult");

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
      result.textContent =
        "Не удалось создать конспект.";
      console.error(error);
    }

    setLoading(button, false, "Создать конспект");
  });
}


// =========================
// ТЕСТЫ
// =========================

function initTests() {
  const input = document.getElementById("testTopic");
  const button = document.getElementById("testSend");
  const result = document.getElementById("testResult");

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
      result.textContent =
        "Не удалось создать тест.";
      console.error(error);
    }

    setLoading(button, false, "Создать тест");
  });
}


// =========================
// КАРТИНКА
// =========================

function initImage() {
  const input = document.getElementById("imagePrompt");
  const button = document.getElementById("imageSend");
  const result = document.getElementById("imageResult");

  button.addEventListener("click", async () => {
    const prompt = input.value.trim();

    if (!prompt) {
      result.textContent = "Напиши описание картинки.";
      return;
    }

    setLoading(button, true, "Создать картинку");

    result.innerHTML = "";

    try {
      const data = await apiRequest({
        action: "image",
        prompt: prompt
      });

      const imageData =
        data.image ||
        data.imageData ||
        data.data;

      if (imageData) {
        const img = document.createElement("img");

        img.src = imageData.startsWith("data:")
          ? imageData
          : "data:image/png;base64," + imageData;

        result.appendChild(img);
      } else {
        result.textContent = getText(data);
      }

    } catch (error) {
      result.textContent =
        "Не удалось создать картинку.";
      console.error(error);
    }

    setLoading(button, false, "Создать картинку");
  });
}


// =========================
// ПРОФИЛЬ
// =========================

function initProfile() {
  const button = document.getElementById("checkButton");
  const status = document.getElementById("status");

  button.addEventListener("click", async () => {
    setLoading(button, true, "Проверить соединение");

    try {
      const response = await fetch(API_URL, {
        method: "GET"
      });

      if (response.ok) {
        status.textContent = "✓ Сервер доступен";
      } else {
        status.textContent =
          "Сервер ответил с ошибкой " + response.status;
      }

    } catch (error) {
      status.textContent =
        "✕ Сервер недоступен";
      console.error(error);
    }

    setLoading(button, false, "Проверить соединение");
  });
});
