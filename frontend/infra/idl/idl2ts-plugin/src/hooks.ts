export enum Phases {
  BEFORE = 'BEFORE',
  ON = 'ON',
  AFTER = 'AFTER',
}

export const phases = Object.values(Phases);

export const joinPhases = <T extends string>(phase: Phases, hook: T) =>
  `__${phase}__::${hook}`;

export const on = <T extends string>(hook: T) =>
  joinPhases(Phases.ON, hook) as `__ON__::${T}`;
export const before = <T extends string>(hook: T) =>
  joinPhases(Phases.BEFORE, hook) as `__BEFORE__::${T}`;
export const after = <T extends string>(hook: T) =>
  joinPhases(Phases.AFTER, hook) as `__AFTER__::${T}`;

export default Phases;
