import Sprite from '../Sprite.ts';

export const create = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) =>
  new Sprite(canvas, context, {
    imageAttr: {
      source: './images/background.png',
      size: { width: canvas.width, height: canvas.height },
    },
  });
