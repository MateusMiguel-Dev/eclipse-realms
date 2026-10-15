import Phaser from "phaser";

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;

  private npc!: Phaser.Physics.Arcade.StaticSprite;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  private keys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
  };

  private dialogueBox!: Phaser.GameObjects.Container;

  private dialogueVisible = false;

  constructor() {
    super("GameScene");
  }

  preload() {
    // =====================================================
    // PERSONAGEM
    // =====================================================

    this.load.image("player", "/assets/characters/player.png");

    this.load.image("walk-down", "/assets/characters/walk-down.png");
    this.load.image("walk-up", "/assets/characters/walk-up.png");
    this.load.image("walk-left", "/assets/characters/walk-left.png");
    this.load.image("walk-right", "/assets/characters/walk-right.png");

    // =====================================================
    // NPC
    // =====================================================

    this.load.image("npc", "/assets/npc/npc-01.png");

    // =====================================================
    // TILES
    // =====================================================

    this.load.image("tiles", "/assets/tiles/tileset.png");

    // =====================================================
    // MAPA
    // =====================================================

    this.load.tilemapTiledJSON("mapa", "/maps/mapa-01.json");
  }

  create() {
    // =====================================================
    // MAPA
    // =====================================================

    const map = this.make.tilemap({
      key: "mapa",
    });

    console.log("Mapa carregado:", map);

    // =====================================================
    // TILESET
    // =====================================================

    const tileset = map.addTilesetImage("mapas", "tiles");
    if (!tileset) {
      console.error("ERRO: não foi possível carregar o tileset.");

      return;
    }

    console.log("Tileset carregado:", tileset);

    // =====================================================
    // CAMADA DO MAPA
    // =====================================================

    const groundLayer = map.createLayer("Camada de Blocos 1", tileset, 0, 0);

    if (!groundLayer) {
      console.error(
        "ERRO: não foi possível criar a camada 'Camada de Blocos 1'.",
      );

      return;
    }

    groundLayer.setDepth(0);

    // =====================================================
    // TAMANHO DO MUNDO
    // =====================================================

    const worldWidth = map.widthInPixels;
    const worldHeight = map.heightInPixels;

    console.log("Tamanho do mapa:", worldWidth, "x", worldHeight);

    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // =====================================================
    // CÂMERA
    // =====================================================

    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    this.cameras.main.zoom = 1.5;

    // =====================================================
    // JOGADOR
    // =====================================================

    this.player = this.physics.add.sprite(
      worldWidth / 2,
      worldHeight / 2,
      "player",
    );

    this.player.setScale(0.5);

    this.player.setDepth(10);

    this.player.setCollideWorldBounds(true);

    // =====================================================
    // COLISÕES DO MAPA
    // =====================================================

    const collisionLayer = map.getObjectLayer("Colisoes");

    if (collisionLayer) {
      console.log("Camada de colisão encontrada:", collisionLayer);

      collisionLayer.objects.forEach((obj) => {
        if (obj.width && obj.height) {
          const zone = this.add.rectangle(
            obj.x + obj.width / 2,
            obj.y + obj.height / 2,
            obj.width,
            obj.height,
          );

          this.physics.add.existing(zone, true);

          this.physics.add.collider(this.player, zone);
        }
      });
    } else {
      console.warn("Nenhuma camada chamada 'Colisoes' foi encontrada.");
    }

    // =====================================================
    // NPC
    // =====================================================

    this.npc = this.physics.add.staticSprite(
      worldWidth / 2 + 150,
      worldHeight / 2,
      "npc",
    );

    this.npc.setScale(0.5);

    this.npc.setDepth(10);

    // =====================================================
    // CAIXA DE DIÁLOGO
    // =====================================================

    const boxBackground = this.add.rectangle(0, 0, 700, 180, 0x111827, 0.95);

    boxBackground.setStrokeStyle(3, 0xd4af37);

    const npcName = this.add.text(-320, -70, "Guardião", {
      fontFamily: "Arial",
      fontSize: "24px",
      color: "#f5d76e",
      fontStyle: "bold",
    });

    const dialogueText = this.add.text(
      -320,
      -30,
      "Olá, aventureiro! Tenho uma tarefa que pode interessar a você.",
      {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#ffffff",

        wordWrap: {
          width: 620,
        },
      },
    );

    const closeHint = this.add.text(180, 55, "[ E ] Fechar", {
      fontFamily: "Arial",
      fontSize: "16px",
      color: "#cccccc",
    });

    // =====================================================
    // CONTAINER DO DIÁLOGO
    // =====================================================

    this.dialogueBox = this.add.container(
      this.scale.width / 2,
      this.scale.height - 130,
      [boxBackground, npcName, dialogueText, closeHint],
    );

    this.dialogueBox.setScrollFactor(0);

    this.dialogueBox.setDepth(1000);

    this.dialogueBox.setVisible(false);

    // =====================================================
    // CONTROLES
    // =====================================================

    this.cursors = this.input.keyboard!.createCursorKeys();

    this.keys = this.input.keyboard!.addKeys("W,A,S,D,E") as typeof this.keys;

    // =====================================================
    // CÂMERA SEGUINDO O PLAYER
    // =====================================================

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
  }

  update() {
    const speed = 250;

    let velocityX = 0;
    let velocityY = 0;

    // =====================================================
    // DISTÂNCIA DO NPC
    // =====================================================

    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.npc.x,
      this.npc.y,
    );

    // =====================================================
    // INTERAÇÃO COM NPC
    // =====================================================

    if (distance < 100 && Phaser.Input.Keyboard.JustDown(this.keys.E)) {
      this.dialogueVisible = !this.dialogueVisible;

      this.dialogueBox.setVisible(this.dialogueVisible);
    }

    // =====================================================
    // BLOQUEAR MOVIMENTO DURANTE DIÁLOGO
    // =====================================================

    if (this.dialogueVisible) {
      this.player.setVelocity(0, 0);

      return;
    }

    // =====================================================
    // MOVIMENTO
    // =====================================================

    if (this.cursors.left.isDown || this.keys.A.isDown) {
      velocityX = -speed;

      this.player.setTexture("walk-left");
    } else if (this.cursors.right.isDown || this.keys.D.isDown) {
      velocityX = speed;

      this.player.setTexture("walk-right");
    } else if (this.cursors.up.isDown || this.keys.W.isDown) {
      velocityY = -speed;

      this.player.setTexture("walk-up");
    } else if (this.cursors.down.isDown || this.keys.S.isDown) {
      velocityY = speed;

      this.player.setTexture("walk-down");
    } else {
      this.player.setTexture("player");
    }

    // =====================================================
    // APLICAR VELOCIDADE
    // =====================================================

    this.player.setVelocity(velocityX, velocityY);
  }
}
