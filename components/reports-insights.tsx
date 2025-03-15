"use client"

import { useState } from "react"
import { Download, BarChart2, LineChart } from "lucide-react"
import styles from "./reports-insights.module.css"

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

interface ReportsInsightsProps {
  transactions: Transaction[]
}

export default function ReportsInsights({ transactions }: ReportsInsightsProps) {
  const [reportType, setReportType] = useState("summary")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [isExporting, setIsExporting] = useState(false)

  const matchedTransactions = transactions.filter((t) => t.status === "Matched")
  const unmatchedTransactions = transactions.filter((t) => t.status === "Unmatched")

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0)
  const matchedAmount = matchedTransactions.reduce((sum, t) => sum + t.amount, 0)
  const unmatchedAmount = unmatchedTransactions.reduce((sum, t) => sum + t.amount, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const downloadReport = async (type: string) => {
    setIsExporting(true)

    try {
      const response = await fetch(`http://192.168.100.135:8000/api/reports/v1/export?format=${type}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', errorText)
        throw new Error('Failed to export report')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reconciliation_report.${type.toLowerCase()}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error("Error exporting report:", err)
      alert("Failed to export report. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  // Create SVG pie chart
  const createPieChart = () => {
    if (transactions.length === 0) return null

    const matchedPercentage = (matchedTransactions.length / transactions.length) * 100
    const unmatchedPercentage = (unmatchedTransactions.length / transactions.length) * 100

    // Calculate angles for SVG arc
    const matchedAngle = (matchedPercentage / 100) * 360
    const unmatchedAngle = (unmatchedPercentage / 100) * 360

    // SVG arc path calculation
    const createArc = (startAngle: number, endAngle: number) => {
      const radius = 80
      const cx = 100
      const cy = 100

      // Convert angles to radians
      const startRad = ((startAngle - 90) * Math.PI) / 180
      const endRad = ((endAngle - 90) * Math.PI) / 180

      // Calculate start and end points
      const startX = cx + radius * Math.cos(startRad)
      const startY = cy + radius * Math.sin(startRad)
      const endX = cx + radius * Math.cos(endRad)
      const endY = cy + radius * Math.sin(endRad)

      // Determine if the arc should be drawn the long way around
      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"

      // Create the SVG path
      return `M ${cx} ${cy} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`
    }

    return (
      <div className={styles.svgPieChartContainer}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Matched transactions slice */}
          <path d={createArc(0, matchedAngle)} fill="#16a34a" stroke="#fff" strokeWidth="1" />
          {/* Unmatched transactions slice */}
          <path d={createArc(matchedAngle, 360)} fill="#ea580c" stroke="#fff" strokeWidth="1" />
        </svg>
        <div className={styles.chartLegend}>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: "#16a34a" }}></div>
            <span>Matched ({Math.round(matchedPercentage)}%)</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: "#ea580c" }}></div>
            <span>Unmatched ({Math.round(unmatchedPercentage)}%)</span>
          </div>
        </div>
      </div>
    )
  }

  const renderSummaryReport = () => {
    return (
      <div className={styles.summaryReport}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h4 className={styles.statTitle}>Total Transactions</h4>
            <p className={styles.statValue}>{transactions.length}</p>
          </div>

          <div className={styles.statCard}>
            <h4 className={styles.statTitle}>Matched Transactions</h4>
            <p className={styles.statValue}>{matchedTransactions.length}</p>
            <p className={styles.statPercentage}>
              {transactions.length > 0
                ? `${Math.round((matchedTransactions.length / transactions.length) * 100)}%`
                : "0%"}
            </p>
          </div>

          <div className={styles.statCard}>
            <h4 className={styles.statTitle}>Unmatched Transactions</h4>
            <p className={styles.statValue}>{unmatchedTransactions.length}</p>
            <p className={styles.statPercentage}>
              {transactions.length > 0
                ? `${Math.round((unmatchedTransactions.length / transactions.length) * 100)}%`
                : "0%"}
            </p>
          </div>
        </div>

        <div className={styles.amountSummary}>
          <div className={styles.amountCard}>
            <h4 className={styles.amountTitle}>Total Amount</h4>
            <p className={styles.amountValue}>{formatCurrency(totalAmount)}</p>
          </div>

          <div className={styles.amountCard}>
            <h4 className={styles.amountTitle}>Matched Amount</h4>
            <p className={styles.amountValue}>{formatCurrency(matchedAmount)}</p>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${totalAmount > 0 ? (matchedAmount / totalAmount) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          <div className={styles.amountCard}>
            <h4 className={styles.amountTitle}>Unmatched Amount</h4>
            <p className={styles.amountValue}>{formatCurrency(unmatchedAmount)}</p>
            <div className={styles.progressBar}>
              <div
                className={`${styles.progressFill} ${styles.unmatchedFill}`}
                style={{ width: `${totalAmount > 0 ? (unmatchedAmount / totalAmount) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className={styles.periodSummary}>
          <div className={styles.statCard}>
            <h4 className={styles.statTitle}>Transactions Within Period</h4>
            <p className={styles.statValue}>{transactions.filter((t) => t.isWithinPeriod).length}</p>
            <p className={styles.statPercentage}>
              {transactions.length > 0
                ? `${Math.round((transactions.filter((t) => t.isWithinPeriod).length / transactions.length) * 100)}%`
                : "0%"}
            </p>
          </div>

          <div className={styles.statCard}>
            <h4 className={styles.statTitle}>Transactions Outside Period</h4>
            <p className={styles.statValue}>{transactions.filter((t) => t.isWithinPeriod === false).length}</p>
            <p className={styles.statPercentage}>
              {transactions.length > 0
                ? `${Math.round((transactions.filter((t) => t.isWithinPeriod === false).length / transactions.length) * 100)}%`
                : "0%"}
            </p>
          </div>
        </div>

        <div className={styles.chartSection}>
          <h4 className={styles.chartTitle}>Transaction Status Distribution</h4>
          <div className={styles.chartContainer}>
            {transactions.length > 0 ? (
              createPieChart()
            ) : (
              <div className={styles.noDataMessage}>No transaction data available</div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderDetailedReport = () => {
    // Calculate pagination values
    const indexOfLastTransaction = currentPage * rowsPerPage
    const indexOfFirstTransaction = indexOfLastTransaction - rowsPerPage
    const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction)
    const totalPages = Math.ceil(transactions.length / rowsPerPage)

    // Add pagination controls function
    const renderPagination = () => {
      return (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Showing {indexOfFirstTransaction + 1} to {Math.min(indexOfLastTransaction, transactions.length)} of{" "}
            {transactions.length} entries
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

    return (
      <div className={styles.detailedReport}>
        <div className={styles.reportHeader}>
          <h4 className={styles.reportTitle}>Detailed Transaction Report</h4>
          <div className={styles.reportActions}>
            <button className={styles.downloadButton} onClick={() => downloadReport("csv")} disabled={isExporting}>
              <Download className={styles.buttonIcon} /> CSV
            </button>
            <button className={styles.downloadButton} onClick={() => downloadReport("pdf")} disabled={isExporting}>
              <Download className={styles.buttonIcon} /> PDF
            </button>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No transactions to report. Please initiate a reconciliation process first.</p>
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
                      >
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {renderPagination()}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Reports & Insights</h3>
        <p className={styles.description}>View reconciliation progress and generate reports.</p>
      </div>

      <div className={styles.reportTabs}>
        <button
          className={`${styles.reportTab} ${reportType === "summary" ? styles.activeTab : ""}`}
          onClick={() => setReportType("summary")}
        >
          <BarChart2 className={styles.tabIcon} /> Summary Dashboard
        </button>
        <button
          className={`${styles.reportTab} ${reportType === "detailed" ? styles.activeTab : ""}`}
          onClick={() => setReportType("detailed")}
        >
          <LineChart className={styles.tabIcon} /> Detailed Report
        </button>
      </div>

      <div className={styles.reportContent}>
        {reportType === "summary" ? renderSummaryReport() : renderDetailedReport()}
      </div>
    </div>
  )
}

