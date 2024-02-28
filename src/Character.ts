import { set as setProperty } from './properties';
import { CharacterState } from './enums/CharacterState';
import Sprite from './Sprite';
import { ATTACK_DAMAGE, CHARACTER_BOTTOM_THRESHOLD, FULL_HEALTH, GRAVITY } from './constants';
import { CharacterMotion, ImageOffset, Position } from './types';
import { CoordinateBasis } from './enums/CoordinateBasis';
import { Direction } from './enums/Direction';

const convertLeftRight = (value?: ImageOffset) =>
  !value
    ? value
    : {
        left: value.right > value.left ? value.left : value.right,
        right: value.right > value.left ? value.right : value.left,
        top: value.top,
        bottom: value.bottom,
      };

export class Character extends Sprite {
  name;
  velocity = { x: 0, y: 0 } as Position;
  attackedAt? = undefined as number | undefined;
  lastAttackedAt? = undefined as number | undefined;
  health = FULL_HEALTH;
  lastGetAttackId? = undefined as number | undefined; // attackedAt
  state = CharacterState.IDLE;
  images;
  healthIndicator?;
  enemy? = undefined as Character | undefined;

  constructor(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    { name, position, healthIndicator }: { name: string; position: Position; healthIndicator?: HTMLElement },
    images: Record<CharacterState, Partial<CharacterMotion>[]>,
  ) {
    super(canvas, context, { position, coordinateBasis: CoordinateBasis.CENTER, imageAttr: images.IDLE[0] });

    this.name = name;
    this.healthIndicator = healthIndicator;
    this.images = images;

    healthIndicator && setProperty(healthIndicator, '--var', '100%');
  }

  getStateImage(index: number = 0) {
    return this.images[this.state][index];
  }

  setState(state: CharacterState) {
    if (this.state === state) return;
    this.state = state;
    this.setImage(this.getStateImage());

    if (this.name === 'player') console.log(`${this.name} state: ${this.state}`);
  }

  setEnemy(enemy?: Character) {
    this.enemy = enemy;
  }

  isJumping() {
    return this.position.y < CHARACTER_BOTTOM_THRESHOLD;
  }

  attack() {
    if (this.attackedAt) return;
    this.lastAttackedAt = this.attackedAt = Date.now();
    this.setState(CharacterState.ATTACK);
    if (!this.isJumping()) this.velocity.x = 0;
  }

  jump() {
    if (this.isJumping()) return;
    this.velocity.y = -10;
    this.setState(CharacterState.JUMP);
    this.finishAttack();
  }

  moveRight() {
    if (this.isJumping() || this.isAttacking()) return;
    this.velocity.x = 5;
    this.setState(CharacterState.MOVE);
  }

  moveLeft() {
    if (this.isJumping() || this.isAttacking()) return;
    this.velocity.x = -5;
    this.setState(CharacterState.MOVE);
  }

  stopMove() {
    if (this.isJumping() || this.isAttacking()) return;
    this.velocity.x = 0;
    this.setState(CharacterState.IDLE);
  }

  isAttacking() {
    if (this.state !== CharacterState.ATTACK) return false;
    return this.attackedAt && this.imageAttr.animationDuration && new Date().getTime() - this.attackedAt <= this.imageAttr.animationDuration;
  }

  isFinishedAttack() {
    if (this.state !== CharacterState.ATTACK) return false;
    return this.attackedAt && this.imageAttr.animationDuration && new Date().getTime() - this.attackedAt > this.imageAttr.animationDuration;
  }

  finishAttack() {
    this.attackedAt = undefined;
    if (this.isJumping()) this.setState(this.velocity.y > 0 ? CharacterState.FALL : CharacterState.JUMP);
    else if (this.velocity.x) this.setState(CharacterState.MOVE);
    else this.setState(CharacterState.IDLE);
  }

