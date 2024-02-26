import {setCustomProperty} from './updateCustomProperty.js';

const startScreen = document.getElementById('start-screen');

class Sprite {
    GRAVITY = 0.2;

    constructor(canvas, context, {position, size, velocity, image}) {
        this.canvas = canvas;
        this.context = context;
        this.position = position;
        this.size = size;
        this.velocity = velocity;
        this.image = image;
    }

    isJumping() {
        return this.position.y + this.size.height < this.canvas.height;
    }

    draw() {
        this.context.fillStyle = 'red';
        this.context.fillRect(this.position.x, this.position.y, 50, 100);
        // this.context.drawImage(this.image, this.position.x, this.position.y, this.size.width, this.size.height);
    }

    update() {
        this.draw();

        if (this.position.y + this.size.height + this.velocity.y > this.canvas.height) {
            this.velocity.x = 0;
            this.velocity.y = 0;
            this.position.y = this.canvas.height - this.size.height;
        } else if (this.isJumping()) {
            this.velocity.y += this.GRAVITY;
        }

        if (this.position.x + this.size.width + this.velocity.x > this.canvas.width || this.position.x + this.velocity.x < 0) {
            this.velocity.x = 0;
        }

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Character extends Sprite {
    ATTACK_DELAY = 100;
    ATTACK_KEEP_MS = 1000;
    ATTACK_DAMAGE = 20;
    FULL_HEALTH = 100;

    direction = 'right';
    attackedAt = null;
    lastAttackedAt = null;
    health = this.FULL_HEALTH;
    lastGetAttackId = null; // attackedAt

    /*
     * @attackRect function ({position, size, velocity, direction}) => {x, y, width, height}
     */
    constructor(canvas, context, {name, position, size, velocity, image, attackRect, healthIndicator}) {
        super(canvas, context, {position, size, velocity, image});
        this.name = name;
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
            if (this.enemy.position.x > this.position.x) {
                this.direction = 'right';
            } else {
                this.direction = 'left';
            }

            if (this.isAttacking()) {
                const attackRect = this.attackRect(this);
                if (attackRect.x < this.enemy.position.x + this.enemy.size.width
                    && attackRect.x + attackRect.width > this.enemy.position.x
                    && attackRect.y < this.enemy.position.y + this.enemy.size.height
                    && attackRect.y + attackRect.height > this.enemy.position.y) {
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
    TIME_LIMIT = 10;
    startedAt = null;
    timer = null;

    getAttackRect = ({position, size, direction}) => {
        if (direction === 'right') {
            return {
                x: position.x + size.width,
                y: position.y + size.height / 4,
                width: 100,
                height: size.height / 4
            };
        } else {
            return {
                x: position.x - 100,
                y: position.y + size.height / 4,
                width: 100,
                height: size.height / 4
            };
        }
    }

    constructor(timerElement) {
        this.timerElement = timerElement;
        this.canvas = document.getElementById('canvas');
        this.context = this.canvas.getContext('2d');
        this.canvas.width = 1024;
        this.canvas.height = 576;
        // this.context.fillStyle = 'black';
        // this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        window.addEventListener('keydown', event => {
            if (event.code === 'Space') {
                if (!this.startedAt)
                    this.start();
            }
        });
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
        this.player = new Character(this.canvas, this.context, {
            name: 'player',
            position: {x: 100, y: 100},
            size: {width: 50, height: 100},
            velocity: {x: 0, y: 0},
            image: document.getElementById('player'),
            attackRect: this.getAttackRect,
            healthIndicator: document.getElementById('player-health')
        });
        this.enemy = new Character(this.canvas, this.context, {
            name: 'enemy',
            position: {x: 400, y: 100},
            size: {width: 50, height: 100},
            velocity: {x: 0, y: 0},
            image: document.getElementById('player'),
            attackRect: this.getAttackRect,
            healthIndicator: document.getElementById('enemy-health')
        });
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
        this.timer = null;
        this.timerElement.innerText = '';
        console.log('end game');
    }

    isFinished() {
        return this.player.health <= 0 || this.enemy.health <= 0;
    }

    animate() {
        if (!this.startedAt) return;
        // this.context.fillStyle = 'black';
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
// game.start();
