import React from 'react'
import { Sparkles } from 'lucide-react'
import { mockExamplePrompts } from '../../data/mockData'

interface ExamplePromptsProps {
  onSelectPrompt: (prompt: string) => void
  className?: string
  prompts?: string[]
}

export const ExamplePrompts: React.FC<ExamplePromptsProps> = ({
  onSelectPrompt,
  className = '',
  prompts = mockExamplePrompts,
}) => {
  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        <Sparkles className="w-3.5 h-3.5 text-violet-500" />
        <span>Try these prompt examples:</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSelectPrompt(prompt)}
            className="text-left text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-300 dark:hover:border-violet-500/30 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 transition-all cursor-pointer"
          >
            &ldquo;{prompt}&rdquo;
          </button>
        ))}
      </div>
    </div>
  )
}

