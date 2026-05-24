export type Either<L, R> = Left<L> | Right<R>;

export class Left<L> {
  readonly _tag = "Left" as const;
  constructor(readonly value: L) {}

  isLeft(): this is Left<L> {
    return true;
  }

  isRight(): this is never {
    return false;
  }
}

export class Right<R> {
  readonly _tag = "Right" as const;
  constructor(readonly value: R) {}

  isLeft(): this is never {
    return false;
  }

  isRight(): this is Right<R> {
    return true;
  }
}

export function left<L>(value: L): Left<L> {
  return new Left(value);
}

export function right<R>(value: R): Right<R> {
  return new Right(value);
}
