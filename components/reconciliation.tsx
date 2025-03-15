"use client"

import { useState, useEffect } from "react"
import styles from "./reconciliation.module.css"
import ReconciliationAccounts from "./reconciliation-accounts"
import FinancialReconciliation from "./financial-reconciliation"

type BankAccount = {
  id?: string
  accountName: string
  accountNumber: string
  bankName: string
  branch: string
  statement: string | null
  balance?: number
}

export default function Reconciliation() {
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [activeTab, setActiveTab] = useState("accounts")
  const [sourceAccount, setSourceAccount] = useState<BankAccount | null>(null)
  const [targetAccounts, setTargetAccounts] = useState<BankAccount[]>([])
  const [step, setStep] = useState(1)
  const [transactions, setTransactions] = useState<any[]>([])
  const [usedSourceAccounts, setUsedSourceAccounts] = useState<string[]>([])
  const [reconciliationDays, setReconciliationDays] = useState<number>(7)
  const [showDaysModal, setShowDaysModal] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch('http://192.168.100.135:8000/api/accounts/v1/', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('API Error:', errorText)
          throw new Error(`Failed to fetch accounts: ${response.statusText}`)
        }

        const data = await response.json()
        setAccounts(data)
      } catch (err) {
        console.error("Error fetching accounts:", err)
        setError("Failed to load accounts. Please try again.")
      }
    }

    fetchAccounts()
  }, [])

  const processReconciliation = async () => {
    if (!sourceAccount || targetAccounts.length === 0) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('http://192.168.100.135:8000/api/reconciliation/v1/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          sourceAccountId: sourceAccount.id,
          targetAccountIds: targetAccounts.map(acc => acc.id),
          reconciliationDays: reconciliationDays
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', errorText)
        throw new Error('Failed to initiate reconciliation')
      }

      const data = await response.json()
      setStep(3)
      setShowDaysModal(false)

      if (sourceAccount && sourceAccount.id) {
        setUsedSourceAccounts((prev) => [...prev, sourceAccount.id as string])
      }

      // Update transactions with the reconciliation results
      setTransactions(data.transactions)
    } catch (err) {
      console.error("Error initiating reconciliation:", err)
      setError("Failed to initiate reconciliation. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTransactions = async () => {
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
    }
  }

  const handleSourceSelection = (account: BankAccount) => {
    setSourceAccount(account)
  }

  const handleTargetSelection = (selectedAccounts: BankAccount[]) => {
    setTargetAccounts(selectedAccounts)
  }

  const handleNext = () => {
    if (step === 1 && sourceAccount) {
      setStep(2)
    } else if (step === 2 && targetAccounts.length > 0) {
      setShowDaysModal(true)
    }
  }

  const handleCancel = () => {
    setSourceAccount(null)
    setTargetAccounts([])
    setStep(1)
  }

  const renderContent = () => {
    switch (activeTab) {
      case "accounts":
        return (
          <ReconciliationAccounts
            accounts={accounts}
            sourceAccount={sourceAccount}
            targetAccounts={targetAccounts}
            step={step}
            usedSourceAccounts={usedSourceAccounts}
            onSourceSelect={handleSourceSelection}
            onTargetSelect={handleTargetSelection}
            onNext={handleNext}
            onCancel={handleCancel}
          />
        )
      case "financial":
        return <FinancialReconciliation />
      default:
        return null
    }
  }

  const renderDaysModal = () => {
    if (!showDaysModal) return null

    return (
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          <h3 className={styles.modalTitle}>Set Reconciliation Period</h3>
          <p className={styles.modalDescription}>
            Enter the number of days this reconciliation should take. Transactions will be matched if they fall between
            today (Post Date) and the Value Date.
          </p>

          <div className={styles.formGroup}>
            <label htmlFor="reconciliationDays" className={styles.label}>
              Number of Days:
            </label>
            <input
              id="reconciliationDays"
              type="number"
              min="1"
              max="90"
              value={reconciliationDays}
              onChange={(e) => setReconciliationDays(Number.parseInt(e.target.value) || 7)}
              className={styles.input}
            />
          </div>

          <div className={styles.datePreview}>
            <div className={styles.dateItem}>
              <span className={styles.dateLabel}>Post Date:</span>
              <span className={styles.dateValue}>{new Date().toLocaleDateString()}</span>
            </div>
            <div className={styles.dateItem}>
              <span className={styles.dateLabel}>Value Date:</span>
              <span className={styles.dateValue}>
                {new Date(Date.now() + reconciliationDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button className={styles.cancelButton} onClick={() => setShowDaysModal(false)} disabled={isLoading}>
              Cancel
            </button>
            <button className={styles.confirmButton} onClick={processReconciliation} disabled={isLoading}>
              {isLoading ? "Processing..." : "Confirm & Process"}
            </button>
          </div>

          {error && <p className={styles.errorMessage}>{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.reconciliation}>
      <h2 className={styles.title}>Reconciliation</h2>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "accounts" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("accounts")}
        >
          Reconciliation Accounts
        </button>
        <button
          className={`${styles.tab} ${activeTab === "financial" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("financial")}
        >
          Financial Reconciliation
        </button>
      </div>

      <div className={styles.content}>{renderContent()}</div>
      {renderDaysModal()}
    </div>
  )
}

