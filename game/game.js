//import {playerSprite,enemyShipSprite,enemyTankSprite,enemySpeederSprite,enemyBossSprite,playerProjectileSprite,playerExplosiveProjectileSprite,enemyProjectileSprite,enemyExplosiveProjectileSprite,powerupInvincibleSprite,shieldSprite,powerupBulletSprite,powerupAmmoSprite,powerupHealthSprite,powerupDamageSprite,powerupSpeedSprite,powerupExplosiveSprite,alienPlanet1Sprite,alienPlanet2Sprite,bluePlanet1Sprite,bluePlanet2Sprite,redPlanet1Sprite,redPlanet2Sprite,icePlanet1Sprite,icePlanet2Sprite,lavaPlanet1Sprite,lavaPlanet2Sprite,ringedPlanet1Sprite,ringedPlanet2Sprite,gasGiant1Sprite,gasGiant2Sprite,galaxyBlueSprite,galaxyGoldSprite,galaxyGreenSprite,galaxyPinkSprite,blackholeSprite,starSprite,asteroid1Sprite,asteroid2Sprite,asteroid3Sprite,asteroid4Sprite,asteroid5Sprite,asteroid6Sprite,asteroid7Sprite,asteroid8Sprite,asteroid9Sprite,asteroid10Sprite,cloudsSprite,explosion1Sprite,explosion2Sprite,explosion3Sprite,explosion4Sprite,exclamationPointSprite,UISprite} from "./assets.js"
import { Player } from "./player.js"
import { Ship, Tank, Speeder, Boss } from "./enemy.js"
import { InputHandler } from "./inputhandler.js"
import { Background } from "./background.js"
import { InvincibilityPowerup, AmmoPowerup, BulletPowerup, ExplosivePowerup, SpeedPowerup, HealthPowerup, DamagePowerup  } from "./powerup.js"
import { MainMenuUI, IngameUI, GameOverUI, LevelUpUI } from "./ui.js"
import { Explosion } from "./particle.js"

export const canvas = document.querySelector("#game")
export const ctx = canvas.getContext("2d")

ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;

canvas.width = 1700
canvas.height = 1300

console.log("game.js loaded")
const dashhorizon = new FontFace("dashhorizon", "url(/assets/fonts/dashhorizon.otf)")
document.fonts.add(dashhorizon)

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

export function chance(percent) {
  if (Math.random() <= percent) {
    return true
  }
  else return false
}