  getDamage(attackId: number, damage: number) {
    if (this.lastGetAttackId === attackId) return;

    this.lastGetAttackId = attackId;
    this.health -= damage;

    if (this.health < 0) this.health = 0;
    // console.log(this.health / FULL_HEALTH * 100, `${this.name} get damage ${damage}, current health: ${this.health}`);
    if (this.healthIndicator) setProperty(this.healthIndicator, '--var', (this.health / FULL_HEALTH) * 100 + '%');

    if (this.health <= 0) {
      console.log(`${this.name} is dead`);
    }
  }

  getAttackArea() {
    if (!this.getStateImage().getAttackArea) return;
    return this.getStateImage().getAttackArea!({
      sprite: this,
      position: this.position,
      animatedAt: this.animatedAt,
      framesCurrent: this.framesCurrent,
      imageAttr: this.imageAttr,
    });
  }

  getHitArea() {
    if (!this.getStateImage().getHitArea) return;
    return this.getStateImage().getHitArea!({
      sprite: this,
      position: this.position,
      animatedAt: this.animatedAt,
      framesCurrent: this.framesCurrent,
      imageAttr: this.imageAttr,
    });
  }

  limitPosition() {
    if (this.position.y > CHARACTER_BOTTOM_THRESHOLD) this.position.y = CHARACTER_BOTTOM_THRESHOLD;
    if (this.position.x < 0) this.position.x = 0;
    else if (this.position.x > this.canvas.width) this.position.x = this.canvas.width;
  }

  checkCollision() {
    if (this.enemy) {
      this.direction = this.enemy.position.x > this.position.x ? Direction.RIGHT : Direction.LEFT;

      const attackArea = convertLeftRight(this.getAttackArea());
      const hitArea = convertLeftRight(this.enemy.getHitArea());
      if (attackArea && hitArea) {
        console.log('player', this.getHitArea(), 'attackArea', attackArea, 'hitArea', hitArea);

        if (attackArea.left < hitArea.right && attackArea.right > hitArea.left && attackArea.top < hitArea.bottom && attackArea.bottom > hitArea.top) {
          this.enemy.getDamage(this.lastAttackedAt!, ATTACK_DAMAGE);
        }
      }
    }
  }

  draw() {
    super.draw();
    if (this.getStateImage().getHitArea) {
      const area = this.getStateImage().getHitArea!({
        sprite: this,
        position: this.position,
        animatedAt: this.animatedAt,
        framesCurrent: this.framesCurrent,
        imageAttr: this.imageAttr,
      });
      if (area) {
        this.context.fillStyle = 'rgba(255, 0, 0, 0.5)';
        this.context.fillRect(area.left, area.top, area.right - area.left, area.bottom - area.top);
      }
    }

    if (this.getStateImage().getAttackArea) {
      const area = this.getStateImage().getAttackArea!({
        sprite: this,
        position: this.position,
        animatedAt: this.animatedAt,
        framesCurrent: this.framesCurrent,
        imageAttr: this.imageAttr,
      });
      if (area) {
        this.context.fillStyle = 'rgba(0, 0, 255, 0.5)';
        this.context.fillRect(area.left, area.top, area.right - area.left, area.bottom - area.top);
      }
    }
  }

  update() {
    super.update();

    this.limitPosition();
    this.checkCollision();

    const isJumping = this.isJumping();

    if (this.position.y + this.velocity.y > CHARACTER_BOTTOM_THRESHOLD) {
      this.velocity.x = 0;
      this.velocity.y = 0;
      this.position.y = CHARACTER_BOTTOM_THRESHOLD;
      this.setState(CharacterState.IDLE);
    } else if (this.isJumping()) {
      this.velocity.y += GRAVITY;
      if (!this.isAttacking()) this.setState(this.velocity.y > 0 ? CharacterState.FALL : CharacterState.JUMP);
    }

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.isFinishedAttack() || (isJumping && !this.isJumping())) this.finishAttack();
  }
}
