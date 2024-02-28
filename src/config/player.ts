import { Character } from '../Character.ts';
import { Direction } from '../enums/Direction.ts';

export const create = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, healthIndicator?: HTMLElement) =>
  new Character(
    canvas,
    context,
    {
      name: 'player',
      position: { x: canvas.width / 4 - 70 / 2, y: 50 },
      healthIndicator: healthIndicator,
    },
    {
      IDLE: [
        {
          direction: Direction.RIGHT,
          source: './images/samuraiMack/Idle.png',
          scale: 2,
          framesCount: 8,
          repeatAnimation: 0,
          // offset: { left: 70, top: 70, right: 80, bottom: 75 },
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
          direction: Direction.RIGHT,
          source: './images/samuraiMack/Jump.png',
          scale: 2,
          framesCount: 2,
          repeatAnimation: 1,
          // offset: { left: 70, top: 70, right: 80, bottom: 75 },
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
          direction: Direction.RIGHT,
          source: './images/samuraiMack/Fall.png',
          scale: 2,
          framesCount: 2,
          repeatAnimation: 1,
          // offset: { left: 70, top: 70, right: 80, bottom: 75 },
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
          direction: Direction.RIGHT,
          source: './images/samuraiMack/Run.png',
          scale: 2,
          framesCount: 8,
          repeatAnimation: 0,
          // offset: { left: 70, top: 70, right: 80, bottom: 75 },
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
          direction: Direction.RIGHT,
          source: './images/samuraiMack/Take Hit - white silhouette.png',
          scale: 2,
          framesCount: 4,
          repeatAnimation: 1,
          // offset: { left: 70, top: 70, right: 80, bottom: 75 },
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
          direction: Direction.RIGHT,
          source: './images/samuraiMack/Attack1.png',
          scale: 2,
          framesCount: 6,
          repeatAnimation: 1,
          animationDuration: 500,
          // offset: { left: 70, top: 20, right: 0, bottom: 75 },
          getHitArea: ({ position, framesCurrent, sprite }) => {
            const body = {
              left: position.x - 20 * (sprite.reversed() ? -1 : 1),
              top: position.y - 40,
              right: position.x + 20 * (sprite.reversed() ? -1 : 1),
              bottom: position.y + 30,
            };
            if (framesCurrent === 0)
              return {
                ...body,
                left: body.left - 10 * (sprite.reversed() ? -1 : 1),
                right: body.right - 10 * (sprite.reversed() ? -1 : 1),
              };
            if (framesCurrent === 1)
              return {
                ...body,
                left: body.left - 15 * (sprite.reversed() ? -1 : 1),
                right: body.right - 10 * (sprite.reversed() ? -1 : 1),
              };
            if (framesCurrent === 2)
              return {
                ...body,
                left: body.left - 5 * (sprite.reversed() ? -1 : 1),
                right: body.right - 5 * (sprite.reversed() ? -1 : 1),
              };
            if (framesCurrent === 3) return body;
            if (framesCurrent === 4)
              return {
                ...body,
                left: body.left + 10 * (sprite.reversed() ? -1 : 1),
                right: body.right + 40 * (sprite.reversed() ? -1 : 1),
              };
            if (framesCurrent === 5)
              return {
                ...body,
                left: body.left + 20 * (sprite.reversed() ? -1 : 1),
                right: body.right + 40 * (sprite.reversed() ? -1 : 1),
              };
          },
          getAttackArea: ({ position, framesCurrent, sprite }) => {
            if (framesCurrent === 4)
              return {
                left: position.x - 20 * (sprite.reversed() ? -1 : 1),
                right: position.x + 170 * (sprite.reversed() ? -1 : 1),
                top: position.y - 90,
                bottom: position.y + 30,
              };
            if (framesCurrent === 5)
              return {
                left: position.x - 20 * (sprite.reversed() ? -1 : 1),
                right: position.x + 170 * (sprite.reversed() ? -1 : 1),
                top: position.y - 90,
                bottom: position.y - 30,
              };
          },
        },
        {
          direction: Direction.RIGHT,
          source: './images/samuraiMack/Attack2.png',
          scale: 2,
          framesCount: 6,
          repeatAnimation: 1,
          // offset: { left: 70, top: 70, right: 0, bottom: 75 },
          getHitArea: ({ position, framesCurrent, sprite }) => {
            const body = {
              left: position.x - 20 * (sprite.reversed() ? -1 : 1),
              top: position.y - 40,
              right: position.x + 20 * (sprite.reversed() ? -1 : 1),
              bottom: position.y + 30,
            };
            if (framesCurrent === 0)
              return {
                ...body,
                left: body.left - 10 * (sprite.reversed() ? -1 : 1),
                right: body.right - 10 * (sprite.reversed() ? -1 : 1),
              };
            if (framesCurrent === 1)
              return {
                ...body,
                left: body.left - 15 * (sprite.reversed() ? -1 : 1),
                right: body.right - 10 * (sprite.reversed() ? -1 : 1),
              };
            if (framesCurrent === 2)
              return {
                ...body,
                left: body.left - 5 * (sprite.reversed() ? -1 : 1),
                right: body.right - 5 * (sprite.reversed() ? -1 : 1),
              };
            if (framesCurrent === 4)
              return {
                ...body,
                left: body.left + 10 * (sprite.reversed() ? -1 : 1),
                right: body.right + 30 * (sprite.reversed() ? -1 : 1),
              };
            if (framesCurrent === 5)
              return {
                ...body,
                left: body.left + 20 * (sprite.reversed() ? -1 : 1),
                right: body.right + 40 * (sprite.reversed() ? -1 : 1),
              };
            return body;
          },
          getAttackArea: ({ position, framesCurrent, sprite }) => {
            if (framesCurrent === 4)
              return {
                left: position.x - 20 * (sprite.reversed() ? -1 : 1),
                right: position.x + 170 * (sprite.reversed() ? -1 : 1),
                top: position.y - 90,
                bottom: position.y + 30,
              };
            if (framesCurrent === 5)
              return {
                left: position.x - 20 * (sprite.reversed() ? -1 : 1),
                right: position.x + 170 * (sprite.reversed() ? -1 : 1),
                top: position.y - 40,
                bottom: position.y + 10,
              };
          },
        },
      ],
    },
  );
