class Env {
  get isPPE() {
    return IS_PROD;
  }
}

export const runtimeEnv = new Env();
