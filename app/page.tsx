"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import TopBar from "@/components/top-bar"
import Dashboard from "@/components/dashboard"
import Accounts from "@/components/accounts"
import Reconciliation from "@/components/reconciliation"
import Reports from "@/components/reports"
import Settings from "@/components/settings"
import styles from "./page.module.css"

export default function Home() {
  const [activeSection, setActiveSection] = useState("dashboard")

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />
      case "accounts":
        return <Accounts />
      case "reconciliation":
        return <Reconciliation />
      case "reports":
        return <Reports />
      case "settings":
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className={styles.container}>
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className={styles.mainWrapper}>
        <TopBar />
        <main className={styles.mainContent}>{renderContent()}</main>
      </div>
    </div>
  )
}

