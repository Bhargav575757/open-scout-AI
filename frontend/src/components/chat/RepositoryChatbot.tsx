import React, { useState, useEffect, useRef } from 'react'
import {
  Send,
  Bot,
  User,
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Database,
  Loader2,
} from 'lucide-react'
import { apiService } from '../../services/api'
import type { ChatMessage, ChatSource, IndexStatusResponse } from '../../types'

interface RepositoryChatbotProps {
  owner: string
  repo: string
  repositoryName?: string
}

export const RepositoryChatbot: React.FC<RepositoryChatbotProps> = ({
  owner,
  repo,
  repositoryName,
}) => {
  const [indexStatus, setIndexStatus] = useState<IndexStatusResponse | null>(null)
  const [isCheckingIndex, setIsCheckingIndex] = useState<boolean>(true)
  const [isIndexing, setIsIndexing] = useState<boolean>(false)
  const [indexingError, setIndexingError] = useState<string | null>(null)
  const [indexingSuccess, setIndexingSuccess] = useState<string | null>(null)

  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputQuestion, setInputQuestion] = useState<string>('')
  const [isLoadingAnswer, setIsLoadingAnswer] = useState<boolean>(false)
  const [chatError, setChatError] = useState<string | null>(null)
  const [expandedSources, setExpandedSources] = useState<Record<number, boolean>>({})

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const repoSlug = `${owner}/${repo}`
  const displayName = repositoryName || repo

  // 1. Fetch indexing status on mount
  useEffect(() => {
    let isMounted = true
    const checkStatus = async () => {
      try {
        setIsCheckingIndex(true)
        const status = await apiService.getIndexStatus(owner, repo)
        if (isMounted) {
          setIndexStatus(status)
        }
      } catch {
        if (isMounted) {
          setIndexStatus({
            full_name: repoSlug,
            is_indexed: false,
            chunks_count: 0,
          })
        }
      } finally {
        if (isMounted) setIsCheckingIndex(false)
      }
    }
    checkStatus()
    return () => {
      isMounted = false
    }
  }, [owner, repo, repoSlug])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoadingAnswer])

  // Handle Index Documentation action
  const handleIndexRepository = async () => {
    setIsIndexing(true)
    setIndexingError(null)
    setIndexingSuccess(null)

    try {
      const res = await apiService.indexRepository(owner, repo, true)
      setIndexStatus({
        repository_id: res.repository_id,
        full_name: res.full_name,
        is_indexed: res.is_indexed,
        chunks_count: res.chunks_count,
        indexed_at: new Date().toISOString(),
      })
      setIndexingSuccess(`Successfully indexed ${res.chunks_count} documentation chunks into pgvector!`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to index documentation.'
      setIndexingError(msg)
    } finally {
      setIsIndexing(false)
    }
  }

  // Handle Send Question
  const handleSendMessage = async (questionText?: string) => {
    const q = (questionText || inputQuestion).trim()
    if (!q || isLoadingAnswer) return

    setInputQuestion('')
    setChatError(null)

    // Add user message to state immediately
    const userMsg: ChatMessage = {
      role: 'user',
      content: q,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    setIsLoadingAnswer(true)

    try {
      const response = await apiService.chatWithRepository({
        repository_id: repoSlug,
        question: q,
        conversation_id: conversationId || undefined,
      })

      setConversationId(response.conversation_id)

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate answer.'
      setChatError(msg)
    } finally {
      setIsLoadingAnswer(false)
    }
  }

  const toggleSources = (index: number) => {
    setExpandedSources((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  const SUGGESTED_QUESTIONS = [
    'How do I install this project?',
    'What are the key features?',
    'Which technologies and frameworks are used?',
    'Explain the architecture and prerequisites.',
  ]

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md flex flex-col h-[650px] overflow-hidden">
      {/* Chatbot Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/90 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-600/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Repository Documentation Chatbot
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                RAG + pgvector
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Answers grounded strictly in {displayName}&rsquo;s documentation
            </p>
          </div>
        </div>

        {/* Index Status Badge & Action */}
        <div className="flex items-center gap-2">
          {isCheckingIndex ? (
            <span className="text-xs text-zinc-400 flex items-center gap-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking index...
            </span>
          ) : indexStatus?.is_indexed ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Indexed ({indexStatus.chunks_count} chunks)
              </span>
              <button
                type="button"
                onClick={handleIndexRepository}
                disabled={isIndexing}
                className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-violet-600 p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                title="Re-index documentation"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isIndexing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleIndexRepository}
              disabled={isIndexing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 text-white font-semibold text-xs shadow-xs hover:bg-violet-700 disabled:opacity-50 cursor-pointer"
            >
              {isIndexing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Embedding README...</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5" />
                  <span>Index Documentation</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Indexing Feedback Alerts */}
      {indexingSuccess && (
        <div className="mx-4 mt-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            {indexingSuccess}
          </span>
          <button
            type="button"
            onClick={() => setIndexingSuccess(null)}
            className="text-emerald-600 hover:text-emerald-800 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {indexingError && (
        <div className="mx-4 mt-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            {indexingError}
          </span>
          <button
            type="button"
            onClick={() => setIndexingError(null)}
            className="text-rose-600 hover:text-rose-800 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Unindexed Notice */}
        {!isCheckingIndex && !indexStatus?.is_indexed && messages.length === 0 && (
          <div className="p-6 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Documentation not yet indexed
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Click <strong>&ldquo;Index Documentation&rdquo;</strong> to ingest this repository&rsquo;s README, chunk sections, and generate vector embeddings for RAG question answering.
            </p>
            <button
              type="button"
              onClick={handleIndexRepository}
              disabled={isIndexing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 text-white font-semibold text-xs shadow-xs hover:bg-violet-700 disabled:opacity-50 cursor-pointer"
            >
              {isIndexing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Indexing README...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Index {displayName} README</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Welcome message if indexed */}
        {indexStatus?.is_indexed && messages.length === 0 && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-violet-600/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex-1 bg-zinc-100 dark:bg-zinc-800/70 p-3.5 rounded-2xl rounded-tl-sm text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed space-y-2">
                <p>
                  Hello! I am your documentation assistant for <strong>{displayName}</strong>.
                  I can answer questions regarding installation, dependencies, CLI commands, architecture, and features using verified excerpts from the README.
                </p>
                <p className="text-zinc-500 dark:text-zinc-400">
                  Try asking one of the suggested questions below or type your own:
                </p>
              </div>
            </div>

            {/* Quick suggested questions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 pl-10">
              {SUGGESTED_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => handleSendMessage(question)}
                  className="text-left text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer"
                >
                  &ldquo;{question}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages Stream */}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-violet-600/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl text-xs leading-relaxed space-y-2 ${
                msg.role === 'user'
                  ? 'bg-violet-600 text-white p-3 rounded-tr-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800/70 text-zinc-900 dark:text-zinc-100 p-3.5 rounded-tl-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Supporting Sources Accordion */}
              {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60">
                  <button
                    type="button"
                    onClick={() => toggleSources(idx)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>Supporting Sources ({msg.sources.length})</span>
                    {expandedSources[idx] ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>

                  {expandedSources[idx] && (
                    <div className="mt-2 space-y-1.5 animate-in fade-in duration-150">
                      {msg.sources.map((src: ChatSource, sIdx: number) => (
                        <div
                          key={sIdx}
                          className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-[11px] text-zinc-600 dark:text-zinc-300 space-y-1"
                        >
                          <div className="flex items-center justify-between text-zinc-400 font-semibold text-[10px]">
                            <span>Section: {src.section_header || 'General'}</span>
                            {src.similarity_score != null && (
                              <span>Relevance: {Math.round(src.similarity_score * 100)}%</span>
                            )}
                          </div>
                          <p className="italic font-mono text-[10.5px] line-clamp-3">
                            &ldquo;{src.snippet}&rdquo;
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoadingAnswer && (
          <div className="flex gap-3 items-center text-xs text-zinc-500 dark:text-zinc-400">
            <div className="w-7 h-7 rounded-lg bg-violet-600/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-800/70 p-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-500" />
              <span>Retrieving documentation chunks and synthesizing answer...</span>
            </div>
          </div>
        )}

        {/* Chat Error */}
        {chatError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{chatError}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSendMessage()
        }}
        className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          placeholder={
            indexStatus?.is_indexed
              ? `Ask a question about ${displayName}...`
              : 'Index documentation above to ask questions...'
          }
          disabled={!indexStatus?.is_indexed || isLoadingAnswer}
          className="flex-1 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputQuestion.trim() || !indexStatus?.is_indexed || isLoadingAnswer}
          className="p-2.5 rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Send question"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
