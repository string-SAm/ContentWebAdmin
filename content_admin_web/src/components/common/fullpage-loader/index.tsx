// components/FullPageLoader.js

import React from 'react';
import styles from './loader.module.css'; // We'll create this CSS file next

const FullPageLoader = () => (
  <div className={styles.loaderContainer}>
    <div className={styles.loader}></div>
  </div>
);

export default FullPageLoader;
