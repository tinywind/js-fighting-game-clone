import { Direction } from './enums/Direction';
import { CoordinateBasis } from './enums/CoordinateBasis';
import { Position, ImageOffset, ImageSize, ImageAttr } from './types';

const defaultImageAttr = {
  framesCount: 1,
  animationDuration: 1000,
  repeatAnimation: 0,
  direction: Direction.LEFT,
  offset: { left: 0, top: 0, right: 0, bottom: 0 },
  scale: 1,
  frameClipper: (size: ImageSize, attr: ImageAttr, frame: number) => ({
    left: (size.width / attr.framesCount) * frame + attr.offset.left,
    right: (size.width / attr.framesCount) * (frame + 1) - attr.offset.right,
    top: attr.offset.top,
    bottom: size.height - attr.offset.bottom,
  }),
};

type Effector = (sprite: Sprite, value: number) => number;

const defaultEffectorValue: Effector = (_: Sprite, value: number) => value;
const defaultEffector = {
  X: defaultEffectorValue,
  Y: defaultEffectorValue,
  WIDTH: defaultEffectorValue,
  HEIGHT: defaultEffectorValue,
};

export default class Sprite {
  direction = Direction.LEFT;
  framesCurrent = 0;
  canvas;
  context;
  position;
  coordinateBasis;
  imageElement = new Image();
  animatedAt = new Date().getTime();
  imageAttr: ImageAttr = { ...defaultImageAttr, source: '' };
  origin: { size?: ImageSize; scale: number } = { scale: 1 };
  effector: Record<'X' | 'Y' | 'WIDTH' | 'HEIGHT', Effector> = defaultEffector;

  constructor(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    {
      position,
      coordinateBasis,
      imageAttr,
    }: {
      position?: Position;
      coordinateBasis?: CoordinateBasis;
      imageAttr: Partial<ImageAttr>;
    },
  ) {
    this.canvas = canvas;
    this.context = context;
    this.position = position || { x: 0, y: 0 };
    this.coordinateBasis = coordinateBasis || CoordinateBasis.LEFT_TOP;
    this.setImage(imageAttr);
  }

  setImage(imageAttr: Partial<ImageAttr>) {
    if (imageAttr.source === undefined) throw new Error('Image source is required');
    this.imageElement.src = imageAttr.source;
    // console.log('setImage(imageAttr: Partial<ImageAttr>)');
    this.framesCurrent = 0;
    this.animatedAt = new Date().getTime();

    this.imageAttr = { ...defaultImageAttr, source: imageAttr.source! };
    for (const key in imageAttr) if ((imageAttr as any)[key] !== undefined && (imageAttr as any)[key] !== null) (this.imageAttr as any)[key] = (imageAttr as any)[key];
    this.origin = { size: this.imageAttr.size, scale: this.imageAttr.scale };
  }

  resetEffector() {
    this.effector = defaultEffector;
  }

  imageWidth(frame?: ImageOffset): number {
    const imageOffset = frame || this.imageAttr.frameClipper(this.imageElement, this.imageAttr, this.framesCurrent);
    return imageOffset.right - imageOffset.left;
  }

  imageHeight(frame?: ImageOffset): number {
    const imageOffset = frame || this.imageAttr.frameClipper(this.imageElement, this.imageAttr, this.framesCurrent);
    return imageOffset.bottom - imageOffset.top;
  }

  drawingWidth(frame?: ImageOffset): number {
    const get = () => this.imageAttr.size?.width || this.imageWidth(frame) * this.imageAttr.scale;
    return this.effector.WIDTH(this, get());
  }

  drawingHeight(frame?: ImageOffset): number {
    const get = () => this.imageAttr.size?.height || this.imageHeight(frame) * this.imageAttr.scale;
    return this.effector.HEIGHT(this, get());
  }

  x(frame?: ImageOffset): number {
    const get = (value: number) => {
      const drawingWidth = this.drawingWidth(frame);
      if (this.coordinateBasis === CoordinateBasis.CENTER) return value - drawingWidth / 2;
      if (this.coordinateBasis === CoordinateBasis.RIGHT_BOTTOM || this.coordinateBasis === CoordinateBasis.RIGHT_TOP) return this.canvas.width - value - drawingWidth;
      return value;
    };
    return get(this.effector.X(this, this.position.x));
  }

  y(frame?: ImageOffset): number {
    const get = (value: number) => {
      const drawingHeight = this.drawingHeight(frame);
      if (this.coordinateBasis === CoordinateBasis.CENTER) return value - drawingHeight / 2;
      if (this.coordinateBasis === CoordinateBasis.RIGHT_BOTTOM || this.coordinateBasis === CoordinateBasis.LEFT_BOTTOM) return this.canvas.height - value - drawingHeight;
      return value;
    };
    return get(this.effector.Y(this, this.position.y));
  }

  reversed() {
    return this.direction !== this.imageAttr.direction;
  }

  draw() {
    const frame = this.imageAttr.frameClipper(this.imageElement, this.imageAttr, this.framesCurrent);
    const imageWidth = this.imageWidth(frame);
    const imageHeight = this.imageHeight(frame);
    const x = this.x(frame);
    const y = this.y(frame);
    const drawingWidth = this.drawingWidth(frame);
    const drawingHeight = this.drawingHeight(frame);
    const reversed = this.reversed();

    this.context.save();
    if (reversed) this.context.scale(-1, 1);
    this.context.drawImage(this.imageElement, frame.left, frame.top, imageWidth, imageHeight, reversed ? -x : x, y, reversed ? -drawingWidth : drawingWidth, drawingHeight);
    if (reversed) this.context.restore();

    if (this.imageElement.src.indexOf('samuraiMack') !== -1 || this.imageElement.src.indexOf('kenji') !== -1) {
      // this.context.fillStyle = 'black';
      // this.context.fillRect(x, y, drawingWidth, drawingHeight);
    }
  }

  update() {
    this.draw();

    if (this.imageAttr.framesCount > 1) {
      const now = new Date().getTime();
      const timePassed = now - this.animatedAt;

      if (this.imageAttr.repeatAnimation > 0 && timePassed > this.imageAttr.animationDuration * this.imageAttr.repeatAnimation) {
        // console.log('this.imageAttr.repeatAnimation > 0 && timePassed > this.imageAttr.animationDuration * this.imageAttr.repeatAnimation');
        this.framesCurrent = 0;
      } else {
        const framePassed = timePassed % this.imageAttr.animationDuration;
        this.framesCurrent = Math.floor(framePassed / (this.imageAttr.animationDuration / this.imageAttr.framesCount));
      }
    }
  }
}
