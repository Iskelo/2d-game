window.addEventListener('load', function () {
	const canvas = document.getElementById('myCanvas');
	const ctx = canvas.getContext('2d');
	canvas.width = 700;
	canvas.height = 500;

	class InputHandler {
		constructor(game) {
			this.game = game;
			window.addEventListener('keydown', e => {
				if (((e.key === "ArrowUp") || (e.key === "ArrowDown")) && this.game.keys.indexOf(e.key) === -1) {
					this.game.keys.push(e.key)
				} else if (e.key === " ") {
					this.game.player.shootTop();
				} else if (e.key === 'd') {
					this.game.debug = !this.game.debug;
				}
			});
			window.addEventListener('keyup', e => {
				if (this.game.keys.indexOf(e.key) > -1) {
					this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
				}
			});
			canvas.addEventListener('touchstart', e => {
				const x = e.touches[0].clientX;
				const y = e.touches[0].clientY;


				const dx = x - canvas.width / 2;
				const dy = y - canvas.height / 2;
				if (dx > 0) {
					console.log(y, x);
					this.game.player.shootTop();
				} else {
					if (dy > 0) {
						e.key = "ArrowDown";
						this.game.keys.push(e.key);
						this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
						console.log(e.key, y, x);
					} else {
						e.key = "ArrowUp";
						this.game.keys.push(e.key);
						this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
						console.log(e.key, y, x);
					}
				}
			})
		}
	}
	class Projectile {
		constructor(game, x, y) {
			this.game = game;
			this.x = x;
			this.y = y;
			this.width = 10;
			this.height = 5;
			this.speed = 3;
			this.markedForDeletion = false;
		}
		update() {
			this.x += this.speed;
			if (this.x > this.game.width * 0.8) this.markedForDeletion = true;
		}
		draw(context) {
			context.fillStyle = 'yellow';
			context.fillRect(this.x, this.y, this.width, this.height);
		}
	}
	class Particle { }
	class Player {
		constructor(game) {
			this.game = game;
			this.width = 146.5;
			this.height = 100;
			this.x = 20;
			this.y = 150;
			this.frameX = 0;
			this.frameY = 0;
			this.maxFrame = 2;
			this.speedY = 0;
			this.maxSpeed = 3;
			this.projectiles = [];
			this.image = document.getElementById('player');
		}
		update() {
			if (this.game.keys.includes('ArrowUp')) {
				this.speedY = -this.maxSpeed;
			} else if (this.game.keys.includes('ArrowDown')) {
				this.speedY = this.maxSpeed;
			} else {
				this.speedY = 0;
			}
			this.y += this.speedY;
			// handle projectiles
			this.projectiles.forEach(projectile => {
				projectile.update();
			});
			this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion)
			//sprite animation
			if (this.frameX < this.maxFrame) {
				this.frameX++
			} else {
				this.frameX = 0;
			}
		}
		draw(context) {
			if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
			context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
			this.projectiles.forEach(projectile => {
				projectile.draw(context);
			});
		}
		shootTop() {
			if (this.game.ammo > 0) {
				this.projectiles.push(new Projectile(this.game, this.x + 110, this.y + 77));
				this.game.ammo--;
			}
		}
	}
	class Enemy {
		constructor(game) {
			this.game = game;
			this.x = this.game.width;
			this.speedX = Math.random() * -1.5 - 0.5;
			this.markedForDeletion = false;

		}
		update() {
			this.x += this.speedX - this.game.speed;
			if (this.x + this.width < 0) {
				this.markedForDeletion = true;
			}
		}
		draw(context) {
			if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
			context.drawImage(this.image, this.x, this.y)
			context.font = '20px Helvetica';
			context.fillText(this.lives, this.x, this.y);
		}
	}
	class Angler1 extends Enemy {
		constructor(game) {
			super(game);
			this.width = 150;
			this.height = 95;
			this.y = Math.random() * (this.game.height * 0.9 - this.height);
			this.image = document.getElementById('enemy1');
			this.lives = 1;
			this.score = this.lives;
		}
	}
	class Angler2 extends Enemy {
		constructor(game) {
			super(game);
			this.width = 150;
			this.height = 95;
			this.y = Math.random() * (this.game.height * 0.9 - this.height);
			this.image = document.getElementById('enemy2');
			this.lives = 3;
			this.score = this.lives;
		}
	}
	class Angler3 extends Enemy {
		constructor(game) {
			super(game);
			this.width = 150;
			this.height = 95;
			this.y = Math.random() * (this.game.height * 0.9 - this.height);
			this.image = document.getElementById('enemy3');
			this.lives = 4;
			this.score = this.lives;
		}
	}
	class Layer {
		constructor(game, image, speedModifier) {
			this.game = game;
			this.image = image;
			this.speedModifier = speedModifier;
			this.width = 1073;
			this.height = 500;
			this.x = 0;
			this.y = 0;
		}
		update() {
			if (this.x <= -this.width) {
				this.x = 0;
			}
			this.x -= this.game.speed * this.speedModifier;

		}
		draw(context) {
			context.drawImage(this.image, this.x, this.y);
			context.drawImage(this.image, this.x + this.width, this.y);
		}
	}
	class Background {
		constructor(game) {
			this.game = game;
			this.image1 = document.getElementById("layer1");
			this.image2 = document.getElementById("layer2");
			this.image3 = document.getElementById("layer3");
			this.image4 = document.getElementById("layer4");
			this.image5 = document.getElementById("layer5");
			this.layer1 = new Layer(this.game, this.image1, 0.2);
			this.layer2 = new Layer(this.game, this.image2, 0.4);
			this.layer3 = new Layer(this.game, this.image3, 1);
			this.layer4 = new Layer(this.game, this.image4, 1.5);
			this.layer5 = new Layer(this.game, this.image5, 2);
			this.layers = [this.layer1, this.layer2, this.layer3, this.layer4, this.layer5];
		}
		update() {
			this.layers.forEach(layer => layer.update());
		}
		draw(context) {
			this.layers.forEach(layer => layer.draw(context));
		}
	}
	class UI {
		constructor(game) {
			this.game = game;
			this.fontSize = 25;
			this.fontFamily = 'Helvetica';
			this.color = 'white';
		}
		draw(context) {
			context.save();
			context.fillStyle = this.color;
			context.shadowOffsetX = 2;
			context.shadowOffsetY = 2;
			context.shadowColor = "black";
			context.font = this.fontSize + 'px' + this.fontFamily;
			// score  
			context.fillText("Score: " + this.game.score, 20, 40)
			//ammo 
			for (let i = 0; i < this.game.ammo; i++) {
				context.fillRect(20 + 5 * i, 50, 3, 20);
			}
			//timer
			const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
			context.fillText('Timer: ' + formattedTime, 20, 100)
			//game over massage
			if (this.game.gameOver) {
				context.textAlign = 'center';
				let massage1;
				let massage2;
				if (this.game.score > this.game.winningScore) {
					massage1 = "You Win!";
					massage2 = "Well Done!";
				} else {
					massage1 = "You Lose!";
					massage2 = " Try Again Next Time!";
				}
				context.font = '50px ' + this.fontFamily;
				context.fillText(massage1, this.game.width * 0.5, this.game.height * 0.5 - 40);
				context.font = '25px ' + this.fontFamily;
				context.fillText(massage2, this.game.width * 0.5, this.game.height * 0.5 + 40);
			}
			context.restore();
		}
	}
	class Game {
		constructor(width, height) {
			this.width = width;
			this.height = height;
			this.background = new Background(this);
			this.player = new Player(this);
			this.input = new InputHandler(this);
			this.ui = new UI(this);
			this.keys = [];
			this.enemies = [];
			this.enemyTimers = 0;
			this.enemyInterval = 1000;
			this.ammo = 20;
			this.maxAmmo = 50;
			this.ammoTimer = 0;
			this.ammoInterval = 500;
			this.gameOver = false;
			this.score = 0;
			this.winningScore = 15;
			this.gameTime = 0;
			this.timeLimit = 15000;
			this.speed = 1;
			this.debug = true;
		}
		update(deltaTime) {
			if (!this.gameOver) this.gameTime += deltaTime;
			if (this.gameTime > this.timeLimit) this.gameOver = true;
			this.background.update();
			this.player.update();
			if (this.ammoTimer > this.ammoInterval) {
				if (this.ammo < this.maxAmmo) this.ammo++;
				this.ammoTimer = 0;
			} else {
				this.ammoTimer += deltaTime;
			}
			this.enemies.forEach(enemy => {
				enemy.update();
				if (this.checkCollision(this.player, enemy)) {
					enemy.markedForDeletion = true;
				}
				this.player.projectiles.forEach(projectile => {
					if (this.checkCollision(projectile, enemy)) {
						enemy.lives--;
						projectile.markedForDeletion = true;
						if (enemy.lives <= 0) {
							enemy.markedForDeletion = true;
							if (!this.gameOver) this.score += enemy.score;
							if (this.score > this.winningScore) this.gameOver = true;
						}
					}
				})
			})
			this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
			if (this.enemyTimers > this.enemyInterval && !this.gameOver) {
				this.addEnemy();
				this.enemyTimers = 0;
			} else {
				this.enemyTimers += deltaTime;
			}
		}
		draw(context) {
			this.background.draw(context);
			this.player.draw(context);
			this.ui.draw(context);
			this.enemies.forEach(enemy => {
				enemy.draw(context);
			})
		}
		addEnemy() {
			const randomize = Math.random();
			if (randomize < 0.5) {
				this.enemies.push(new Angler1(this));
			} else {
				this.enemies.push(new Angler2(this));
			}
			this.enemies.push(new Angler3(this));
		}
		checkCollision(rect1, rect2) {
			return (rect1.x < rect2.x + rect2.width &&
				rect1.x + rect1.width > rect2.x &&
				rect1.y < rect2.y + rect2.height &&
				rect1.y + rect1.height > rect2.y)
		}
	}
	const game = new Game(canvas.width, canvas.height);
	let lastTime = 0;
	function animate(timeStamp) {
		const deltaTime = timeStamp - lastTime;
		lastTime = timeStamp;
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		game.update(deltaTime);
		game.draw(ctx);
		requestAnimationFrame(animate);
	}
	animate(0);
})