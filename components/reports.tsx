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
    const fetchTransactions = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('http://192.168.100.135:8000/api/transactions/v1/', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('API Error:', errorText)
          throw new Error(`Failed to fetch transactions: ${response.statusText}`)
        }

        const data = await response.json()
        setTransactions(data)
      } catch (err) {
        console.error("Error fetching transactions:", err)
        setError("Failed to load transactions. Please try again.")
      } finally {
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

