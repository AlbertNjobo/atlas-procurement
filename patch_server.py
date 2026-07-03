import sys

with open('server.ts', 'r') as f:
    content = f.read()

# Replace system prompt
old_sys = """    if (formattedMessages[0]?.role !== 'system') {
      formattedMessages.unshift({
        role: "system",
        content: `You are an AI Autopilot Procurement Agent"""

new_sys = """    if (formattedMessages[0]?.role !== 'system') {
      formattedMessages.unshift({
        role: "system",
        content: [
          {
            type: "text",
            text: `You are an AI Autopilot Procurement Agent"""

old_sys_end = """stages. NEVER call \`suggest_procurement_items\` and \`ask_form_questions\` in the same turn.`
      });
    }"""

new_sys_end = """stages. NEVER call \`suggest_procurement_items\` and \`ask_form_questions\` in the same turn.`,
            cache_control: { type: "ephemeral" }
          }
        ]
      });
    }"""

content = content.replace(old_sys, new_sys)
content = content.replace(old_sys_end, new_sys_end)


# Replace create method
old_create = """      const stream = await openai.chat.completions.create({
        model: "qwen3.7-plus",
        messages: currentMessages,
        tools: agentTools as any,
        stream: true,
        extra_body: {"""

new_create = """      const stream = await openai.chat.completions.create({
        model: "qwen3.7-plus",
        messages: currentMessages,
        tools: agentTools as any,
        stream: true,
        stream_options: { include_usage: true },
        extra_body: {"""

content = content.replace(old_create, new_create)


# Replace loop processing
old_loop = """      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        if (!delta) continue;

        if ((delta as any).reasoning_content) {"""

new_loop = """      for await (const chunk of stream) {
        if (chunk.choices && chunk.choices.length > 0) {
          const delta = chunk.choices[0]?.delta;
          if (!delta) continue;

          if ((delta as any).reasoning_content) {"""

old_loop_end = """            if (tc.function?.arguments) {
              toolCallsAccumulator[index].arguments += tc.function.arguments;
            }
          }
        }
      }"""

new_loop_end = """            if (tc.function?.arguments) {
              toolCallsAccumulator[index].arguments += tc.function.arguments;
            }
          }
        }
        } else if (chunk.usage) {
          res.write(JSON.stringify({ type: "usage", usage: chunk.usage }) + "\\n");
          console.log(`Tokens used: ${chunk.usage.total_tokens}`);
          if (chunk.usage.prompt_tokens_details?.cached_tokens) {
            console.log(`Cached tokens: ${chunk.usage.prompt_tokens_details.cached_tokens}`);
          }
        }
      }"""

content = content.replace(old_loop, new_loop)
content = content.replace(old_loop_end, new_loop_end)

with open('server.ts', 'w') as f:
    f.write(content)

