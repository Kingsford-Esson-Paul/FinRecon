"use client"

import { Home, BanknoteIcon as Bank, RefreshCw, BarChart2, Settings } from "lucide-react"
import styles from "./sidebar.module.css"

interface SidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

export default function Sidebar({ activeSection, setActiveSection }: SidebarProps) {
  const navItems = [
    { id: "dashboard", icon: <Home className={styles.icon} />, label: "Dashboard" },
    { id: "accounts", icon: <Bank className={styles.icon} />, label: "Accounts" },
    { id: "reconciliation", icon: <RefreshCw className={styles.icon} />, label: "Reconciliation" },
    { id: "reports", icon: <BarChart2 className={styles.icon} />, label: "Reports" },
    { id: "settings", icon: <Settings className={styles.icon} />, label: "Settings" },
  ]

  return (
    <nav className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>FR</div>
        <h2 className={styles.logoText}>FinRecon</h2>
      </div>

      <ul className={styles.navList}>
        {navItems.map((item) => (
          <li key={item.id} className={styles.navItem}>
            <button
              onClick={() => setActiveSection(item.id)}
              className={`${styles.navButton} ${activeSection === item.id ? styles.active : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

