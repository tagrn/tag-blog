import React from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  content: JSX.Element;
};

export default function Card({ title, content }: FeatureItem): JSX.Element {
  return (
    <div className={clsx('col col--6')}>
      <div className={styles.cardConainer}>
        <div className="text--center padding-horiz--md">
          <h2>{title}</h2>
          <p className={styles.descriptionMainFeature}>{content}</p>
        </div>
      </div>
    </div>
  );
}
