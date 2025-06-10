function rawParse(str) {
    const lines = (str || '').split('\n');
    const entries = lines.map((line) => {
      line = line.trim();
      const res = line.match(/at (.+) \((.+)\)/)||[]
      return {
        beforeParse: line,
        callee: res[1]
      };
    });
    return entries.filter((x) => x.callee !== undefined);
  }

  function createStruct(fn) {
    const structFactory = () => {
      const error = new Error();
      const items = rawParse(error.stack).filter((i) => i.callee === 'structFactory').map((i) => i.beforeParse);
      const isCircle = items.length > Array.from(new Set(items)).length;
      if (isCircle) {
        return {};
      }
      const res = fn();

      return res;
    };

    return structFactory;
  }
  module.exports={ createStruct }
  