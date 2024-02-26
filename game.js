import {setCustomProperty} from './updateCustomProperty.js';

const startScreen = document.getElementById('start-screen');

const GAME_WIDTH = 1024;
const GAME_HEIGHT = 576;
const BOTTOM_PADDING = 90;

document.querySelectorAll('.game-box').forEach(e => {
    e.style.width = `${GAME_WIDTH}px`;
    e.style.height = `${GAME_HEIGHT}px`;
})

class Sprite {
    direction = 'LEFT';
    framesCurrent = 0;
    framesElapsed = 0;
    framesDuration = 10;

    /**
     * @coordinateBasis 'LEFT_TOP' | 'RIGHT_TOP' | 'LEFT_BOTTOM' | 'RIGHT_BOTTOM'
     */
    constructor(canvas, context, {position, coordinateBasis, size, image}) {
        this.canvas = canvas;
        this.context = context;
        this.position = position || {x: 0, y: 0};
        this.coordinateBasis = coordinateBasis || 'LEFT_TOP';
        this.size = size;
        this.image = new Image();
        this.image.src = image.source;
        this.framesCount = image.framesCount || 1;
        this.imageDirection = image.direction || 'LEFT';
        this.imageOffset = image.offset || {left: 0, top: 0, right: 0, bottom: 0};
        this.imageScale = image.scale || 1;
    }

    width() {
        return this.image.width / this.framesCount - this.imageOffset.left - this.imageOffset.right;
    }

    height() {
        return this.image.height - this.imageOffset.top - this.imageOffset.bottom;
    }

    x() {
        return this.coordinateBasis === 'RIGHT_BOTTOM' || this.coordinateBasis === 'RIGHT_TOP' ? this.canvas.width - this.position.x - this.width() * this.imageScale : this.position.x
    }

    y() {
        return this.coordinateBasis === 'RIGHT_BOTTOM' || this.coordinateBasis === 'LEFT_BOTTOM' ? this.canvas.height - this.position.y - this.height() * this.imageScale : this.position.y
    }

    drawWidth() {
        return this.size?.width || this.width() * this.imageScale;
    }

    drawHeight() {
        return this.size?.height || this.height() * this.imageScale;
    }

    draw() {
        const width = this.width();
        const height = this.height();
        const x = this.x();
        const y = this.y();
        const drawWidth = this.drawWidth();
        const drawHeight = this.drawHeight();
        const reversed = this.direction !== this.imageDirection;

        if (this.image.src.indexOf('samuraiMack') !== -1 || this.image.src.indexOf('kenji') !== -1) {
            // this.context.fillStyle = 'black';
            // this.context.fillRect(x, y, drawWidth, drawHeight);
            // console.log('draw', { coordinateBasis: this.coordinateBasis, direction: this.direction, width, height, x, y, drawWidth, drawHeight, reversed });
        }

        if (reversed) {
            this.context.save();
            this.context.scale(-1, 1);
        }

        this.context.drawImage(
            this.image,
            this.image.width / this.framesCount * this.framesCurrent + this.imageOffset.left,
            this.imageOffset.top,
            width,
            height,
            reversed ? -x : x,
            y,
            reversed ? -drawWidth : drawWidth,
            drawHeight
        );

        if (reversed) {
            this.context.restore();
        }
    }

    update() {
        this.draw();
        this.framesElapsed += 1;

        if (this.framesElapsed % this.framesDuration) return;
        this.framesElapsed = 0;
        this.framesCurrent = (this.framesCurrent + 1) % this.framesCount;
    }
}

class MovingSprite extends Sprite {
    GRAVITY = 0.25;
    velocity = {x: 0, y: 0};

    constructor(canvas, context, {position, coordinateBasis, size, image}) {
        super(canvas, context, {position, coordinateBasis, size, image});
        this.BOTTOM_THRESHOLD = this.canvas.height - BOTTOM_PADDING;
    }

    isJumping() {
        return this.position.y + this.drawHeight() < this.BOTTOM_THRESHOLD;
    }

