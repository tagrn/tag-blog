import React from 'react';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';
import TOCItems from '@theme/TOCItems';
import styles from './styles.module.css';
// Using a custom className
// This prevents TOCInline/TOCCollapsible getting highlighted by mistake
const LINK_CLASS_NAME = 'table-of-contents__link toc-highlight';
const LINK_ACTIVE_CLASS_NAME = 'table-of-contents__link--active';

export default function TOC({className, ...props}) {
  const location = useLocation();
  const pathname = location.pathname.replaceAll('/', '%2F')

  return (
    <div className={clsx(styles.tableOfContents, 'thin-scrollbar', className)}>
      <TOCItems
        {...props}
        linkClassName={LINK_CLASS_NAME}
        linkActiveClassName={LINK_ACTIVE_CLASS_NAME}
      />
      <img
        style={{ marginLeft: '15px', marginTop: '15px', height: 20, width: 'auto' }}
        src={"https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fblog.taewan.link" + pathname + "&count_bg=%235B9F8B&title_bg=%23454545&amp;icon=&icon_color=%23E7E7E7&amp;title=hits&amp;edge_flat=false"}
        alt="Hits"
      ></img>
    </div>
  );
}
