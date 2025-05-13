export const MODAL_STYLES = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: '1px solid #e8e8e8',
  },
  body: {
    overflowY: 'auto' as const,
    maxHeight: 'calc(100vh - 200px)',
    padding: '20px',
  },
  title: {
    width: '100%',
    cursor: 'move',
    padding: '20px',
  },
  close: {
    cursor: 'pointer',
    margin: '20px 20px 20px 0',
  },
  footer: {
    width: '100%',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,.15)',
  },
};

export const THEME_CONFIG = {
  token: {
    colorPrimary: '#f87007',
  },
};
