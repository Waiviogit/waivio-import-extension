export const randomNameGenerator = (num: number): string => {
  let res = '';
  for (let i = 0; i < num; i++) {
    const random = Math.floor(Math.random() * 27);
    res += String.fromCharCode(97 + random);
  }
  return res;
};

export const make2dArray = (arr1d :string[]):string[][] => {
  const arr2d = [];
  const rowLength = 2;

  while (arr1d.length > 0) {
    const row = arr1d.splice(0, rowLength);
    arr2d.push(row);
  }

  return arr2d;
};
