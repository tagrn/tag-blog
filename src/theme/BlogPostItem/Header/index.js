import React from 'react';
import BlogPostItemHeaderTitle from '@theme/BlogPostItem/Header/Title';
import BlogPostItemHeaderInfo from '@theme/BlogPostItem/Header/Info';
import BlogPostItemHeaderAuthors from '@theme/BlogPostItem/Header/Authors';
export default function BlogPostItemHeader() {
  return (
    <header>
      <div style={{display: "flex"}}>
        <BlogPostItemHeaderTitle />
      </div>
      <BlogPostItemHeaderInfo />
      <BlogPostItemHeaderAuthors />
    </header>
  );
}
