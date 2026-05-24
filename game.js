class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  preload() {
    // No external assets required for this MVP. We will generate shapes at runtime.
  }

  create() {
    // Initial score
    this.score = 0;

    // Dimensions for the play field. These can be adjusted if you change the canvas size.
    this.fieldWidth = 800;
    this.fieldHeight = 500;

    // Create a Graphics object to draw our shapes and generate textures
    const graphics = this.add.graphics();

    // Player texture (glowing cyan circle)
    const playerSize = 40;
    graphics.fillStyle(0x00ffee, 1);
    graphics.fillCircle(playerSize / 2, playerSize / 2, playerSize / 2);
    graphics.generateTexture('player', playerSize, playerSize);
    graphics.clear();

    // Ball texture (magenta circle)
    const ballSize = 20;
    graphics.fillStyle(0xff0099, 1);
    graphics.fillCircle(ballSize / 2, ballSize / 2, ballSize / 2);
    graphics.generateTexture('ball', ballSize, ballSize);
    graphics.clear();

    // Goal area texture (semi-transparent blue rectangle)
    const goalWidth = 120;
    const goalHeight = 60;
    graphics.fillStyle(0x0033ff, 0.4);
    graphics.fillRect(0, 0, goalWidth, goalHeight);
    graphics.generateTexture('goal', goalWidth, goalHeight);
    graphics.clear();

    // Set world bounds and camera boundaries
    this.physics.world.setBounds(0, 0, this.fieldWidth, this.fieldHeight);
    this.cameras.main.setBounds(0, 0, this.fieldWidth, this.fieldHeight);

    // Draw the pitch outline using another graphics object. We'll keep it simple.
    const fieldGraphics = this.add.graphics();
    fieldGraphics.lineStyle(4, 0x00ff88, 1);
    fieldGraphics.strokeRect(2, 2, this.fieldWidth - 4, this.fieldHeight - 4);

    // Draw a center line
    fieldGraphics.lineStyle(2, 0x00ff88, 0.5);
    fieldGraphics.beginPath();
    fieldGraphics.moveTo(0, this.fieldHeight / 2);
    fieldGraphics.lineTo(this.fieldWidth, this.fieldHeight / 2);
    fieldGraphics.strokePath();

    // Draw center circle
    fieldGraphics.lineStyle(2, 0x00ff88, 0.5);
    fieldGraphics.strokeCircle(this.fieldWidth / 2, this.fieldHeight / 2, 60);

    // Add the goal area as a static zone for scoring at the top of the field
    this.goal = this.physics.add.staticImage(this.fieldWidth / 2, goalHeight / 2 + 2, 'goal');
    this.goal.displayWidth = goalWidth;
    this.goal.displayHeight = goalHeight;

    // Player sprite with physics
    this.player = this.physics.add.sprite(this.fieldWidth / 2, this.fieldHeight - 60, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(600);
    this.player.setMaxVelocity(300);

    // Ball sprite with physics
    this.ball = this.physics.add.sprite(this.fieldWidth / 2, this.fieldHeight / 2, 'ball');
    this.ball.setCollideWorldBounds(true);
    this.ball.setBounce(0.9);
    this.ball.setDrag(50);
    this.ball.setMaxVelocity(400);

    // Add collider between player and ball to allow them to interact
    this.physics.add.collider(this.player, this.ball);

    // When the ball overlaps the goal area, call onGoal
    this.physics.add.overlap(this.ball, this.goal, this.onGoal, null, this);

    // Input setup
    this.cursors = this.input.keyboard.createCursorKeys();

    // Pointer-based movement setup. We'll allow the player to drag towards a pointer position.
    // When the pointer is held down, we record its position and apply velocity towards it in the update loop.
    this.isPointerDown = false;
    this.pointerTarget = new Phaser.Math.Vector2();

    this.input.on('pointerdown', (pointer) => {
      this.isPointerDown = true;
      this.pointerTarget.set(pointer.x, pointer.y);
    });
    this.input.on('pointerup', () => {
      this.isPointerDown = false;
      // Stop movement when pointer is released
      this.player.setVelocity(0);
    });
    this.input.on('pointermove', (pointer) => {
      if (this.isPointerDown) {
        this.pointerTarget.set(pointer.x, pointer.y);
      }
    });

    // Display score text. The scroll factor 0 ensures it stays fixed on screen.
    // Score text shows the number of goals. It stays fixed on screen thanks to scrollFactor 0.
    this.scoreText = this.add.text(10, 10, 'Goals: 0', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#00ffee'
    });
    this.scoreText.setScrollFactor(0);
  }

  /**
   * Called when the ball enters the goal area.
   */
  onGoal() {
    this.score += 1;
    this.scoreText.setText('Goals: ' + this.score);
    // Reset ball to center and stop movement
    this.ball.setPosition(this.fieldWidth / 2, this.fieldHeight / 2);
    this.ball.setVelocity(0, 0);
  }

  update() {
    // Reset player velocity each frame. We'll override this if arrow keys or pointer input are detected.
    this.player.setVelocity(0);

    // If pointer is held down, move player towards the pointer position
    if (this.isPointerDown) {
      const dx = this.pointerTarget.x - this.player.x;
      const dy = this.pointerTarget.y - this.player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 5) {
        const speed = 250;
        const vx = (dx / distance) * speed;
        const vy = (dy / distance) * speed;
        this.player.setVelocity(vx, vy);
      } else {
        // Close enough to target; stop moving
        this.player.setVelocity(0);
      }
    } else {
      // No pointer input; use arrow keys
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-250);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(250);
      }
      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-250);
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(250);
      }
    }
  }
}

// Phaser game configuration
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 800,
  height: 500,
  backgroundColor: '#111111',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: MainScene
};

// Launch the game
const game = new Phaser.Game(config);
