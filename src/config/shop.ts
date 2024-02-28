import Sprite from '../Sprite.ts';
import { CoordinateBasis } from '../enums/CoordinateBasis.ts';

export const create = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) =>
  new Sprite(canvas, context, {
    coordinateBasis: CoordinateBasis.RIGHT_BOTTOM,
    position: { x: 100, y: 95 },
    imageAttr: {
      source: './images/shop.png',
      scale: 2.5,
      framesCount: 6,
    },
  });
