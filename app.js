const API_URL = "https://ushakov-ai-api123.usakovstas653.workers.dev";

function showPage(pageId) {
    const pages = document.querySelectorAll(".page");

    pages.forEach(page => {
        page.classList.remove("active");
        page.style.display = "none";
    });

    const target = document.getElementById(pageId);

    if (target) {
        target.classList.add("active");
        target.style.display = "block";
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// =========================
// API
// =========================

async function callAI(data) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Ошибка сервера");
        }

        return result;

    } catch (error) {
        console.error(error);
        throw error;
    }
}


// =========================
// CHAT
// =========================

async function sendChat() {
    const input = document.getElementById("chatInput");
    const messages = document.getElementById("messages");

    if (!input || !messages) return;

    const text = input.value.trim();

    if (!text) return;

    messages.innerHTML += `
        <div class="message user-message">
            ${escapeHTML(text)}
        </div>
    `;

    input.value = "";

    messages.innerHTML += `
        <div class="message ai-message" id="loadingMessage">
            Думаю...
        </div>
    `;

    try {
        const result = await callAI({
            action: "chat",
            message: text
        });

        const loading = document.getElementById("loadingMessage");

        if (loading) {
            loading.remove();
        }

        messages.innerHTML += `
            <div class="message ai-message">
                ${escapeHTML(result.text || result.message || "Пустой ответ")}
            </div>
        `;

        messages.scrollTop = messages.scrollHeight;

    } catch (error) {
        const loading = document.getElementById("loadingMessage");

        if (loading) {
            loading.textContent = "Ошибка: " + error.message;
        }
    }
}


// =========================
// PHOTO
// =========================

async function sendPhoto() {
    const input = document.getElementById("photoInput");
    const status = document.getElementById("photoStatus");
    const resultBox = document.getElementById("photoResult");
    const preview = document.getElementById("photoPreview");

    if (!input || !input.files || !input.files[0]) {
        alert("Сначала выбери фотографию");
        return;
    }

    const file = input.files[0];

    status.textContent = "Загружаю фото...";

    if (preview) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = "block";
    }

    try {
        const base64 = await fileToBase64(file);

        status.textContent = "Ushakov AI решает задачу...";

        const result = await callAI({
            action: "photo",
            message: "Реши задание на фотографии. Объясни решение понятно и по шагам.",
            image: {
                mimeType: file.type || "image/jpeg",
                data: base64
            }
        });

        status.textContent = "Готово!";

        if (resultBox) {
            resultBox.textContent =
                result.text ||
                result.message ||
                "Не удалось получить ответ.";
        }

    } catch (error) {
        status.textContent = "Ошибка: " + error.message;
    }
}


// =========================
// КОНСПЕКТ
// =========================

async function createSummary() {
    const input = document.getElementById("summaryInput");
    const status = document.getElementById("summaryStatus");
    const result = document.getElementById("summaryResult");

    if (!input) return;

    const text = input.value.trim();

    if (!text) {
        alert("Вставь текст для конспекта");
        return;
    }

    status.textContent = "Создаю конспект...";

    try {
        const response = await callAI({
            action: "summary",
            message: text
        });

        status.textContent = "Готово!";

        result.textContent =
            response.text ||
            response.message ||
            "Не удалось создать конспект.";

    } catch (error) {
        status.textContent = "Ошибка: " + error.message;
    }
}


// =========================
// ТЕСТЫ
// =========================

async function createTest() {
    const topic = document.getElementById("testTopic");
    const count = document.getElementById("testCount");
    const status = document.getElementById("testStatus");
    const result = document.getElementById("testResult");

    if (!topic) return;

    const topicText = topic.value.trim();
    const amount = count ? count.value : "5";

    if (!topicText) {
        alert("Напиши тему теста");
        return;
    }

    status.textContent = "Генерирую тест...";

    try {
        const response = await callAI({
            action: "test",
            message: `Создай школьный тест по теме "${topicText}" на ${amount} вопросов.
Для каждого вопроса дай варианты ответа и укажи правильный ответ.`
        });

        status.textContent = "Готово!";

        result.textContent =
            response.text ||
            response.message ||
            "Не удалось создать тест.";

    } catch (error) {
        status.textContent = "Ошибка: " + error.message;
    }
}


// =========================
// ГЕНЕРАЦИЯ КАРТИНКИ
// =========================

async function createImage() {
    const input = document.getElementById("imagePrompt");
    const status = document.getElementById("imageStatus");
    const result = document.getElementById("imageResult");

    if (!input) return;

    const prompt = input.value.trim();

    if (!prompt) {
        alert("Напиши, какую картинку создать");
        return;
    }

    status.textContent = "Создаю изображение...";

    try {
        const response = await callAI({
            action: "image",
            message: prompt
        });

        status.textContent = "Готово!";

        if (response.image) {
            result.innerHTML = `
                <img
                    src="data:${response.mimeType || "image/jpeg"};base64,${response.image}"
                    style="max-width:100%; border-radius:20px;"
                >
            `;
        } else {
            result.textContent = "Изображение не получено.";
        }

    } catch (error) {
        status.textContent = "Ошибка: " + error.message;
    }
}


// =========================
// FILE → BASE64
// =========================

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
// БЕЗОПАСНЫЙ ТЕКСТ
// =========================

function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, "<br>");
}


// =========================
// КНОПКИ
// =========================

document.addEventListener("DOMContentLoaded", () => {

    // Стартовая страница
    showPage("home");


    // Чат
    const sendButton = document.getElementById("sendButton");

    if (sendButton) {
        sendButton.addEventListener("click", sendChat);
    }

    const chatInput = document.getElementById("chatInput");

    if (chatInput) {
        chatInput.addEventListener("keydown", event => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendChat();
            }
        });
    }


    // Фото
    const photoButton = document.getElementById("photoButton");

    if (photoButton) {
        photoButton.addEventListener("click", sendPhoto);
    }


    // Конспект
    const summaryButton = document.getElementById("summaryButton");

    if (summaryButton) {
        summaryButton.addEventListener("click", createSummary);
    }


    // Тесты
    const testButton = document.getElementById("testButton");

    if (testButton) {
        testButton.addEventListener("click", createTest);
    }


    // Генерация изображения
    const imageButton = document.getElementById("imageButton");

    if (imageButton) {
        imageButton.addEventListener("click", createImage);
    }

});


// =========================
// ГЛОБАЛЬНАЯ ФУНКЦИЯ НАВИГАЦИИ
// =========================

window.showPage = showPage;
