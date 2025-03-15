"use client"

import { useState, useEffect } from "react"
import { Loader } from "lucide-react"
import ReportsInsights from "./reports-insights"
import styles from "./reports.module.css"

export default function Reports() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch transactions from the backend
    const fetchTransactions = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // In a real app, this would be an API call
        // const response = await fetch('/api/transactions');
        // const data = await response.json();
        // if (!response.ok) throw new Error(data.message || 'Failed to fetch transactions');
        // setTransactions(data);

        // For now, we'll use localStorage as a stand-in for the API
        const savedTransactions = localStorage.getItem("reconciliationTransactions")
        if (savedTransactions) {
          setTransactions(JSON.parse(savedTransactions))
        } else {
          setTransactions([])
        }

        // Simulate API delay
        setTimeout(() => {
          setIsLoading(false)
        }, 500)
      } catch (err) {
        console.error("Error fetching transactions:", err)
        setError("Failed to load transactions. Please try again.")
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  if (isLoading) {
    return (
      <div className={styles.reports}>
        <h2 className={styles.title}>Reports</h2>
        <div className={styles.loadingContainer}>
          <Loader className={styles.loadingIcon} />
          <p>Loading report data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.reports}>
        <h2 className={styles.title}>Reports</h2>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
          <button className={styles.retryButton} onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.reports}>
      <h2 className={styles.title}>Reports</h2>

      {transactions.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No reconciliation data available. Please complete a reconciliation process first.</p>
        </div>
      ) : (
        <ReportsInsights transactions={transactions} />
      )}
    </div>
  )
}

