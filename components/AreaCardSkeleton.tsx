import styles from './AreaCardSkeleton.module.css';

export default function AreaCardSkeleton() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonImage}></div>
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonTitle}></div>
        <div className={styles.skeletonCity}></div>
        <div className={styles.skeletonInfo}>
          <div className={styles.skeletonCount}></div>
          <div className={styles.skeletonLabel}></div>
        </div>
      </div>
    </div>
  );
}

