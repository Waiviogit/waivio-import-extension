const SELECTOR = {
  TWISTER_ID: '#tp-inline-twister-dim-values-container',
};

export const getOptions = () => {
  const options = document.querySelectorAll(SELECTOR.TWISTER_ID);
  console.log(options);
};
