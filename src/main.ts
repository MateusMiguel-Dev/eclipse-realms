import Phaser from "phaser";
import { GameScene } from "./game/GameScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,

  width: 1280,
  height: 720,

  backgroundColor: "#18221b",

  pixelArt: true,
  antialias: false,

  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },

  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  scene: [GameScene],
};

new Phaser.Game(config);
