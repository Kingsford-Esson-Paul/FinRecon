"use client"

import { useState, useEffect } from "react"
import { Search, Filter, CheckCircle, AlertCircle, Edit, Loader } from 'lucide-react'
import styles from "./financial-reconciliation.module.css"

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  sourceAccount: string
  targetAccount: string
  status: string
  type: string
  postDate?: string
  valueDate?: string
  isWithinPeriod?: boolean
}

export default function FinancialReconciliation() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch transactions from the backend
    const fetchTransactions = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Make an API call to fetch transactions
        const response = await fetch('http://192.168.100.135:8000/api/transactions')
        const data = await response.json()
        
        if (!response.ok) throw new Error(data.message || 'Failed to fetch transactions')
        setTransactions(data)
        
        setIsLoading(false)
      } catch (err) {
        console.error("Error fetching transactions:", err)
        setError("Failed to load transactions. Please try again.")
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.sourceAccount?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.targetAccount?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter
    const matchesType = typeFilter === "all" || transaction.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // Calculate pagination values
  const indexOfLastTransaction = currentPage * rowsPerPage
  const indexOfFirstTransaction = indexOfLastTransaction - rowsPerPage
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction)
  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const handleManualReconcile = async () => {
    if (!selectedTransaction) return

    setIsLoading(true)
    setError(null)

    try {
      const targetAccountId = (document.getElementById('targetAccount') as HTMLSelectElement)?.value
    
      if (!targetAccountId) {
        setError("Please select a target account")
        setIsLoading(false)
        return
      }

      const response = await fetch(`http://192.168.100.135:8000/api/transactions/${selectedTransaction.id}/reconcile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetAccountId,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to reconcile transaction')

      // Update the local state with the updated transaction
      setTransactions(prevTransactions =>
        prevTransactions.map(tx =>
          tx.id === selectedTransaction.id ? { ...tx, ...data } : tx
        )
      )

      setSelectedTransaction(null)
    } catch (err) {
      console.error("Error reconciling transaction:", err)
      setError("Failed to reconcile transaction. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Add pagination controls function
  const renderPagination = () => {
    return (
      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          Showing {indexOfFirstTransaction + 1} to {Math.min(indexOfLastTransaction, filteredTransactions.length)} of{" "}
          {filteredTransactions.length} entries
        </div>
        <div className={styles.paginationControls}>
          <button className={styles.paginationButton} onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
            First
          </button>
          <button
            className={styles.paginationButton}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className={styles.paginationCurrent}>
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            className={styles.paginationButton}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </button>
          <button
            className={styles.paginationButton}
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Last
          </button>
        </div>
      </div>
    )
  }

  if (isLoading && transactions.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <Loader className={styles.loadingIcon} />
        <p>Loading transactions...</p>
      </div>
    )
  }

  if (error && transactions.length === 0) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error}</p>
        <button className={styles.retryButton} onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Financial Reconciliation</h3>
        <p className={styles.description}>Match debits from source accounts to credits in target accounts.</p>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="statusFilter" className={styles.filterLabel}>
            <Filter className={styles.filterIcon} /> Status:
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="Matched">Matched</option>
            <option value="Unmatched">Unmatched</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="typeFilter" className={styles.filterLabel}>
            <Filter className={styles.filterIcon} /> Type:
          </label>
          <select
            id="typeFilter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="Debit">Debit</option>
            <option value="Credit">Credit</option>
          </select>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No transactions to reconcile. Please initiate a reconciliation process first.</p>
        </div>
      ) : (
        <div className={styles.transactionsContainer}>
          <table className={styles.transactionsTable}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Source Account</th>
                <th>Target Account</th>
                <th>Type</th>
                <th>Post Date</th>
                <th>Value Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className={`${styles.transactionRow} ${
                    transaction.status === "Unmatched" ? styles.unmatchedRow : ""
                  }`}
                >
                  <td>{transaction.date}</td>
                  <td>{transaction.description}</td>
                  <td className={styles.amountCell}>{formatCurrency(transaction.amount)}</td>
                  <td>{transaction.sourceAccount}</td>
                  <td>{transaction.targetAccount || "-"}</td>
                  <td>{transaction.type}</td>
                  <td>{transaction.postDate || "-"}</td>
                  <td>{transaction.valueDate || "-"}</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        transaction.status === "Matched" ? styles.matchedBadge : styles.unmatchedBadge
                      }`}
                      title={
                        transaction.isWithinPeriod ? "Within reconciliation period" : "Outside reconciliation period"
                      }
                    >
                      {transaction.status === "Matched" ? (
                        <CheckCircle className={styles.statusIcon} />
                      ) : (
                        <AlertCircle className={styles.statusIcon} />
                      )}
                      {transaction.status}
                      {transaction.isWithinPeriod !== undefined && (
                        <span className={styles.periodIndicator}>
                          {transaction.isWithinPeriod ? " (In Period)" : " (Out of Period)"}
                        </span>
                      )}
                    </span>
                  </td>
                  <td>
                    {transaction.status === "Unmatched" && (
                      <button className={styles.reconcileButton} onClick={() => setSelectedTransaction(transaction)}>
                        <Edit className={styles.actionIcon} /> Reconcile
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {renderPagination()}
        </div>
      )}

      {selectedTransaction && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h4 className={styles.modalTitle}>Manual Reconciliation</h4>
            <p>Reconcile transaction: {selectedTransaction.description}</p>
            <p>Amount: {formatCurrency(selectedTransaction.amount)}</p>
            <p>Source Account: {selectedTransaction.sourceAccount}</p>

            <div className={styles.formGroup}>
              <label htmlFor="targetAccount" className={styles.label}>
                Select Target Account:
              </label>
              <select id="targetAccount" className={styles.select}>
                <option value="">Select an account</option>
                <option value="account1">Account 1</option>
                <option value="account2">Account 2</option>
                <option value="account3">Account 3</option>
              </select>
            </div>

            {error && <p className={styles.errorMessage}>{error}</p>}

            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={() => setSelectedTransaction(null)} disabled={isLoading}>
                Cancel
              </button>
              <button className={styles.reconcileActionButton} onClick={handleManualReconcile} disabled={isLoading}>
                {isLoading ? "Processing..." : "Reconcile Transaction"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
