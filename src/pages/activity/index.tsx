import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Card from '../../components/Card';
import styles from './styles.module.css';

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title="진행중인 활동">
      <div className={styles.title}> 🧑🏻‍💻 진행중인 활동 </div>
      <hr />
      <div className={clsx('row')}>
        <Card
          title="GitHub 잔디심기 챌린지"
          content={
            <div>
              <div>챌린저스 앱을 통해 개설하여 꾸준히 진행하고 있는 챌린지</div>
              <Link to={'https://chlngers.onelink.me/Ju7U/213nhfse'}>
                참가 링크
              </Link>
              <div>2022.07.18 ~ 진행 중</div>
              <div>2023.09.07 현재 누적 참가 285명</div>
            </div>
          }
        />
        <Card
          title="블로깅"
          content={
            <div>
              <div>개발관련 이슈나 문제해결, 배운 점을 정리</div>
              <Link to={'https://blog.taewan.link/'}>블로그 링크</Link>
              <div>2023.07.01 ~ 진행 중</div>
              <div>Docusaurus를 사용하여 블로그 개설</div>
            </div>
          }
        />
        <Card
          title="LeetCode T-shirt 얻기"
          content={
            <div>
              <div>Redeem 6000을 모아 T-shirt를 얻는 챌린지</div>
              <Link to={'https://leetcode.com/store/'}>티셔츠 상품 링크</Link>
              <div>2023.08.01 ~ 진행 중</div>
              <div>2023.09.07 현재 Redeem: 932</div>
            </div>
          }
        />
      </div>
    </Layout>
  );
}
