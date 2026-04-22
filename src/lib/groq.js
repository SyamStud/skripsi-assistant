import Groq from 'groq-sdk';

let groqInstance = null;

function getGroq() {
    if (!groqInstance) {
        groqInstance = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
    }
    return groqInstance;
}

export async function generateWithGroq(prompt, model = 'llama-3.3-70b-versatile') {
    const groq = getGroq();

    const completion = await groq.chat.completions.create({
        model,
        messages: [
            {
                role: 'user',
                content: prompt,
            },
        ],
        temperature: 0.7,
        max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content || '';
}

export async function generateWithSystemPrompt(systemPrompt, userPrompt, model = 'llama-3.3-70b-versatile') {
    const groq = getGroq();

    const completion = await groq.chat.completions.create({
        model,
        messages: [
            {
                role: 'system',
                content: systemPrompt,
            },
            {
                role: 'user',
                content: userPrompt,
            },
        ],
        temperature: 0.7,
        max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content || '';
}