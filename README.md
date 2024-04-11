# app_github_project_description_agent

В проекте реализован GPT-агент, задача котрого получить информацию о проекте по ссылке(github).
По умолчанию используется OPENAI_BASE_PATH=https://api.vsegpt.ru/v1

## Перед запуском

- Переименовать `.env.example` в `.env`
- Прописать OPENAI_API_KEY

## Запуск

```
npm run start
```

## Пример вывода

```
[GPT] { "action": "complete", "params": [{
    "project_name": "wapp_project_manager",
    "url": "https://github.com/hightemp/wapp_project_manager",
    "tags": ["project manager", "desktop app", "markdown editor", "vue3", "tauri"],
    "frameworks": {
        "vue": "package.json",
        "tauri": "package.json",
        "vuetify": "package.json"
    },
    "short_description": "Десктопное приложение для управления проектами с markdown редактором. Основано на фреймворке Tauri, использует Vue 3, Vite, Vuetify, TypeScript. Поддерживает разделение рабочей области на панели."
}]}
```