class Game {
  constructor(width, height) {
    this.width = width
    this.height = height
    this.gameTime = 0 // in ms
    this.endTime = 0
    this.score = 0
    this.gameState = "mainmenu"
    this.inputhandler = new InputHandler(this)
    this.player = new Player(this)
    this.mainMenuUI = new MainMenuUI(this)
    this.ingameUI = new IngameUI(this)
    this.gameOverUI = new GameOverUI(this)
    this.levelUpUI = new LevelUpUI(this)
    this.background = new Background(this)
    this.currentInputs = []
    this.playerProjectiles = []
    this.particles = []
    this.playerExplosions = []
    this.enemyExplosions = []
    this.enemySpawnTimer = 0
    this.enemySpawnInterval = 2000 // startvalue, only in ms if spawnAcceleration is 1
    this.spawnAcceleration = 1
    this.spawnAccelerationTimer = 0
    this.spawnAccelerationInterval = 15000 // in ms
    this.bossTimer = 0
    this.bossInterval = 60000 // in ms
    this.enemies = []
    this.enemyProjectiles = []
    this.powerups = []
    this.collectedPowerups = []
    this.player.unlimitedAmmo = true
    this.spawnEnemies = true
    this.gameState = "mainmenu"

  }
  update(deltaTime) {
    this.gameTime += deltaTime
    this.player.update(deltaTime)
    this.background.update(deltaTime)

    // particles
    this.particles.forEach(particle => {
      particle.update(deltaTime)
      if (particle.markedForDeletion) {
        this.particles.splice(this.particles.indexOf(particle), 1)
      }
    })
    
    //player explosions
    this.playerExplosions.forEach(explosion => {
      explosion.update(deltaTime)
      this.enemies.forEach(enemy => {
        if (this.checkCollision(explosion, enemy)) {
          explosion.onContact(enemy)
          }
        }
      )
      if (explosion.markedForDeletion) {
        this.playerExplosions.splice(this.playerExplosions.indexOf(explosion), 1)
      }
    })
    
    //enemy explosions
    this.enemyExplosions.forEach(explosion => {
      explosion.update(deltaTime)
        if (this.checkCollision(explosion, this.player)) {
          explosion.onContact(this.player)
          }
      if (explosion.markedForDeletion) {
        this.enemyExplosions.splice(this.enemyExplosions.indexOf(explosion), 1)
      }
    })

    // player projectiles
    this.playerProjectiles.forEach(projectile => {
      projectile.update(deltaTime)
      this.enemies.forEach(enemy => {
        if (this.checkCollision(projectile, enemy)) {
            projectile.onHit(enemy)
          }
        }
      )
      if (projectile.markedForDeletion) {
        this.playerProjectiles.splice(this.playerProjectiles.indexOf(projectile), 1)
      }
    })

    if(this.currentInputs.includes("x"))  this.powerups.push(this.randomPowerup(this, 1700, randomInt(1700,0), 100, 100))//this.enemies.push(this.randomEnemy(this, chance(0.3))) //this.particles.push(new Explosion(this.game, 1700, randomInt(1300, 0), 50, 50, -1, 0, 500)) //this.background.asteroidTimer += 50000


    // menu specific
    if (this.gameState == "mainmenu") {
      this.mainMenuUI.update(deltaTime)
    }

    else if (this.gameState == "ingame") {
      this.ingameUI.update(deltaTime)
      this.spawnAccelerationTimer += deltaTime
      if (this.spawnAccelerationTimer >= this.spawnAccelerationInterval) {
        this.spawnAcceleration *= 1.05
        this.spawnAccelerationTimer = 0
      }
      if(this.bossTimer >= this.bossInterval) {
        this.enemies.push(new Boss(this))
        this.bossTimer = 0
      }
      if(this.spawnEnemies)this.bossTimer += deltaTime
      //enemies
      this.enemySpawnTimer += deltaTime * this.spawnAcceleration
      if (this.enemySpawnTimer >= this.enemySpawnInterval && this.spawnEnemies) {
        this.enemies.push(this.randomEnemy(this, chance(0.3)))
        this.enemySpawnTimer = 0
      }
      this.enemies.forEach(enemy => {
        enemy.update(deltaTime)
        if (this.checkCollision(enemy, this.player)) {
          this.player.takeDamage(enemy.collisionDamage, false)
          if(enemy.boss == false) {
            enemy.markedForDeletion = true
            this.particles.push(new Explosion(this, enemy.x + enemy.width/4, enemy.y + enemy.height/2, enemy.width, enemy.height, enemy.speedX * enemy.speedMultiplier / 10, 0, null))
          }
        }
        if (enemy.markedForDeletion) {
          this.enemies.splice(this.enemies.indexOf(enemy), 1)
        }
      })
  
      //enemy projectiles
      this.enemyProjectiles.forEach(projectile => {
        projectile.update(deltaTime)
        if(this.checkCollision(projectile, this.player)) {
          projectile.onHit(this.player)
          projectile.markedForDeletion = true
        }
        if (projectile.markedForDeletion) {
          this.enemyProjectiles.splice(this.enemyProjectiles.indexOf(projectile), 1)
        }
      })

      //powerups
      this.powerups.forEach(powerup => {
        powerup.update(deltaTime)
        if(this.checkCollision(powerup, this.player)) {
          if(this.collectedPowerups.length <= 1) {
            if(this.collectedPowerups.length == 0) powerup.slot = 1
            else powerup.slot = 2
            powerup.onPickup()
            this.collectedPowerups.push(powerup)
            this.powerups.splice(this.powerups.indexOf(powerup), 1)
          }
        }
        if(powerup.markedForDeletion == true) {
          this.powerups.splice(this.powerups.indexOf(powerup), 1)
        }
      })

      this.collectedPowerups.forEach(powerup => {
        powerup.update(deltaTime)
        if(this.collectedPowerups.length == 1) powerup.slot = 1
        if(powerup.markedForDeletion == true) {
          this.collectedPowerups.splice(this.collectedPowerups.indexOf(powerup), 1)
        }
      })
    }

    else if(this.gameState == "levelup") {
      this.levelUpUI.update(deltaTime)
    }
    else if (this.gameState == "gameover") {
      this.gameOverUI.update(deltaTime)
    }

    //end menu specific
  }
  
