import { TIME_LIMIT } from './constants';
import Sprite from './Sprite';
import { set as setProperty } from './properties';
import { Character } from './Character';
import { CoordinateBasis } from './enums/CoordinateBasis';
import { Direction } from './enums/Direction';

type Elements = {
  indicatorContainer?: HTMLElement;
  startScreen?: HTMLElement;
  timer?: HTMLElement;
  playerHealth?: HTMLElement;
  enemyHealth?: HTMLElement;
};

export class Game {
  startedAt?: number;
  timer?: number;
  elements: Elements = {
    indicatorContainer: undefined,
    startScreen: undefined,
    timer: undefined,
    playerHealth: undefined,
    enemyHealth: undefined,
  };
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  player?: Character;
  enemy?: Character;
  background: Sprite;
  shop: Sprite;
  animation?: () => void;
  animationBackground?: () => void;

  keydownEvents = (event: KeyboardEvent) => {
    // console.log('keydown', event.code)
    if (event.code === 'KeyW') {
      this.player?.jump();
    } else if (event.code === 'KeyD') {
      this.player?.moveRight();
    } else if (event.code === 'KeyA') {
      this.player?.moveLeft();
    } else if (event.code === 'Space') {
      this.player?.attack();
    }
  };

  keyupEvents = (event: KeyboardEvent) => {
    // console.log('keyup', event.code)
    if (event.code === 'KeyD' || event.code === 'KeyA') {
      this.player?.stopMove();
    }
  };

  constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, elements: Elements) {
    for (const key in elements) if ((elements as any)[key]) (this.elements as any)[key] = (elements as any)[key];
    this.canvas = canvas;
    this.context = context;

    window.addEventListener('keydown', event => {
      if (event.code === 'Space') {
        if (!this.startedAt) this.start();
      }
    });

    this.background = new Sprite(this.canvas, this.context, {
      imageAttr: {
        source: './images/background.png',
        size: { width: this.canvas.width, height: this.canvas.height },
      },
    });
    this.shop = new Sprite(this.canvas, this.context, {
      coordinateBasis: CoordinateBasis.RIGHT_BOTTOM,
      position: { x: 100, y: 100 },
      imageAttr: {
        source: './images/shop.png',
        scale: 2.5,
        framesCount: 6,
      },
    });

    this.animation = this.animate.bind(this);
    this.animationBackground = this.animateBackground.bind(this);
  }

  setup() {
    this.player = new Character(
      this.canvas,
      this.context,
      {
        name: 'player',
        position: { x: this.canvas.width / 4 - 70 / 2, y: 50 },
        healthIndicator: this.elements.playerHealth,
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
    this.enemy = new Character(
      this.canvas,
      this.context,
      {
        name: 'enemy',
        position: { x: (this.canvas.width / 4) * 3 - 70 / 2, y: 50 },
        healthIndicator: this.elements.enemyHealth,
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
    this.player.setEnemy(this.enemy);
    this.enemy.setEnemy(this.player);
  }

  setupKeyEvents() {
    window.addEventListener('keydown', this.keydownEvents);
    window.addEventListener('keyup', this.keyupEvents);
  }

  clearKeyEvents() {
    window.removeEventListener('keydown', this.keydownEvents);
    window.removeEventListener('keyup', this.keyupEvents);
  }

  startTimer() {
    this.startedAt = Date.now();
    if (this.elements.timer) setProperty(this.elements.timer, '--time', TIME_LIMIT + '');

    this.timer = setInterval(() => {
      let timeLeft = TIME_LIMIT - Math.floor((Date.now() - (this.startedAt ?? 0)) / 1000);
      if (timeLeft <= 0) {
        timeLeft = 0;
        clearInterval(this.timer);
        this.judgeWinner();
        this.endGame();
      }
      if (this.elements.timer) this.elements.timer.innerText = timeLeft + '';
    }, 100);
  }

  judgeWinner() {
    if (!this.player || !this.enemy) return;

    if (this.player.health > this.enemy.health) {
      console.log('player win');
    } else if (this.player.health < this.enemy.health) {
      console.log('enemy win');
    } else {
      console.log('draw');
    }
  }

  start() {
    this.elements.indicatorContainer?.classList.remove('hidden');
    this.elements.startScreen?.classList.add('hidden');
    this.setup();
    this.setupKeyEvents();
    this.startTimer();
    this.animate();
  }

  endGame() {
    this.elements.indicatorContainer?.classList.add('hidden');
    this.elements.startScreen?.classList.remove('hidden');
    this.clearKeyEvents();
    this.startedAt = undefined;
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    if (this.elements.timer) this.elements.timer.innerText = '';
    console.log('end game');
  }

  isFinished() {
    if (!this.player) return true;
    return this.player.health <= 0 || (this.enemy && this.enemy.health <= 0);
  }

  animate() {
    if (!this.startedAt) return;

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.background.update();
    this.shop.update();
    this.player?.update();
    this.enemy?.update();

    if (this.isFinished()) {
      this.judgeWinner();
      this.endGame();
    }

    this.animation && window.requestAnimationFrame(this.animation);
  }

  animateBackground() {
    this.background.update();
    this.shop.update();

    this.animationBackground && window.requestAnimationFrame(this.animationBackground);
  }
}
