const zeroPadding = (num: number, len: number) => {
  let value = num.toString();
  while (value.length < len) value = "0" + value;
  return value;
};

export default zeroPadding;
