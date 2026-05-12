/**
 * Header — top navigation bar
 */

import React from 'react'
import { Menu, Plus, MoreHorizontal } from 'lucide-react'
import styles from './Header.module.css'

const AGENT_COLORS = {
  CodingAgent:     '#ff3b30',
  SearchAgent:     '#0a84ff',
  SmartTutorAgent: '#30d158',
  GeneralAgent:    '#bf5af2',
  VisionAgent:     '#ffd60a',
  BrowseAgent:     '#ff9f0a',
}

export default function Header({ onMenuToggle, onNewChat, agentInfo, title }) {
  const agentColor = agentInfo ? (AGENT_COLORS[agentInfo.agent] || '#ff3b30') : null

  return (
    <header className={styles.header}>
      {/* Left */}
      <div className={styles.left}>
        <button
          className={styles.iconBtn}
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Center — model/agent indicator */}
      <div className={styles.center}>
        {agentInfo ? (
          <div className={styles.agentPill} style={{ '--agent-color': agentColor }}>
            <span
              className={styles.agentDot}
              style={{ background: agentColor }}
            />
            <span>{agentInfo.agent?.replace('Agent', '') || 'RUBRA'}</span>
            {agentInfo.lang && agentInfo.lang !== 'en' && (
              <span className={styles.langBadge}>{agentInfo.lang}</span>
            )}
          </div>
        ) : (
          <div className={styles.modelLabel}>
            <span className={styles.modelName}>RUBRA</span>
            <span className={styles.modelSub}>v8</span>
          </div>
        )}
      </div>

      {/* Right */}
      <div className={styles.right}>
        <button
          className={styles.iconBtn}
          onClick={onNewChat}
          aria-label="New chat"
          title="New chat"
        >
          <Plus size={18} />
        </button>
      </div>
    </header>
  )
}
