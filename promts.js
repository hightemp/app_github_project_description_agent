"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create_tasks_prompt = exports.task_promt = exports.actions_promt = exports.init_promt = void 0;
function init_promt(goal, language) {
    return `
You are assistant named AgentGPT. 
You must answer in language: "${language}".
You current task is: 
${goal}

${actions_promt()}
`;
}
exports.init_promt = init_promt;
function actions_promt() {
    return `
You have several actions to release goal.

You can use these actions:
{ "action": "get_markdown_of_url", "params": ["http://example.com"] } - you get the markdown of page
{ "action": "get_github_project_files", "params": [] } - get the markdown list of project files
{ "action": "think", "params": ["some thoughts about task"] } - use these to print your thoughts, step by step
{ "action": "complete", "params": ["some result"] } - use these if you finish task

You can use one action at time.
You must write answer in json format, example answer: { "action": "action", "params":["1", "2"]}
IMPORTANT: Don't write more than one action in one request!
If you think that work finished you must write "complete" action.
`;
}
exports.actions_promt = actions_promt;
function task_promt(goal, task, language) {
    return `
High level objective: "${goal}"
Current task: "${task}"

Based on this information, use the best function to make progress or accomplish the task entirely.
Select the correct function by being smart and efficient. Ensure "reasoning" and only "reasoning" is in the
${language} language.

Note you MUST select a function.
`;
}
exports.task_promt = task_promt;
function create_tasks_prompt(language) {
    return `
You must answer in language: "${language}".
`;
}
exports.create_tasks_prompt = create_tasks_prompt;
