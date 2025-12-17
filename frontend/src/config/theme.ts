import type { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  token: {
    // Primary colors
    colorPrimary: '#1890ff',
    colorLink: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',

    // Typography
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,

    // Spacing
    borderRadius: 4,

    // Layout
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f0f2f5',
  },
  components: {
    Typography: {
      // Custom typography sizes for prices and headings
      titleMarginBottom: 0,
      titleMarginTop: 0,
    },
    Button: {
      controlHeight: 32,
      controlHeightLG: 40,
      controlHeightSM: 24,
    },
    Card: {
      borderRadiusLG: 8,
    },
    Input: {
      controlHeight: 32,
      controlHeightLG: 40,
    },
  },
};
