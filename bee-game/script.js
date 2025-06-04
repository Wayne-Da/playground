const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const keys = {};

class Entity {
  constructor(x, y, size, color) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  collide(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.hypot(dx, dy) < this.size + other.size;
  }
}

class Bullet extends Entity {
  constructor(x, y, target, speed) {
    super(x, y, 4, 'orange');
    this.target = target;
    this.speed = speed;
    this.vx = 0;
    this.vy = -speed;
  }

  update() {
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const angle = Math.atan2(dy, dx);
    // smoothly adjust velocity toward the target
    this.vx += Math.cos(angle) * 0.1;
    this.vy += Math.sin(angle) * 0.1;
    const mag = Math.hypot(this.vx, this.vy);
    this.vx = (this.vx / mag) * this.speed;
    this.vy = (this.vy / mag) * this.speed;

    this.x += this.vx;
    this.y += this.vy;
  }
}

class Chest extends Entity {
  constructor(x, y) {
    super(x, y, 10, 'gold');
  }
}

const player = new Entity(canvas.width / 2, canvas.height - 50, 15, 'blue');
let enemy = new Entity(canvas.width / 2, 50, 20, 'red');
let bullets = [];
let chest = null;
let bulletSpeed = 2.5;
let chestTimer = 0;

function resetEnemy() {
  enemy = new Entity(Math.random() * canvas.width, Math.random() * canvas.height / 2, 20, 'red');
}

function spawnChest() {
  if (!chest) {
    chest = new Chest(Math.random() * (canvas.width - 40) + 20, Math.random() * (canvas.height - 40) + 20);
  }
}

function update() {
  // player movement
  if (keys['ArrowLeft']) player.x -= 3;
  if (keys['ArrowRight']) player.x += 3;
  if (keys['ArrowUp']) player.y -= 3;
  if (keys['ArrowDown']) player.y += 3;

  player.x = Math.max(player.size, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(player.size, Math.min(canvas.height - player.size, player.y));

  // enemy random movement
  enemy.x += Math.sin(Date.now() / 1000) * 1.5;
  enemy.y += Math.cos(Date.now() / 1000) * 1.5;

  if (enemy.x < enemy.size || enemy.x > canvas.width - enemy.size || enemy.y < enemy.size || enemy.y > canvas.height / 2) {
    resetEnemy();
  }

  // update bullets
  bullets.forEach((b, i) => {
    b.update();
    if (b.collide(enemy)) {
      bullets.splice(i, 1);
      resetEnemy();
    }
  });

  // chest spawn timer
  chestTimer++;
  if (chestTimer > 300) { // roughly every 5s at 60fps
    spawnChest();
    chestTimer = 0;
  }

  // chest pickup
  if (chest && player.collide(chest)) {
    bulletSpeed += 1;
    chest = null;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  player.draw();
  enemy.draw();
  bullets.forEach(b => b.draw());
  if (chest) chest.draw();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (e.key === ' ') {
    bullets.push(new Bullet(player.x, player.y, enemy, bulletSpeed));
  }
});

window.addEventListener('keyup', e => {
  keys[e.key] = false;
});

requestAnimationFrame(gameLoop);
