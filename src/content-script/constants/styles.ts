export const MODAL_STYLES = {
  header: {
    cursor: 'move',
    userSelect: 'none' as const,
  },
  body: {
    overflowY: 'auto' as const,
    maxHeight: 'calc(100vh - 200px)',
  },
  title: {
    width: '100%',
    cursor: 'move',
  },
};

export const THEME_CONFIG = {
  token: {
    colorPrimary: '#f87007',
  },
};
