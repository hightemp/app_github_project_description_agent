
import 'dotenv/config'
import OpenAI from 'openai';

import TurndownService from 'turndown';
import cheerio from 'cheerio'

import * as promts from './promts'
import { sleep } from 'openai/core';

import fs from 'fs'

const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'],
    baseURL: process.env['OPENAI_BASE_PATH'],
});

// const model = 'openai/gpt-3.5-turbo'
// const model = 'openai/gpt-4-turbo'
// const model = 'google/gemini-pro-1.5'
// const model = 'cohere/command-r'
// const model = 'translate-databricks/dbrx-instruct'
// const model = 'anthropic/claude-3-haiku'
const model = 'anthropic/claude-3-opus'
const language = 'russian'
// const project_url = `https://github.com/lencx/ChatGPT`
const project_url = `https://github.com/hightemp/wapp_project_manager`
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
`

var messages: Array<any> = []
var isEnd = false;

function save_messages_log() {
    var json = JSON.stringify(messages, null, 4);
    fs.writeFileSync('./logs/latest.log', json);
}

function add_user_message(text: string) {
    console.log(`[USER] ${text}`);
    messages.push({ role: 'user', content: text })
    save_messages_log();
}

async function create_complition() {
    sleep(5000); // for gimini

    const chatCompletion = await openai.chat.completions.create({
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

    return message.content
}

async function get_url_as_markdown(url: string) {
    var answer = await fetch(url);
    var html = await answer.text();

    var turndownService = new TurndownService()
    var markdown = turndownService.turndown(html)

    return markdown;
}

async function get_github_project_files() {
    var answer = await fetch(project_url);
    var html = await answer.text();

    const $ = cheerio.load(html);

    var table_html = $('table tbody').html()

    if (table_html) {
        var turndownService = new TurndownService()
        var markdown = turndownService.turndown(table_html)
    
        return markdown;
    }
  
    return '';
}

function write_error_message() {
    add_user_message('It is necessary to adhere to the described JSON format. Please, write action in JSON format!');
}

async function parse_action(json: string) {
    json = json.replace(/```json|```/g, '') // for gimini

    var action = JSON.parse(json);

    if (action.action == 'get_markdown_of_url') {
        add_user_message(await get_url_as_markdown(action.params[0]));
    } else if (action.action == 'get_github_project_files') {
        add_user_message(await get_github_project_files());
    } else if (action.action == 'complete') {
        isEnd = true;
        console.log('[COMPLETE] '+action.params[0]);
    } else if (action.action == 'think') {
        add_user_message('Go on');
        console.log('[THINK] ');
    } else {
        console.log('[ERROR] '+json)
        write_error_message();
    }
}

async function make_action() {
    try {
        var answer = await create_complition()
        if (answer) {
            await parse_action(answer);
        } else {
            write_error_message();
        }
    } catch(e) {
        console.log('[ERROR] '+e)
        write_error_message();
    }
}

async function main() {
    add_user_message(promts.init_promt(goal, language));

    while (!isEnd) {
        await make_action();
    }
}
  
main();
