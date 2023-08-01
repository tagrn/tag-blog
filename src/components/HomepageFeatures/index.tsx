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
        <Link
          to="https://twngg.notion.site/Taewan-Gu-34800b401d214840af80ae98215ac632"
          style={{ paddingRight: 15 }}
        >
          Portfolio
        </Link>
        {'   |   '}
        <Link to="https://github.com/tagrn" style={{ paddingLeft: 15 }}>
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
      </div>
    </section>
  );
}
