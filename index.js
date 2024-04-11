"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const openai_1 = __importDefault(require("openai"));
const turndown_1 = __importDefault(require("turndown"));
const cheerio_1 = __importDefault(require("cheerio"));
const promts = __importStar(require("./promts"));
const core_1 = require("openai/core");
const fs_1 = __importDefault(require("fs"));
const openai = new openai_1.default({
    apiKey: process.env['OPENAI_API_KEY'],
    baseURL: process.env['OPENAI_BASE_PATH'],
});
// const model = 'openai/gpt-3.5-turbo'
// const model = 'openai/gpt-4-turbo'
const model = 'google/gemini-pro-1.5';
const language = 'russian';
// const project_url = `https://github.com/lencx/ChatGPT`
const project_url = `https://github.com/hightemp/wapp_project_manager`;
const goal = `
Нужно составить описание проекта ${project_url}

Формат ответа описания проекта
{ "action": "complete", "params": [{
    "project_name": "название проекта",
    "url": "http://example.com",
    "tags": ["theme_one", "theme_two"],
    "frameworks": {
        "react": "package.json",
        "fastapi": "requirements.txt"
    },
    "short_description": "Описание проекта на русском языке"
}]

ВАЖНО: В frameworks нужно поместить название фреймворка и файла, где он был обнаружен.
ВАЖНО: В tags должно быть максмимально описывающий проект список тэгов.
ВАЖНО: Нужно проанализировать файлы проекта на используемые фреймворки(frontend, backend).

В ответе complete надо указать этот JSON!
`;
var messages = [];
var isEnd = false;
function save_messages_log() {
    var json = JSON.stringify(messages, null, 4);
    fs_1.default.writeFileSync('./logs/latest.log', json);
}
function add_user_message(text) {
    console.log(`[USER] ${text}`);
    messages.push({ role: 'user', content: text });
    save_messages_log();
}
function create_complition() {
    return __awaiter(this, void 0, void 0, function* () {
        (0, core_1.sleep)(5000); // for gimini
        const chatCompletion = yield openai.chat.completions.create({
            messages: messages,
            model: model,
            max_tokens: 30000,
        });
        // console.log(chatCompletion.choices);
        if (!chatCompletion.choices || !chatCompletion.choices.length) {
            throw new Error('api error');
        }
        // console.log(chatCompletion.choices[0].message);
        var message = chatCompletion.choices[0].message;
        console.log(`[GPT] ${message.content}`);
        messages.push(message);
        save_messages_log();
        return message.content;
    });
}
function get_url_as_markdown(url) {
    return __awaiter(this, void 0, void 0, function* () {
        var answer = yield fetch(url);
        var html = yield answer.text();
        var turndownService = new turndown_1.default();
        var markdown = turndownService.turndown(html);
        return markdown;
    });
}
function get_github_project_files() {
    return __awaiter(this, void 0, void 0, function* () {
        var answer = yield fetch(project_url);
        var html = yield answer.text();
        const $ = cheerio_1.default.load(html);
        var table_html = $('table tbody').html();
        if (table_html) {
            var turndownService = new turndown_1.default();
            var markdown = turndownService.turndown(table_html);
            return markdown;
        }
        return '';
    });
}
function write_error_message() {
    add_user_message('It is necessary to adhere to the described JSON format. Please, write action in JSON format!');
}
function parse_action(json) {
    return __awaiter(this, void 0, void 0, function* () {
        json = json.replace(/```json|```/g, ''); // for gimini
        var action = JSON.parse(json);
        if (action.action == 'get_markdown_of_url') {
            add_user_message(yield get_url_as_markdown(action.params[0]));
        }
        else if (action.action == 'get_github_project_files') {
            add_user_message(yield get_github_project_files());
        }
        else if (action.action == 'complete') {
            isEnd = true;
            console.log('[COMPLETE] ' + action.params[0]);
        }
        else if (action.action == 'think') {
            add_user_message('Go on');
            console.log('[THINK] ');
        }
        else {
            console.log('[ERROR] ' + json);
            write_error_message();
        }
    });
}
function make_action() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var answer = yield create_complition();
            if (answer) {
                parse_action(answer);
            }
            else {
                write_error_message();
            }
        }
        catch (e) {
            console.log('[ERROR] ' + e);
            write_error_message();
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        add_user_message(promts.init_promt(goal, language));
        while (!isEnd) {
            yield make_action();
        }
    });
}
main();
