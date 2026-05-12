/**
 * WelcomeScreen — shown when no messages in active chat
 * Glassmorphism cards with suggested prompts
 */

import React from 'react'
import { Code2, BookOpen, Search, Zap, Brain, Globe } from 'lucide-react'
import styles from './WelcomeScreen.module.css'

const SUGGESTIONS = [
  {
    icon: <Code2 size={18} />,
    label: 'Build a UI',
    prompt: 'Build a glassmorphism dashboard with dark theme and red accents using React and Tailwind',
    color: '#ff3b30',
  },
  {
    icon: <Brain size={18} />,
    label: 'Explain concepts',
    prompt: 'Explain how transformer attention mechanism works step by step',
    color: '#0a84ff',
  },
  {
    icon: <BookOpen size={18} />,
    label: 'Study help',
    prompt: 'HSC Physics — explain Newton\'s laws with Bangladesh board exam examples',
    color: '#30d158',
  },
  {
    icon: <Search size={18} />,
    label: 'Live search',
    prompt: 'What are the latest AI developments this week?',
    color: '#ffd60a',
  },
  {
    icon: <Globe size={18} />,
    label: 'Browse web',
    prompt: 'Browse https://openai.com and summarize the latest news',
    color: '#bf5af2',
  },
  {
    icon: <Zap size={18} />,
    label: 'Crypto prices',
    prompt: 'What are the current Bitcoin and Ethereum prices?',
    color: '#ff9f0a',
  },
]

export default function WelcomeScreen({ onPrompt }) {
  return (
    <div className={styles.container}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoMark}>R</div>
      </div>

      <h1 className={styles.heading}>
        How can I help you<span className={styles.accent}>?</span>
      </h1>
      <p className={styles.sub}>
        Ask anything — code, study, search, analyze files, or browse the web.
      </p>

      {/* Suggestions grid */}
      <div className={styles.grid}>
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            className={styles.card}
            onClick={() => onPrompt(s.prompt)}
            style={{ '--card-accent': s.color }}
          >
            <span className={styles.cardIcon} style={{ color: s.color }}>
              {s.icon}
            </span>
            <div className={styles.cardText}>
              <span className={styles.cardLabel}>{s.label}</span>
              <span className={styles.cardDesc}>{s.prompt.slice(0, 55)}…</span>
            </div>
          </button>
        ))}
      </div>

      <p className={styles.hint}>
        Supports Bengali · Banglish · English &nbsp;·&nbsp; Drag & drop files
      </p>
    </div>
  )
}
