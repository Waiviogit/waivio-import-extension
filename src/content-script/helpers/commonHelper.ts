export const randomNameGenerator = (num: number): string => {
  let res = '';
  for (let i = 0; i < num; i++) {
    const random = Math.floor(Math.random() * 27);
    res += String.fromCharCode(97 + random);
  }
  return res;
};
