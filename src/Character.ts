import { set as setCustomProperty } from './properties';
import { CharacterState } from './enums/CharacterState';
import Sprite from './Sprite';
import { ATTACK_DELAY, ATTACK_KEEP_MS, CHARACTER_BOTTOM_THRESHOLD, FULL_HEALTH, GRAVITY } from './constants';
import { ImageAttr, Position } from './types';
import { CoordinateBasis } from './enums/CoordinateBasis';
import { Direction } from './enums/Direction';

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
    images: Record<CharacterState, Partial<ImageAttr>[]>,
  ) {
    super(canvas, context, { position, coordinateBasis: CoordinateBasis.CENTER, imageAttr: images.IDLE[0] });

    this.name = name;
    this.healthIndicator = healthIndicator;
    this.images = images;
  }

  getStateImage(index: number = 0) {
    return this.images[this.state][index];
  }

  setState(state: CharacterState) {
    let frame = this.imageAttr.frameClipper(this.image, this.imageAttr, this.framesCurrent);
    const x = this.x(frame);
    const y = this.y(frame);
    const drawingWidth = this.drawingWidth(frame);
    const drawingHeight = this.drawingHeight(frame);
    const preState = this.state;

    this.state = state;
    this.setImage(this.getStateImage());

    frame = this.imageAttr.frameClipper(this.image, this.imageAttr, this.framesCurrent);
    const changedX = this.x(frame);
    const changedY = this.x(frame);
    const changedWidth = this.drawingWidth(frame);
    const changedHeight = this.drawingHeight(frame);

    if (drawingWidth !== changedWidth || drawingHeight !== changedHeight) {
      console.log('state before', { state: preState, x, y, width: drawingWidth, height: drawingHeight });
      console.log('state after', { state, x: changedX, y: changedY, width: changedWidth, height: changedHeight });
      // if (drawingHeight !== changedHeight) this.position.y += drawingHeight - changedHeight;
      // if (drawingWidth !== changedWidth && this.reversed()) this.position.x += drawingWidth - changedWidth;
    }
  }

  setEnemy(enemy?: Character) {
    this.enemy = enemy;
  }

  isJumping() {
    return this.position.y < CHARACTER_BOTTOM_THRESHOLD;
  }

  jump() {
    if (this.isJumping()) return;
    this.velocity.y = -10;
    this.setState(CharacterState.JUMP);
    this.finishAttack();
  }

  moveRight() {
    if (this.isJumping()) return;
    this.velocity.x = 5;
    this.setState(CharacterState.MOVE);
  }

  moveLeft() {
    if (this.isJumping()) return;
    this.velocity.x = -5;
    this.setState(CharacterState.MOVE);
  }

  stopMove() {
    if (this.isJumping()) return;
    this.velocity.x = 0;
    this.setState(CharacterState.IDLE);
  }

  isAttacking() {
    return this.attackedAt && Date.now() - this.attackedAt > ATTACK_DELAY && Date.now() - this.attackedAt < ATTACK_KEEP_MS;
  }

  isFinishedAttack() {
    return this.attackedAt && Date.now() - this.attackedAt > ATTACK_KEEP_MS;
  }

  finishAttack() {
    this.attackedAt = undefined;
    if (this.isJumping()) this.setState(this.velocity.y > 0 ? CharacterState.FALL : CharacterState.JUMP);
    else if (this.velocity.x) this.setState(CharacterState.MOVE);
    else this.setState(CharacterState.IDLE);
  }

  attack() {
    if (this.attackedAt) return;
    this.lastAttackedAt = this.attackedAt = Date.now();
    this.setState(CharacterState.ATTACK);
  }

  getDamage(attackId: number, damage: number) {
    if (this.lastGetAttackId === attackId) return;

    this.lastGetAttackId = attackId;
    this.health -= damage;

    if (this.health < 0) this.health = 0;
    // console.log(this.health / FULL_HEALTH * 100, `${this.name} get damage ${damage}, current health: ${this.health}`);
    if (this.healthIndicator) setCustomProperty(this.healthIndicator, '--var', (this.health / FULL_HEALTH) * 100 + '%');

    if (this.health <= 0) {
      console.log(`${this.name} is dead`);
    }
  }

  update() {
    super.update();

    const isJumping = this.isJumping();
    const width = this.imageWidth() * this.imageAttr.scale;
    // const height = this.imageHeight() * this.imageAttr.scale;

    if (this.position.y + this.velocity.y > CHARACTER_BOTTOM_THRESHOLD) {
      // console.log('stop jumping', this.position.y, this.velocity.y, CHARACTER_BOTTOM_THRESHOLD)
      this.velocity.x = 0;
      this.velocity.y = 0;
      this.position.y = CHARACTER_BOTTOM_THRESHOLD;
      this.setState(CharacterState.IDLE);
    } else if (this.isJumping()) {
      this.velocity.y += GRAVITY;
      if (!this.attackedAt) this.setState(this.velocity.y > 0 ? CharacterState.FALL : CharacterState.JUMP);
    }

    if (this.position.x + width + this.velocity.x > this.canvas.width || this.position.x + this.velocity.x < 0) {
      this.velocity.x = 0;
      this.setState(CharacterState.IDLE);
    }

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.enemy) {
      // TODO: 케릭터의 중심을 이미지의 x,y가 아니라 지정된 x,y로 변경하고(image 별로 설정하고), 설정된 x,y를 이미지를 draw하고, direction을 계산한다.
      // TODO: 변경된 x,y를 기준으로 화면밖으로 나가지 않도록 처리한다.
      this.direction = this.enemy.position.x > this.position.x ? Direction.RIGHT : Direction.LEFT;

      if (this.isAttacking()) {
        // const hitRect = this.enemy.hitRect(this.enemy);
        // const attackRect = this.attackRect(this);
        //
        // // console.log('attack', attackRect, hitRect)
        // if (attackRect.x < hitRect.x + hitRect.width && attackRect.x + attackRect.width > hitRect.x && attackRect.y < hitRect.y + hitRect.height && attackRect.y + attackRect.height > hitRect.y) {
        //   // console.log(`hit ${this.name} > ${this.enemy.name}`);
        //   this.enemy.getDamage(this.lastAttackedAt, ATTACK_DAMAGE);
        // }
      }
    }

    if (this.isFinishedAttack() || (isJumping && !this.isJumping())) {
      this.finishAttack();
    }
  }
}
