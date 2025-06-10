import { type Ctxs, type IPlugin, Program, on, before, after } from '../src';

interface Ctx {
  count: number;
}
interface Hook extends Ctxs {
  add: Ctx;
  reduce: Ctx;
  acc: { text: string };
}

class AddPlugin implements IPlugin {
  apply(program: Program<Hook>): void {
    program.register(on('add'), ctx => {
      ctx.count += 1;
      return ctx;
    });
  }
}
class ReducePlugin implements IPlugin {
  apply(program: Program<Hook>): void {
    program.register(on('reduce'), ctx => {
      ctx.count -= 1;
      return ctx;
    });
  }
}

describe('Program', () => {
  it('should apply plugin', () => {
    const program = Program.create<Hook>([new AddPlugin(), new ReducePlugin()]);
    expect(program.trigger('add', { count: 0 }).count).toEqual(1);
    expect(program.trigger('reduce', { count: 0 }).count).toEqual(-1);
  });
  it('should apply plugin by priority', () => {
    class FirstPlugin implements IPlugin {
      apply(program: Program<Hook>): void {
        program.register(
          on('reduce'),
          ctx => {
            ctx.count = 1;
            return ctx;
          },
          0,
        );
      }
    }
    class SecondPlugin implements IPlugin {
      apply(program: Program<Hook>): void {
        program.register(
          on('reduce'),
          ctx => {
            ctx.count = 2;
            return ctx;
          },
          1,
        );
      }
    }
    const program = Program.create<Hook>([
      new SecondPlugin(),
      new FirstPlugin(),
    ]);
    expect(program.trigger('reduce', { count: 0 }).count).toEqual(2);
  });
  it('should apply plugin by order: before -> on -> after', () => {
    class Plugin implements IPlugin {
      apply(program: Program<Hook>): void {
        program.register(before('acc'), ctx => {
          ctx.text += 'before';
          return ctx;
        });
        program.register(on('acc'), ctx => {
          ctx.text += '_on';
          return ctx;
        });
        program.register(after('acc'), ctx => {
          ctx.text += '_after';
          return ctx;
        });
      }
    }
    const program = Program.create<Hook>([new Plugin()]);
    expect(program.trigger('acc', { text: '' }).text).toEqual(
      'before_on_after',
    );
  });
  it('should load plugin be fine', () => {
    class Plugin implements IPlugin {
      apply(program: Program<Hook>): void {
        program.register(before('acc'), ctx => {
          ctx.text += 'before';
          return ctx;
        });
        program.register(on('acc'), ctx => {
          ctx.text += '_on';
          return ctx;
        });
        program.register(after('acc'), ctx => {
          ctx.text += '_after';
          return ctx;
        });
      }
    }
    const program = Program.create<Hook>([]);
    program.loadPlugins([new Plugin()]);
    expect(program.trigger('acc', { text: '' }).text).toEqual(
      'before_on_after',
    );
  });
  it('should throw error if has no register', () => {
    const program = Program.create<Hook>([]);
    expect(() => program.trigger('acc', { text: '' })).toThrowError();
  });
});
