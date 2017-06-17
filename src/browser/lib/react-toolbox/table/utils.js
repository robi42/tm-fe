const isNotValidNumber = value => !/-?(\d+|\d+\.\d+|\.\d+)([eE][-+]?\d+)?/.test(value);

const inputTypeForPrototype = (prototype, value) => {
  if (prototype === Date) {
    try {
      new Date(value).toISOString();
    } catch (e) {
      return 'text';
    }
    return 'date';
  }
  if (prototype === Number) {
    if (isNotValidNumber(value)) {
      return 'text';
    }
    return 'number';
  }
  if (prototype === Boolean) return 'checkbox';
  return 'text';
};

const prepareValueForInput = (value, type) => {
  if (type === 'checkbox') {
    return value ? 'on' : '';
  }
  return value;
};

export { inputTypeForPrototype, prepareValueForInput };
