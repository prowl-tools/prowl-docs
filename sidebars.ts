import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'getting-started',
    // Desktop-first: the macOS target leads, promoted directly after Getting
    // Started (PQD-009). Web is the second target; mobile targets stay below.
    'macos-target',
    {
      type: 'category',
      label: 'Reference',
      collapsed: false,
      items: [
        'step-types',
        'assertions',
        'configuration',
        'variables',
        'selectors',
      ],
    },
    {
      type: 'category',
      label: 'Mobile Targets (Experimental)',
      collapsed: false,
      items: [
        'android',
        'ios',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      collapsed: false,
      items: [
        'auth',
        'watch-mode',
        'agents',
        'mcp',
        'starter-templates',
      ],
    },
    'troubleshooting',
  ],
};

export default sidebars;
