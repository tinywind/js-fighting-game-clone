import { CAMERA_MAX_RATE, CAMERA_MIN_RATE, GAME_HEIGHT, GAME_WIDTH, TIME_LIMIT } from './constants';
import Sprite from './Sprite';
import { set as setProperty } from './properties';
import { Character } from './Character';
import { CoordinateBasis } from './enums/CoordinateBasis';
import { create as createPlayer } from './config/player';
import { create as createEnemy } from './config/enemy';
import { create as createBackground } from './config/background';
import { create as createShop } from './config/shop';

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

    this.background = createBackground(this.canvas, this.context);
    this.shop = createShop(this.canvas, this.context);

    this.animation = this.animate.bind(this);
    this.animationBackground = this.animateBackground.bind(this);

    const effector = this.getRandomCameraMovementEffector();
    this.background.effector = effector;
    this.shop.effector = effector;

    window.addEventListener('keydown', event => {
      if (event.code === 'Space') {
        if (!this.startedAt) this.start();
      }
    });
  }

  setup() {
    this.player = createPlayer(this.canvas, this.context, this.elements.playerHealth);
    this.enemy = createEnemy(this.canvas, this.context, this.elements.enemyHealth);
    this.player.setEnemy(this.enemy);
    this.enemy.setEnemy(this.player);
  }

  getRandomCameraMovementEffector() {
    const cameraMovementStartedAt = new Date().getTime();
    const cameraMovements = [
      { origin: { x: GAME_WIDTH, y: GAME_HEIGHT }, targetRate: 1.2, duration: 2000, start: 0, end: 0 },
      { origin: { x: 0, y: 0 }, targetRate: 1, duration: 2000, start: 0, end: 0 },
      { origin: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 }, targetRate: 0.9, duration: 2000, start: 0, end: 0 },
      { origin: { x: 0, y: 0 }, targetRate: 1, duration: 2000, start: 0, end: 0 },
    ];
    const cameraLoopDuration = cameraMovements.reduce((acc, cur) => acc + cur.duration, 0);
    cameraMovements.forEach((movement, index) => {
      movement.start = cameraMovements.slice(0, index).reduce((acc, cur) => acc + cur.duration, 0);
      movement.end = cameraMovements.slice(0, index + 1).reduce((acc, cur) => acc + cur.duration, 0);
    });

    const calculateMovement = () => {
      const timePassed = (new Date().getTime() - cameraMovementStartedAt) % cameraLoopDuration;
      const movementIndex = cameraMovements.findIndex(movement => timePassed >= movement.start && timePassed < movement.end);
      const timePassedInMovement = timePassed - cameraMovements[movementIndex].start;
      const preMovementIndex = (movementIndex - 1 + cameraMovements.length) % cameraMovements.length;
      const movement = cameraMovements[movementIndex];
      const preRate = cameraMovements[preMovementIndex].targetRate;
      const rate = preRate + (movement.targetRate - preRate) * (timePassedInMovement / movement.duration);
      const origin = {
        x: movement.origin.x + (cameraMovements[preMovementIndex].origin.x - movement.origin.x) * (timePassedInMovement / movement.duration),
        y: movement.origin.y + (cameraMovements[preMovementIndex].origin.y - movement.origin.y) * (timePassedInMovement / movement.duration),
      };
      return { origin, rate };
    };

    return this.makeCameraMovementEffector(calculateMovement);
  }

  getFollowingCharactersCameraMovementEffector() {
    const calculateMovement = () => {
      if (!this.player || !this.enemy) return { origin: { x: 0, y: 0 }, rate: 1 };
      return {
        origin: { x: (this.player.position.x + this.enemy.position.x) / 2, y: (this.player.position.y + this.enemy.position.y) / 2 },
        rate: Math.max(1, Math.min((this.canvas.width / Math.abs(this.player.position.x - this.enemy.position.x)) * CAMERA_MIN_RATE, CAMERA_MAX_RATE)),
      };
    };

    return this.makeCameraMovementEffector(calculateMovement);
  }

  makeCameraMovementEffector(calculateMovement: () => { origin: { x: number; y: number }; rate: number }) {
    return {
      X: (sprite: Sprite) => {
        const { origin, rate } = calculateMovement();
        return sprite.coordinateBasis === CoordinateBasis.RIGHT_TOP || sprite.coordinateBasis === CoordinateBasis.RIGHT_BOTTOM
          ? GAME_WIDTH - GAME_WIDTH * rate + sprite.position.x * rate + (origin.x * rate - origin.x)
          : sprite.position.x * rate - (origin.x * rate - origin.x);
      },
      Y: (sprite: Sprite) => {
        const { origin, rate } = calculateMovement();
        return sprite.coordinateBasis === CoordinateBasis.LEFT_BOTTOM || sprite.coordinateBasis === CoordinateBasis.RIGHT_BOTTOM
          ? GAME_HEIGHT - GAME_HEIGHT * rate + sprite.position.y * rate + (origin.y * rate - origin.y)
          : sprite.position.y * rate - (origin.y * rate - origin.y);
      },
      WIDTH: (_: Sprite, value: number) => value * calculateMovement().rate,
      HEIGHT: (_: Sprite, value: number) => value * calculateMovement().rate,
    };
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

    const effector = this.getFollowingCharactersCameraMovementEffector();
    this.background.effector = effector;
    this.shop.effector = effector;
    if (this.player) this.player.effector = effector;
    if (this.enemy) this.enemy.effector = effector;
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

    const effector = this.getRandomCameraMovementEffector();
    this.background.effector = effector;
    this.shop.effector = effector;
    this.player?.resetEffector();
    this.enemy?.resetEffector();
  }

  isFinished() {
    if (!this.player) return true;
    return this.player.health <= 0 || (this.enemy && this.enemy.health <= 0);
  }

  clearContext() {
    this.context.fillStyle = 'black';
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  animate() {
    if (!this.startedAt) return;

    this.clearContext();
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
    this.clearContext();
    this.background.update();
    this.shop.update();

    this.animationBackground && window.requestAnimationFrame(this.animationBackground);
  }
}
