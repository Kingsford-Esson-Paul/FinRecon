"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { BanknoteIcon as Bank, Plus, X, Loader } from "lucide-react"
import styles from "./accounts.module.css"

interface BankAccount {
  account_name: string
  account_number: string
  bank_name: string
  bank_branch: string
  statement: string | null
  id?: string
  balance?: number
}

export default function Accounts() {
  const [showForm, setShowForm] = useState(false)
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileUploading, setFileUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    const fetchAccounts = async () => {
      setIsLoading(true)
      setError(null)

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
      } finally {
        setIsLoading(false)
      }
    }

    fetchAccounts()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const form = e.currentTarget
      const formData = new FormData(form)

      const newAccount: BankAccount = {
        account_name: formData.get("accountName") as string,
        account_number: formData.get("accountNumber") as string,
        bank_name: formData.get("bankName") as string,
        bank_branch: formData.get("branch") as string,
        statement: null,
      }

      const fileInput = form.querySelector("#statementFile") as HTMLInputElement
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        setFileUploading(true)
        
        const fileFormData = new FormData()
        fileFormData.append('file', fileInput.files[0])

        const uploadResponse = await fetch('http://192.168.100.135:8000/api/accounts/v1/', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
          },
          body: fileFormData,
        })

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text()
          console.error('Upload Error:', errorText)
          throw new Error('Failed to upload statement')
        }

        const uploadData = await uploadResponse.json()
        newAccount.statement = uploadData.fileUrl
      }

      const accountResponse = await fetch('http://192.168.100.135:8000/api/accounts/v1/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(newAccount),
      })

      if (!accountResponse.ok) {
        const errorText = await accountResponse.text()
        console.error('Account Creation Error:', errorText)
        throw new Error('Failed to create account')
      }

      const accountData = await accountResponse.json()
      setAccounts([...accounts, accountData])
      
      form.reset()
      setShowForm(false)
      setFileUploading(false)
      setUploadProgress(0)
    } catch (err) {
      console.error("Error creating account:", err)
      setError("Failed to create account. Please try again.")
    } finally {
      setIsSubmitting(false)
      setFileUploading(false)
      setUploadProgress(0)
    }
  }

  const viewBankStatement = (index: number) => {
    setSelectedAccount(index)
  }

  const closeModal = () => {
    setSelectedAccount(null)
  }

  if (isLoading) {
    return (
      <div className={styles.accounts}>
        <div className={styles.header}>
          <h2 className={styles.title}>Bank Accounts Management</h2>
        </div>
        <div className={styles.loadingContainer}>
          <Loader className={styles.loadingIcon} />
          <p>Loading accounts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.accounts}>
      <div className={styles.header}>
        <h2 className={styles.title}>Bank Accounts Management</h2>
        <button className={styles.addButton} onClick={() => setShowForm(true)}>
          <Plus className={styles.buttonIcon} /> Add New Account
        </button>
      </div>

      {error && <p className={styles.errorMessage}>{error}</p>}

      {showForm && (
        <div className={styles.formCard}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <h3 className={styles.formTitle}>Create New Account</h3>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="accountName" className={styles.label}>
                  Account Name
                </label>
                <input id="accountName" name="accountName" className={styles.input} required />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="accountNumber" className={styles.label}>
                  Account Number
                </label>
                <input id="accountNumber" name="accountNumber" className={styles.input} required />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="bankName" className={styles.label}>
                  Select Bank
                </label>
                <select id="bankName" name="bankName" className={styles.select} required>
                  <option value="">Select a bank</option>
                  <option value="bank1">Bank 1</option>
                  <option value="bank2">Bank 2</option>
                  <option value="bank3">Bank 3</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="branch" className={styles.label}>
                  Branch
                </label>
                <input id="branch" name="branch" className={styles.input} required />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="statementFile" className={styles.label}>
                  Upload Statement (CSV/XLSX)
                </label>
                <input
                  id="statementFile"
                  name="statementFile"
                  type="file"
                  accept=".csv,.xlsx"
                  className={styles.fileInput}
                />
                {fileUploading && (
                  <div className={styles.uploadProgress}>
                    <div className={styles.uploadProgressBar} style={{ width: `${uploadProgress}%` }}></div>
                    <span className={styles.uploadProgressText}>{uploadProgress}%</span>
                  </div>
                )}
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Account"}
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowForm(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {accounts.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No accounts added yet</p>
        </div>
      ) : (
        <div className={styles.accountsGrid}>
          {accounts.map((account, index) => (
            <div key={index} className={styles.accountCard} onClick={() => viewBankStatement(index)}>
              <div className={styles.accountCardContent}>
                <div className={styles.bankIcon}>
                  <Bank className={styles.bankIconSvg} />
                </div>
                <div className={styles.bankInfo}>
                  <h3 className={styles.bankName}>{account.bank_name}</h3>
                  <p className={styles.branchName}>{account.bank_branch}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAccount !== null && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Account Details</h3>
              <button className={styles.closeButton} onClick={closeModal}>
                <X className={styles.closeIcon} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.accountDetails}>
                <div className={styles.detailItem}>
                  <p className={styles.detailLabel}>Account Name</p>
                  <p className={styles.detailValue}>{accounts[selectedAccount].account_name}</p>
                </div>
                <div className={styles.detailItem}>
                  <p className={styles.detailLabel}>Account Number</p>
                  <p className={styles.detailValue}>{accounts[selectedAccount].account_number}</p>
                </div>
                <div className={styles.detailItem}>
                  <p className={styles.detailLabel}>Bank</p>
                  <p className={styles.detailValue}>{accounts[selectedAccount].bank_name}</p>
                </div>
                <div className={styles.detailItem}>
                  <p className={styles.detailLabel}>Branch</p>
                  <p className={styles.detailValue}>{accounts[selectedAccount].bank_branch}</p>
                </div>
                <div className={styles.detailItem}>
                  <p className={styles.detailLabel}>Balance</p>
                  <p className={styles.detailValue}>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(accounts[selectedAccount].balance || 0)}
                  </p>
                </div>
                {accounts[selectedAccount].statement && (
                  <div className={styles.detailItem}>
                    <p className={styles.detailLabel}>Statement</p>
                    <button className={styles.viewStatementButton}>View Statement</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

