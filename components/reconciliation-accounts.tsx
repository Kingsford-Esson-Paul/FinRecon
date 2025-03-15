"use client"
import { ArrowRight, ChevronLeft } from "lucide-react"
import styles from "./reconciliation-accounts.module.css"

type BankAccount = {
  id?: string
  accountName: string
  accountNumber: string
  bankName: string
  branch: string
  statement: string | null
  balance?: number
}

interface ReconciliationAccountsProps {
  accounts: BankAccount[]
  sourceAccount: BankAccount | null
  targetAccounts: BankAccount[]
  step: number
  usedSourceAccounts: string[]
  onSourceSelect: (account: BankAccount) => void
  onTargetSelect: (accounts: BankAccount[]) => void
  onNext: () => void
  onCancel: () => void
}

export default function ReconciliationAccounts({
  accounts,
  sourceAccount,
  targetAccounts,
  step,
  usedSourceAccounts,
  onSourceSelect,
  onTargetSelect,
  onNext,
  onCancel,
}: ReconciliationAccountsProps) {
  const handleTargetToggle = (account: BankAccount) => {
    if (targetAccounts.some((a) => a.id === account.id)) {
      onTargetSelect(targetAccounts.filter((a) => a.id !== account.id))
    } else {
      onTargetSelect([...targetAccounts, account])
    }
  }

  const formatCurrency = (amount = 0) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const availableSourceAccounts = accounts.filter((account) => !usedSourceAccounts.includes(account.id as string))

  if (step === 1) {
    return (
      <div className={styles.container}>
        <h3 className={styles.stepTitle}>Step 1: Select Source Account</h3>
        <p className={styles.stepDescription}>Choose the account from which funds will be transferred.</p>

        {availableSourceAccounts.length === 0 ? (
          <div className={styles.emptyState}>
            <p>All accounts have been used for reconciliation. No more source accounts available.</p>
          </div>
        ) : (
          <div className={styles.accountsList}>
            {availableSourceAccounts.map((account) => (
              <div key={account.id} className={styles.accountItem}>
                <div className={styles.accountInfo}>
                  <input
                    type="radio"
                    id={`source-${account.id}`}
                    name="sourceAccount"
                    checked={sourceAccount?.id === account.id}
                    onChange={() => onSourceSelect(account)}
                    className={styles.radioInput}
                  />
                  <label htmlFor={`source-${account.id}`} className={styles.accountLabel}>
                    <div className={styles.accountDetails}>
                      <h4 className={styles.accountName}>{account.accountName}</h4>
                      <p className={styles.accountNumber}>{account.accountNumber}</p>
                      <p className={styles.bankName}>
                        {account.bankName} - {account.branch}
                      </p>
                    </div>
                    <div className={styles.accountBalance}>{formatCurrency(account.balance)}</div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
          <button className={styles.nextButton} onClick={onNext} disabled={!sourceAccount}>
            Next <ArrowRight className={styles.buttonIcon} />
          </button>
        </div>
      </div>
    )
  }

  if (step === 2) {
    const availableTargetAccounts = accounts.filter((account) => account.id !== sourceAccount?.id)

    return (
      <div className={styles.container}>
        <h3 className={styles.stepTitle}>Step 2: Select Target Accounts</h3>
        <p className={styles.stepDescription}>
          Choose one or more accounts to receive funds from {sourceAccount?.accountName}.
        </p>

        {availableTargetAccounts.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No other accounts available. Please add more accounts in the Accounts section.</p>
          </div>
        ) : (
          <div className={styles.accountsList}>
            {availableTargetAccounts.map((account) => (
              <div key={account.id} className={styles.accountItem}>
                <div className={styles.accountInfo}>
                  <input
                    type="checkbox"
                    id={`target-${account.id}`}
                    checked={targetAccounts.some((a) => a.id === account.id)}
                    onChange={() => handleTargetToggle(account)}
                    className={styles.checkboxInput}
                  />
                  <label htmlFor={`target-${account.id}`} className={styles.accountLabel}>
                    <div className={styles.accountDetails}>
                      <h4 className={styles.accountName}>{account.accountName}</h4>
                      <p className={styles.accountNumber}>{account.accountNumber}</p>
                      <p className={styles.bankName}>
                        {account.bankName} - {account.branch}
                      </p>
                    </div>
                    <div className={styles.accountBalance}>{formatCurrency(account.balance)}</div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.backButton} onClick={() => onCancel()}>
            <ChevronLeft className={styles.buttonIcon} /> Back
          </button>
          <button className={styles.nextButton} onClick={onNext} disabled={targetAccounts.length === 0}>
            Process Reconciliation <ArrowRight className={styles.buttonIcon} />
          </button>
        </div>
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className={styles.container}>
        <div className={styles.successMessage}>
          <h3 className={styles.successTitle}>Reconciliation Initiated</h3>
          <p>
            Your reconciliation process has been initiated between {sourceAccount?.accountName} and{" "}
            {targetAccounts.length} target accounts.
          </p>
          <p>You can view the details in the Financial Reconciliation tab.</p>
        </div>

        <div className={styles.actions}>
          <button className={styles.doneButton} onClick={onCancel}>
            Start New Reconciliation
          </button>
        </div>
      </div>
    )
  }

  return null
}

