import { Direction } from '@/enums/Direction';
import Sprite from '@/Sprite';

export type Position = {
  x: number;
  y: number;
};

export type ImageOffset = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type ImageSize = {
  width: number;
  height: number;
};

export type ImageAttr = {
  source: string;
  framesCount: number;
  animationDuration: number; // ms
  repeatAnimation: number;
  direction: Direction;
  offset: ImageOffset;
  scale: number;
  size?: ImageSize;
  frameClipper: (size: ImageSize, attr: ImageAttr, frame: number) => ImageOffset;
};

export type CharacterMotion = ImageAttr & {
  getHitArea?: ({
    sprite,
    position,
    animatedAt,
    framesCurrent,
    imageAttr,
  }: {
    sprite: Sprite;
    position: Position;
    animatedAt: number;
    framesCurrent: number;
    imageAttr: ImageAttr;
  }) => ImageOffset | undefined;
  getAttackArea?: ({
    sprite,
    position,
    animatedAt,
    framesCurrent,
    imageAttr,
  }: {
    sprite: Sprite;
    position: Position;
    animatedAt: number;
    framesCurrent: number;
    imageAttr: ImageAttr;
  }) => ImageOffset | undefined;
};
