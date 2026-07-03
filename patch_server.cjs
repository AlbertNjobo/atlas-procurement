const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf-8');

const oldSys = `    if (formattedMessages[0]?.role !== 'system') {
      formattedMessages.unshift({
        role: "system",
        content: \`You are an AI Autopilot Procurement Agent`;

const newSys = `    if (formattedMessages[0]?.role !== 'system') {
      formattedMessages.unshift({
        role: "system",
        content: [
          {
            type: "text",
            text: \`You are an AI Autopilot Procurement Agent`;

content = content.replace(oldSys, newSys);

const oldSysEnd = `stages. NEVER call \\\`suggest_procurement_items\\\` and \\\`ask_form_questions\\\` in the same turn.\`
      });
    }`;

const newSysEnd = `stages. NEVER call \\\`suggest_procurement_items\\\` and \\\`ask_form_questions\\\` in the same turn.\`,
            cache_control: { type: "ephemeral" }
          }
        ]
      });
    }`;

content = content.replace(oldSysEnd, newSysEnd);


const oldCreate = `      const stream = await openai.chat.completions.create({
        model: "qwen3.7-plus",
        messages: currentMessages,
        tools: agentTools as any,
        stream: true,
        extra_body: {`;

const newCreate = `      const stream = await openai.chat.completions.create({
        model: "qwen3.7-plus",
        messages: currentMessages,
        tools: agentTools as any,
        stream: true,
        stream_options: { include_usage: true },
        extra_body: {`;

content = content.replace(oldCreate, newCreate);


const oldLoop = `      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        if (!delta) continue;

        if ((delta as any).reasoning_content) {`;

const newLoop = `      for await (const chunk of stream) {
        if (chunk.choices && chunk.choices.length > 0) {
          const delta = chunk.choices[0]?.delta;
          if (!delta) continue;

          if ((delta as any).reasoning_content) {`;

content = content.replace(oldLoop, newLoop);


const oldLoopEnd = `            if (tc.function?.arguments) {
              toolCallsAccumulator[index].arguments += tc.function.arguments;
            }
          }
        }
      }`;

const newLoopEnd = `            if (tc.function?.arguments) {
              toolCallsAccumulator[index].arguments += tc.function.arguments;
            }
          }
        }
        } else if (chunk.usage) {
          res.write(JSON.stringify({ type: "usage", usage: chunk.usage }) + "\\n");
          console.log(\`Tokens used: \${chunk.usage.total_tokens}\`);
          if (chunk.usage.prompt_tokens_details?.cached_tokens) {
            console.log(\`Cached tokens: \${chunk.usage.prompt_tokens_details.cached_tokens}\`);
          }
        }
      }`;

content = content.replace(oldLoopEnd, newLoopEnd);

fs.writeFileSync('server.ts', content);
