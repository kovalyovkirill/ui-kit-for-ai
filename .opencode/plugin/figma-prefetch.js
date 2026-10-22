// opencode port of the Claude Code hooks in todooshka/.claude/settings.json
// (UserPromptSubmit + PreToolUse:Skill → figma-prefetch.mjs). The script itself is
// shared: it reads the Claude-style hook JSON on stdin, so this plugin only translates
// opencode events into that shape.
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const SCRIPT = fileURLToPath(new URL('../../todooshka/.ai-kit/bin/figma-prefetch.mjs', import.meta.url))

// Fire-and-forget on the script's side: it detaches the fetch and exits at once.
const run = (payload) => {
  try {
    spawnSync(process.execPath, [SCRIPT], { input: JSON.stringify(payload), timeout: 5000, stdio: ['pipe', 'ignore', 'ignore'] })
  } catch {}
}

export const FigmaPrefetch = async () => {
  // The skill call carries only its name in opencode, so the node id (URL or bare id)
  // is taken from the last user prompt.
  let lastPrompt = ''

  return {
    'chat.message': async (_input, output) => {
      const text = output.parts.filter((p) => p.type === 'text').map((p) => p.text).join('\n')
      if (!text) return
      lastPrompt = text
      run({ prompt: text })
    },
    'tool.execute.before': async (input, output) => {
      if (input.tool !== 'skill') return
      run({ tool_name: 'Skill', tool_input: { skill: output.args?.name ?? '', args: lastPrompt } })
    },
  }
}
