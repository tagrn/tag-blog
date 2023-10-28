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
      <hr className={styles.splitLine} />
      <div style={{ width: '100vw' }} className={clsx('row')}>
        <Card
          title="GitHub 잔디심기 챌린지"
          content={
            <div>
              <div>챌린저스 앱을 통해 개설하여 꾸준히 진행하고 있는 챌린지</div>
              <Link to={'https://chlngers.onelink.me/Ju7U/c25w3g8d'}>
                참가 링크
              </Link>
              <div>2022.07 ~ 진행 중</div>
              <div>2023.10.28 현재 누적 참가 313명</div>
            </div>
          }
        />
        <Card
          title="블로깅"
          content={
            <div>
              <div>개발관련 이슈나 문제해결, 배운 점을 정리</div>
              <Link to={'https://blog.taewan.link/'}>현재 블로그 링크</Link>
              <div>2019.10 ~ 진행 중</div>
              <div>2023.07에 Docusaurus를 이용하여 새로운 블로그 개설</div>
            </div>
          }
        />
        <Card
          title="LeetCode T-shirt 얻기"
          content={
            <div>
              <div>Redeem 6000을 모아 T-shirt를 얻는 챌린지</div>
              <Link to={'https://leetcode.com/Taewan-Gu'}>
                릿코드 계정 링크
              </Link>
              <div>2023.08 ~ 진행 중</div>
              <div>2023.10.28 현재 Redeem: 1163</div>
            </div>
          }
        />
        <Card
          title="사이드 프로젝트: 목터뷰"
          content={
            <div>
              <div>셀프 화상면접 서비스</div>
              <Link to={'https://mockterview.com/'}>
                서비스 링크
              </Link>
              <div>2023.09 ~ 진행 중</div>
              <div>개발 중</div>
            </div>
          }
        />
      </div>
    </Layout>
  );
}
