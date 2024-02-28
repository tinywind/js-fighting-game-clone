import { Character } from '../Character.ts';
import { Direction } from '../enums/Direction.ts';

export const create = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, healthIndicator?: HTMLElement) =>
  new Character(
    canvas,
    context,
    {
      name: 'enemy',
      position: { x: (canvas.width / 4) * 3 - 70 / 2, y: 50 },
      healthIndicator: healthIndicator,
    },
    {
      IDLE: [
        {
          direction: Direction.LEFT,
          source: './images/kenji/Idle.png',
          scale: 2,
          framesCount: 4,
          repeatAnimation: 0,
          // offset: { left: 80, top: 75, right: 75, bottom: 70 },
          getHitArea: ({ position }) => ({
            left: position.x - 20,
            top: position.y - 40,
            right: position.x + 20,
            bottom: position.y + 30,
          }),
        },
      ],
      JUMP: [
        {
          direction: Direction.LEFT,
          source: './images/kenji/Jump.png',
          scale: 2,
          framesCount: 2,
          repeatAnimation: 1,
          // offset: { left: 80, top: 75, right: 75, bottom: 70 },
          getHitArea: ({ position }) => ({
            left: position.x - 20,
            top: position.y - 40,
            right: position.x + 20,
            bottom: position.y + 30,
          }),
        },
      ],
      FALL: [
        {
          direction: Direction.LEFT,
          source: './images/kenji/Fall.png',
          scale: 2,
          framesCount: 2,
          repeatAnimation: 1,
          // offset: { left: 80, top: 75, right: 75, bottom: 70 },
          getHitArea: ({ position }) => ({
            left: position.x - 20,
            top: position.y - 40,
            right: position.x + 20,
            bottom: position.y + 30,
          }),
        },
      ],
      MOVE: [
        {
          direction: Direction.LEFT,
          source: './images/kenji/Run.png',
          scale: 2,
          framesCount: 8,
          repeatAnimation: 0,
          // offset: { left: 80, top: 75, right: 75, bottom: 70 },
          getHitArea: ({ position }) => ({
            left: position.x - 20,
            top: position.y - 40,
            right: position.x + 20,
            bottom: position.y + 30,
          }),
        },
      ],
      HIT: [
        {
          direction: Direction.LEFT,
          source: './images/kenji/Take Hit.png',
          scale: 2,
          framesCount: 3,
          repeatAnimation: 1,
          // offset: { left: 80, top: 75, right: 75, bottom: 70 },
          getHitArea: ({ position }) => ({
            left: position.x - 20,
            top: position.y - 40,
            right: position.x + 20,
            bottom: position.y + 30,
          }),
        },
      ],
      ATTACK: [
        {
          direction: Direction.LEFT,
          source: './images/kenji/Attack1.png',
          scale: 2,
          framesCount: 4,
          repeatAnimation: 1,
          // offset: { left: 80, top: 75, right: 75, bottom: 70 },
          getHitArea: ({ position }) => ({
            left: position.x - 20,
            top: position.y - 40,
            right: position.x + 20,
            bottom: position.y + 30,
          }),
          getAttackArea: ({ position, framesCurrent, sprite }) => {
            if (framesCurrent === 1)
              return {
                left: position.x - 20 * (sprite.reversed() ? -1 : 1),
                right: position.x + 140 * (sprite.reversed() ? -1 : 1),
                top: position.y - 90,
                bottom: position.y + 30,
              };
          },
        },
        {
          direction: Direction.LEFT,
          source: './images/kenji/Attack2.png',
          scale: 2,
          framesCount: 4,
          repeatAnimation: 1,
          // offset: { left: 80, top: 75, right: 75, bottom: 70 },
          getHitArea: ({ position }) => ({
            left: position.x - 20,
            top: position.y - 40,
            right: position.x + 20,
            bottom: position.y + 30,
          }),
          getAttackArea: ({ position, framesCurrent, sprite }) => {
            if (framesCurrent === 1)
              return {
                left: position.x - 20 * (sprite.reversed() ? -1 : 1),
                right: position.x + 120 * (sprite.reversed() ? -1 : 1),
                top: position.y - 90,
                bottom: position.y + 30,
              };
          },
        },
      ],
    },
  );