    update() {
        this.draw();

        const width = this.width() * this.imageScale;
        const height = this.height() * this.imageScale;

        if (this.position.y + height + this.velocity.y > this.BOTTOM_THRESHOLD) {
            // console.log('stop jumping', this.position.y, height, this.velocity.y, this.BOTTOM_THRESHOLD)
            this.velocity.x = 0;
            this.velocity.y = 0;
            this.position.y = this.BOTTOM_THRESHOLD - height;
        } else if (this.isJumping()) {
            this.velocity.y += this.GRAVITY;
        }

        if (this.position.x + width + this.velocity.x > this.canvas.width || this.position.x + this.velocity.x < 0) {
            this.velocity.x = 0;
        }

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Character extends MovingSprite {
    ATTACK_DELAY = 100;
    ATTACK_KEEP_MS = 1000;
    ATTACK_DAMAGE = 20;
    FULL_HEALTH = 100;

    attackedAt = null;
    lastAttackedAt = null;
    health = this.FULL_HEALTH;
    lastGetAttackId = null; // attackedAt

    /**
     * @attackRect function ({position, scale, velocity, direction}) => {x, y, width, height}
     */
    constructor(canvas, context, {
        name,
        position,
        coordinateBasis,
        size,
        image,
        hitRect,
        attackRect,
        healthIndicator
    }) {
        super(canvas, context, {position, coordinateBasis, size, image});
        this.name = name;
        this.hitRect = hitRect;
        this.attackRect = attackRect;
        this.healthIndicator = healthIndicator;
    }

    setEnemy(enemy) {
        this.enemy = enemy;
    }

    jump() {
        if (this.isJumping()) return;
        this.velocity.y = -10;
        this.finishAttack();
    }

    moveRight() {
        if (this.isJumping()) return;
        this.velocity.x = 5;
    }

    moveLeft() {
        if (this.isJumping()) return;
        this.velocity.x = -5;
    }

    stopMove() {
        if (this.isJumping()) return;
        this.velocity.x = 0;
    }

    isTriggeredAttack() {
        return this.attackedAt
    }

    isAttacking() {
        return this.isTriggeredAttack()
            && Date.now() - this.attackedAt > this.ATTACK_DELAY
            && Date.now() - this.attackedAt < this.ATTACK_KEEP_MS
    }

    isFinishedAttack() {
        return this.isTriggeredAttack()
            && Date.now() - this.attackedAt > this.ATTACK_KEEP_MS
    }

    finishAttack() {
        this.attackedAt = null;
    }

    attack() {
        if (this.isTriggeredAttack()) return;
        this.lastAttackedAt = this.attackedAt = Date.now();
    }

    getDamage(attackId, damage) {
        if (this.lastGetAttackId === attackId) return;

        this.lastGetAttackId = attackId;
        this.health -= damage;

        if (this.health < 0) this.health = 0;
        // console.log(this.health / this.FULL_HEALTH * 100, `${this.name} get damage ${damage}, current health: ${this.health}`);
        setCustomProperty(this.healthIndicator, '--var', (this.health / this.FULL_HEALTH) * 100 + '%');

        if (this.health <= 0) {
            console.log(`${this.name} is dead`);
        }
    }

    draw() {
        super.draw();

        if (this.isAttacking()) {
            this.context.fillStyle = 'blue';
            const attackRect = this.attackRect(this);
            this.context.fillRect(attackRect.x, attackRect.y, attackRect.width, attackRect.height);
        }
    }

    update() {
        const isJumping = this.isJumping();

        super.update();

        if (this.enemy) {
            this.direction = this.enemy.position.x > this.position.x ? 'RIGHT' : 'LEFT';

            if (this.isAttacking()) {
                const hitRect = this.enemy.hitRect(this.enemy);
                const attackRect = this.attackRect(this);

                // console.log('attack', attackRect, hitRect)
                if (attackRect.x < hitRect.x + hitRect.width
                    && attackRect.x + attackRect.width > hitRect.x
                    && attackRect.y < hitRect.y + hitRect.height
                    && attackRect.y + attackRect.height > hitRect.y) {
                    // console.log(`hit ${this.name} > ${this.enemy.name}`);
                    this.enemy.getDamage(this.lastAttackedAt, this.ATTACK_DAMAGE);
                }
            }
        }

        if (this.isFinishedAttack()) {
            this.finishAttack();
        }

        if (isJumping && !this.isJumping()) {
            this.finishAttack();
        }
    }
}

class Game {
    TIME_LIMIT = 100;
    startedAt = null;
    timer = null;

    constructor(timerElement) {
        this.timerElement = timerElement;
        this.canvas = document.getElementById('canvas');
        this.context = this.canvas.getContext('2d');
        this.canvas.width = GAME_WIDTH;
        this.canvas.height = GAME_HEIGHT;

        window.addEventListener('keydown', event => {
            if (event.code === 'Space') {
                if (!this.startedAt)
                    this.start();
            }
        });
    }

    getHitRect = (character) => {
        const width = character.drawWidth();
        const height = character.drawHeight();
        return {
            x: character.x() + width / 4,
            y: character.y() + height / 4,
            width: width / 2,
            height: height / 2
        };
    }

    getAttackRect = (character) => {
        const attachRange = 100;
        const width = character.drawWidth();
        const height = character.drawHeight();
        return {
            x: character.x() + (character.direction === 'RIGHT' ? width : -attachRange),
            y: character.y() + height / 4,
            width: attachRange,
            height: height / 4
        };
    }

    keydownEvents = (event) => {
        // console.log('keydown', event.code)
        if (event.code === 'KeyW') {
            this.player.jump();
        } else if (event.code === 'KeyD') {
            this.player.moveRight();
        } else if (event.code === 'KeyA') {
            this.player.moveLeft();
        } else if (event.code === 'Space') {
            this.player.attack();
        }
    }

    keyupEvents = (event) => {
        // console.log('keyup', event.code)
        if (event.code === 'KeyD' || event.code === 'KeyA') {
            this.player.stopMove();
        }
    }

    setup() {
        this.background = new Sprite(this.canvas, this.context, {
            size: {width: this.canvas.width, height: this.canvas.height},
            image: {source: './images/background.png',},
        });
        this.shop = new Sprite(this.canvas, this.context, {
            coordinateBasis: 'RIGHT_BOTTOM',
            position: {x: 100, y: BOTTOM_PADDING},
            image: {
                source: './images/shop.png',
                scale: 2.5,
                framesCount: 6,
            },
        });
        this.player = new Character(this.canvas, this.context, {
            name: 'player',
            position: {x: this.canvas.width / 4 - 70 / 2, y: 50},
            scale: 2,
            image: {
                direction: 'RIGHT',
                source: './images/samuraiMack/Idle.png',
                scale: 2,
                framesCount: 8,
                offset: {left: 70, top: 70, right: 80, bottom: 75}
            },
            hitRect: this.getHitRect,
            attackRect: this.getAttackRect,
            healthIndicator: document.getElementById('player-health')
        });
        this.enemy = new Character(this.canvas, this.context, {
            name: 'enemy',
            position: {x: this.canvas.width / 4 * 3 - 70 / 2, y: 50},
            scale: 2,
            image: {
                direction: 'LEFT',
                source: './images/kenji/Idle.png',
                scale: 2,
                framesCount: 4,
                offset: {left: 80, top: 75, right: 75, bottom: 70}
            },
            hitRect: this.getHitRect,
            attackRect: this.getAttackRect,
            healthIndicator: document.getElementById('enemy-health')
        });
        this.player.setEnemy(this.enemy);
        this.enemy.setEnemy(this.player);
        this.background.draw();
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
        setCustomProperty(this.timerElement, '--time', this.TIME_LIMIT);

        this.timer = setInterval(() => {
            let timeLeft = this.TIME_LIMIT - Math.floor((Date.now() - this.startedAt) / 1000);
            if (timeLeft <= 0) {
                timeLeft = 0;
                clearInterval(this.timer);
                this.judgeWinner();
                this.endGame();
            }
            this.timerElement.innerText = timeLeft;
        }, 100);
    }

    judgeWinner() {
        if (this.player.health > this.enemy.health) {
            console.log('player win');
        } else if (this.player.health < this.enemy.health) {
            console.log('enemy win');
        } else {
            console.log('draw');
        }
    }

    start() {
        startScreen.classList.add('hidden');
        this.setup();
        this.setupKeyEvents();
        this.animation = this.animate.bind(this);
        this.startTimer();
        this.animate();
    }

    endGame() {
        startScreen.classList.remove('hidden');
        this.clearKeyEvents();
        this.startedAt = null;
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
        this.timerElement.innerText = '';
        console.log('end game');
    }

    isFinished() {
        return this.player.health <= 0 || (this.enemy && this.enemy.health <= 0);
    }

    animate() {
        if (!this.startedAt) return;

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.background.update();
        this.shop.update();
        this.player.update();
        this.enemy.update();
        window.requestAnimationFrame(this.animation);
        if (this.isFinished()) {
            this.judgeWinner();
            this.endGame();
        }
    }
}

window.game = new Game(document.getElementById('timer'));
