// import React from 'react'
import styles from './header.module.css'
// import styles from '../button/button.module.css'
const header = () => {
  return (
    <div className={styles.header}>
        This is header.
        <button className={styles.button}>Click me</button>
    </div>
  )
}

export default header