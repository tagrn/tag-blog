import React from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Tag's Blog",
    description: (
      <div>
        <Link to="https://github.com/tagrn/tag-blog">
          GitHub
        </Link>
        <br />
      </div>
    ),
  },
];

function Feature({ title, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <h1>{title}</h1>
        <br></br>
        <p className={styles.descriptionMainFeature}>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container h-screen">
        <div className={styles.features}>
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <img
            style={{ height: 20, width: 'auto' }}
            src="https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fblog.taewan.link&amp;count_bg=%235B9F9B&amp;title_bg=%23454545&amp;icon=&amp;icon_color=%23E7E7E7&amp;title=hits&amp;edge_flat=false"
            alt="Hits"
          ></img>
        </div>
      </div>
    </section>
  );
}
