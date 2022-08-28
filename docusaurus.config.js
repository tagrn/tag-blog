// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Go Fiber",
  tagline: "한국어 번역",
  url: 'https://taewan-gu.github.io',
  baseUrl: '/',
  projectName: 'Taewan-Gu.github.io',
  organizationName: 'Taewan-Gu',
  deploymentBranch: "deploy",
  trailingSlash: false,
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these
  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Fiber 한국어 번역',
        logo: {
          alt: 'My Site Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Docs',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '공식 홈페이지',
            items: [
              {
                label: 'Home',
                to: 'https://gofiber.io/',
              },
              {
                label: 'Docs',
                to: 'https://docs.gofiber.io/',
              },
              {
                label: 'Examples',
                to: 'https://github.com/gofiber/recipes',
              },
              {
                label: 'GitHub',
                to: 'https://github.com/gofiber/fiber',
              },
            ],
          },
          {
            title: '커뮤니티',
            items: [
              {
                label: 'Discord',
                href: 'https://discord.com/invite/bSnH7db',
              },
            ],
          },
          {
            title: '사용 프레임워크',
            items: [
              {
                label: 'Docusaurus',
                href: 'https://github.com/facebook/docusaurus',
              },
            ],
          },
          {
            title: '프로젝트 번역 도움',
            items: [
              {
                label: 'Taewan Gu',
                href: 'https://github.com/Taewan-Gu',
              },
            ],
          },
        ],
        copyright: `Go Fiber Translation Project, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
