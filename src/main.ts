import { GAME_WIDTH, GAME_HEIGHT } from './constants';
import { Game } from './Game';

const gameBox = document.querySelector('.game-box') as HTMLElement | null;
if (gameBox) {
  gameBox.style.width = `${GAME_WIDTH}px`;
  gameBox.style.height = `${GAME_HEIGHT}px`;
}

const canvas = document.getElementById('canvas');
if (!(canvas instanceof HTMLCanvasElement)) throw new Error('canvas not found');
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

const context = canvas.getContext('2d');
if (!context) throw new Error('context not found');

const startScreen = document.getElementById('start-screen');
const timer = document.getElementById('timer');
const playerHealth = document.getElementById('player-health');
const enemyHealth = document.getElementById('enemy-health');

const game = new Game(canvas, context, startScreen || undefined, timer || undefined, playerHealth || undefined, enemyHealth || undefined);
setTimeout(() => game.setup(), 100);
