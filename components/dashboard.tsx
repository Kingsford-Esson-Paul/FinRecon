import styles from "./dashboard.module.css"

export default function Dashboard() {
  return (
    <div className={styles.dashboard}>
      <h2 className={styles.title}>Dashboard</h2>
      <p>Welcome to your Financial Reconciliation Dashboard</p>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Total Accounts</h3>
          <p className={styles.statValue}>3</p>
        </div>

        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Pending Reconciliation</h3>
          <p className={styles.statValue}>2</p>
        </div>

        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Completed</h3>
          <p className={styles.statValue}>1</p>
        </div>
      </div>
    </div>
  )
}

