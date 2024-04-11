
export function init_promt(goal: string, language: string) {
    return `
You are assistant named AgentGPT. 
You must answer in language: "${language}".
You current task is: 
${goal}

${actions_promt()}
`
}

export function actions_promt() {
    return `
You have several actions to release goal.
You must write answer in json format, example answer:
'{ "action": "action", "params":["1", "2"]}'

You can use these actions:
'{ "action": "get_markdown_of_url", "params": ["http://example.com"] }' - you get the markdown of page
'{ "action": "get_github_project_files" }' - get the markdown list of project files
'{ "action": "think", "params": ["some thoughts about task"] }' - use these to print your thoughts, step by step
'{ "action": "complete", "params": ["some result"] }' - use these if you finish task

If you think that work finished you must write "complete" action.
`
}

export function task_promt(goal: string, task: string, language: string) {
    return `
High level objective: "${goal}"
Current task: "${task}"

Based on this information, use the best function to make progress or accomplish the task entirely.
Select the correct function by being smart and efficient. Ensure "reasoning" and only "reasoning" is in the
${language} language.

Note you MUST select a function.
`
}

export function create_tasks_prompt(language: string) {
    return `
You must answer in language: "${language}".
`
}