  draw(ctx) {
    this.background.draw(ctx)
    
    
    this.player.draw(ctx)
  
    
    this.playerProjectiles.forEach(projectile => {
      projectile.draw(ctx)
    })
    
    this.enemies.forEach(enemy => {
      enemy.draw(ctx)
    })
    
    this.enemyProjectiles.forEach(projectile => {
      projectile.draw(ctx)
    })
    
    this.powerups.forEach(powerup => {
      powerup.draw(ctx)
    })

    this.particles.forEach(particle => {
      particle.draw(ctx)
    })

    this.playerExplosions.forEach(explosion => {
      explosion.draw(ctx)
    })

    this.enemyExplosions.forEach(explosion => {
      explosion.draw(ctx)
    })
    
    this.collectedPowerups.forEach(powerup => {
      powerup.draw(ctx)
    })

    if (this.gameState == "mainmenu") {
      this.mainMenuUI.draw(ctx)
    }
    else if (this.gameState == "ingame") {
      this.ingameUI.draw(ctx)
    }
    else if(this.gameState == "levelup") {
      this.levelUpUI.draw(ctx)
    }
    else if (this.gameState == "gameover") {
      this.gameOverUI.draw(ctx)
    }

    this.background.foregroundLayers.forEach(layer => {
      layer.draw(ctx)
    })
  }

  checkCollision(object1, object2) {
    return (object1.x < object2.x + object2.width &&
            object1.x + object1.width > object2.x &&
            object1.y < object2.y + object2.height &&
            object1.height + object1.y > object2.y)
  }

  randomEnemy(game, shooting) {
    let random = Math.random()
    if (random < 0.35) {
      return new Tank(game, shooting)
    } else if (random < 0.60) {
      return new Speeder(game, shooting)
    } else {
      return new Ship(game, shooting)
    }
  }

  randomPowerup(game, x, y, width, height) {
    let numberOfPowerups = 7
    let random = Math.random()
    if (random < 1/numberOfPowerups) {
      return new InvincibilityPowerup(game, x, y, width, height)
    }
    else if (random <= 2/numberOfPowerups) {
      return new AmmoPowerup(game, x, y, width, height)
    }
    else if (random <= 3/numberOfPowerups) {
      return new DamagePowerup(game, x, y, width, height)
    }
    else if (random <= 4/numberOfPowerups) {
      return new HealthPowerup(game, x, y, width, height)
    }
    else if (random <= 5/numberOfPowerups) {
      return new SpeedPowerup(game, x, y, width, height)
    }
    else if (random <= 6/numberOfPowerups) {
      return new BulletPowerup(game, x, y, width, height)
    }
    else if (random <= 7/numberOfPowerups) {
      return new ExplosivePowerup(game, x, y, width, height)
    }
  }

  startNewGame(){
    game = new Game(canvas.width, canvas.height)
  }

  checkForActivePowerup(name) {
    let returnVal = false
    this.collectedPowerups.forEach(powerup => {
      if(powerup.activated == true && powerup.name == name ) returnVal = true
      })
    return returnVal
  }
}

let game

window.addEventListener("load", function() {
  game = new Game(canvas.width, canvas.height)
  let lastTime = 0
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime
    lastTime = timeStamp
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    game.update(deltaTime)
    game.draw(ctx)
    requestAnimationFrame(animate)
  }
  animate(0)
})