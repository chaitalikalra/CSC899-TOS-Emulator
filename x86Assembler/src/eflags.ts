class EFlags {
  flags: boolean[];
  // From https://en.wikipedia.org/wiki/FLAGS_register
  static byteMappings = {
    CF: 0,
    PF: 2,
    AF: 4,
    ZF: 6,
    SF: 7,
    IF: 9,
    OF: 11
  };

  constructor() {
    this.flags = new Array(32).fill(false);
  }
}

export { EFlags };
