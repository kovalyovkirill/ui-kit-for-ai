// opencode port of the Claude Code hooks in todooshka/.claude/settings.json
// (UserPromptSubmit + PreToolUse:Skill → figma-prefetch.mjs). The script itself is
// shared: it reads the Claude-style hook JSON on stdin, so this plugin only translates
// opencode events into that shape.
import { Plugin } from '@opencode/plugin'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const SCRIPT = fileURLToPath(new URL('../../todooshka/.ai-kit/bin/figma-prefetch.mjs', import.meta.url))

// Fire-and-forget on the script's side: it detaches the fetch and exits at once.
const run = (payload) => {
  try {
    spawnSync(process.execPath, [SCRIPT], { input: JSON.stringify(payload), timeout: 5000, stdio: ['pipe', 'ignore', 'ignore'] })
  } catch {}
}

export default Plugin.define({
  id: 'figma-prefetch',
  setup(ctx) {
    // The skill call carries only its name in opencode, so the node id (URL or bare id)
    // is taken from the last user prompt.
    let lastPrompt = ''

    const prompt = ctx.session.hook('prompt', (event) => {
      const text = event.prompt.text
      if (!text) return
      lastPrompt = text
      run({ prompt: text })
    })

    const before = ctx.tool.hook('execute.before', (event) => {
      if (event.tool !== 'skill') return
      run({ tool_name: 'Skill', tool_input: { skill: event.input?.name ?? '', args: lastPrompt } })
    })

    return () => {
      prompt.dispose()
      before.dispose()
    }
  },
})
