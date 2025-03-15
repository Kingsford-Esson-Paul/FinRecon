import { Search, Bell } from "lucide-react"
import styles from "./top-bar.module.css"

export default function TopBar() {
  return (
    <header className={styles.topBar}>
      <div className={styles.searchBar}>
        <input type="text" placeholder="Search..." className={styles.searchInput} />
        <Search className={styles.searchIcon} />
      </div>

      <div className={styles.userProfile}>
        {/* <div className={styles.notifications}>
          <Bell className={styles.bellIcon} />
          <span className={styles.badge}>3</span>
        </div> */}
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            <img src="/placeholder.svg?height=40&width=40" alt="User Avatar" className={styles.avatarImage} />
          </div>
          <span className={styles.userName}>User Name</span>
        </div>
      </div>
    </header>
  )
}

