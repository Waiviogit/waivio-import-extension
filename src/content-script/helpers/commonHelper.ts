export const randomNameGenerator = (num: number): string => {
  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomName = '';

  for (let i = 0; i < num; i++) {
    const randomIndex = Math.floor(Math.random() * letters.length);
    randomName += letters[randomIndex];
  }

  const timestamp = Math.floor(Date.now() / 1000);
  randomName += `_${timestamp}`;

  return randomName;
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
