import { Direction } from './enums/Direction';
import { CoordinateBasis } from './enums/CoordinateBasis';
import { Position, ImageOffset, ImageSize, ImageAttr } from './types';

export default class Sprite {
  direction = Direction.LEFT;
  framesCurrent = 0;
  canvas;
  context;
  position;
  coordinateBasis;
  image;
  animatedAt = new Date().getTime();
  imageAttr = {
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
  } as ImageAttr;

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
    this.image = new Image();
    this.setImage(imageAttr);
  }

  setImage(imageAttr: Partial<ImageAttr>) {
    if (imageAttr.source === undefined) throw new Error('Image source is required');
    this.image.src = imageAttr.source;
    this.framesCurrent = 0;
    this.animatedAt = new Date().getTime();
    for (const key in imageAttr) if ((imageAttr as any)[key]) (this.imageAttr as any)[key] = (imageAttr as any)[key];
  }

  imageWidth(frame?: ImageOffset) {
    const imageOffset = frame || this.imageAttr.frameClipper(this.image, this.imageAttr, this.framesCurrent);
    return imageOffset.right - imageOffset.left;
  }

  imageHeight(frame?: ImageOffset) {
    const imageOffset = frame || this.imageAttr.frameClipper(this.image, this.imageAttr, this.framesCurrent);
    return imageOffset.bottom - imageOffset.top;
  }

  drawingWidth(frame?: ImageOffset) {
    return this.imageAttr.size?.width || this.imageWidth(frame) * this.imageAttr.scale;
  }

  drawingHeight(frame?: ImageOffset) {
    return this.imageAttr.size?.height || this.imageHeight(frame) * this.imageAttr.scale;
  }

  x(frame?: ImageOffset) {
    const drawingWidth = this.drawingWidth(frame);
    if (this.coordinateBasis === CoordinateBasis.CENTER) return this.position.x - drawingWidth / 2;
    if (this.coordinateBasis === CoordinateBasis.RIGHT_BOTTOM || this.coordinateBasis === CoordinateBasis.RIGHT_TOP) return this.canvas.width - this.position.x - drawingWidth;
    return this.position.x;
  }

  y(frame?: ImageOffset) {
    const drawingHeight = this.drawingHeight(frame);
    if (this.coordinateBasis === CoordinateBasis.CENTER) return this.position.y - drawingHeight / 2;
    if (this.coordinateBasis === CoordinateBasis.RIGHT_BOTTOM || this.coordinateBasis === CoordinateBasis.LEFT_BOTTOM) return this.canvas.height - this.position.y - drawingHeight;
    return this.position.y;
  }

  reversed() {
    return this.direction !== this.imageAttr.direction;
  }

  draw() {
    const frame = this.imageAttr.frameClipper(this.image, this.imageAttr, this.framesCurrent);
    const imageWidth = this.imageWidth(frame);
    const imageHeight = this.imageHeight(frame);
    const x = this.x(frame);
    const y = this.y(frame);
    const drawingWidth = this.drawingWidth(frame);
    const drawingHeight = this.drawingHeight(frame);
    const reversed = this.reversed();

    if (this.image.src.indexOf('samuraiMack') !== -1 || this.image.src.indexOf('kenji') !== -1) {
      // this.context.fillStyle = 'black';
      // this.context.fillRect(x, y, drawingWidth, drawingHeight);
      // console.log('sprite direction', { coordinateBasis: this.coordinateBasis, direction: this.direction, reversed });
      // console.log('draw box', { imageWidth, imageHeight, x, y, drawingWidth, drawingHeight });
    }

    this.context.save();
    if (reversed) this.context.scale(-1, 1);
    this.context.drawImage(this.image, frame.left, frame.top, imageWidth, imageHeight, reversed ? -x : x, y, reversed ? -drawingWidth : drawingWidth, drawingHeight);
    if (reversed) this.context.restore();
  }

  update() {
    this.draw();

    if (this.imageAttr.framesCount > 1) {
      const now = new Date().getTime();
      const timePassed = now - this.animatedAt;

      if (this.imageAttr.repeatAnimation > 0 && timePassed > this.imageAttr.animationDuration * this.imageAttr.repeatAnimation) {
        this.framesCurrent = 0;
      } else {
        const framePassed = timePassed % this.imageAttr.animationDuration;
        this.framesCurrent = Math.floor(framePassed / (this.imageAttr.animationDuration / this.imageAttr.framesCount));
      }
    }
  }
}
