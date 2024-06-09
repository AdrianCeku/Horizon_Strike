import {playerShieldSprite, powerupHealthSprite, powerupInvincibleSprite, powerupAmmoSprite, powerupDamageSprite, powerupSpeedSprite, powerupExplosiveSprite, powerupBulletSprite} from "./assets.js"
import { NumberParticle } from "./particle.js"

export class Powerup {
    constructor(game, x, y, width, height, color) {
        this.game = game
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.speed = -0.5
        this.color = color
        this.durationTimer = 0
        this.duration = 1000
        this.pickedUp = false
        this.activated = false
        this.slot = 0
        this.showText = false
        this.name = "Powerup"
        this.markedForDeletion = false
        this.sprite = powerupHealthSprite
    }
    update(deltaTime) {
        if(this.pickedUp == false){ 
            this.x += this.speed * deltaTime
            if (this.x + this.width < 0 || this.x - this.width > 1700 ) this.markedForDeletion = true
        }
        if(this.game.currentInputs.includes("2") && this.pickedUp == true && this.activated != true && this.slot == 2) this.startEffect()
        else if(this.game.currentInputs.includes("1") && this.pickedUp == true && this.activated != true && this.slot == 1) this.startEffect()
        if(this.activated == true) {
            this.durationTimer += deltaTime
            if (this.durationTimer >= this.duration){
            this.endEffect()
            }
        }
    
        }
    
        draw(ctx) {
        ctx.fillStyle = this.color
        ctx.font = "100px dashhorizon"
        if(this.pickedUp == true) {
            if(this.slot == 1) ctx.drawImage(this.sprite, 60, 320, 75, 75)
            if(this.slot == 2) ctx.drawImage(this.sprite, 175, 320, 75, 75)
        }
        else if(this.activated == false){
            ctx.drawImage(this.sprite, this.x, this.y, this.height, this.width)
        }
        if(this.showText == true) {
            if(this.slot == 1) ctx.fillText(this.name, 550, 100)
            if(this.slot == 2) ctx.fillText(this.name, 550, 200)
        }
    }

    onPickup() {
        this.pickedUp = true
    }
    
    startEffect() {
        this.activated = true
        this.showText = true
    }
    
    endEffect() {
        this.markedForDeletion = true
    }
}

export class InvincibilityPowerup extends Powerup {
    constructor(game, x, y, width, height) {
        super(game, x, y, width, height, "gold")
        this.duration = 4500
        this.name = "Invincibility"
        this.sprite = powerupInvincibleSprite
        this.shield = {
            x : this.game.player.x + this.game.player.width,
            y : this.game.player.y - 25,
            width : this.game.player.width/8*2,
            height : this.game.player.height+50
        }
    }

    update(deltaTime) {
        super.update(deltaTime)
        if(this.activated == true) {
            this.shield = {
            x : this.game.player.x + this.game.player.width,
            y : this.game.player.y - 25,
            width : this.game.player.width/8*2,
            height : this.game.player.height+50
            }
            this.game.enemies.forEach(enemy => {
                if(this.game.checkCollision(this.shield, enemy)) {
                    if (enemy.boss == false) enemy.markedForDeletion = true
                    this.game.particles.push(new NumberParticle(this.game, this.game.player.x + this.game.player.width/2 - 20, this.game.player.y - 10, 50, 0, 0, "yellow", 500, "shielded"))
                }
            })
            this.game.enemyProjectiles.forEach(projectile => {
                if(this.game.checkCollision(this.shield, projectile)) {
                    projectile.markedForDeletion = true
                    this.game.particles.push(new NumberParticle(this.game, this.game.player.x + this.game.player.width/2 - 20, this.game.player.y - 10, 50, 0, 0, "yellow", 500, "shielded"))
            }
            })
        }
    }

    draw(ctx) {
        super.draw(ctx)
        if(this.activated) {
            ctx.drawImage(playerShieldSprite, this.game.player.x + this.game.player.width, this.game.player.y - 25, this.game.player.width/8*2, this.game.player.height+50)
            if(this.game.currentInputs.includes("f")) {
                ctx.fillStyle = "white"
                ctx.fillRect(this.shield.x, this.shield.y, this.shield.width, this.shield.height)
            }
        }
    }
    startEffect() {
        super.startEffect()
        this.game.player.invincible = true
    }

    endEffect() {
        super.endEffect()
        this.game.player.invincible = false
    }
}
export class AmmoPowerup extends Powerup {
    constructor(game, x, y, width, height) {
        super(game, x, y, width, height, "turquoise")
        this.duration = 7500
        this.name = "Unlimited Ammo"
        this.sprite = powerupAmmoSprite
    }

    startEffect() {
        super.startEffect()
        this.game.player.unlimitedAmmo = true
    }

    endEffect() {
        super.endEffect()
        this.game.player.unlimitedAmmo = false
    }
}

export class DamagePowerup extends Powerup {
        constructor(game, x, y, width, height) {
        super(game, x, y, width, height, "red")
        this.duration = 10000
        this.name = "Double Damage"
        this.sprite = powerupDamageSprite
    }

    startEffect() {
        super.startEffect()
      this.game.player.damage *= 2
    }

    endEffect() {
        super.endEffect()
        this.game.player.damage /= 2
    }
}

export class SpeedPowerup extends Powerup {
    constructor(game, x, y, width, height) {
        super(game, x, y, width, height, "blue")
        this.duration = 15000
        this.name = "Speed Boost"
        this.sprite = powerupSpeedSprite
    }

    startEffect() {
        super.startEffect()
        this.game.player.speedMultiplier *= 1.5
    }

    endEffect() {
        super.endEffect()
        this.game.player.speedMultiplier /= 1.5
        }
}

export class HealthPowerup extends Powerup {
    constructor(game, x, y, width, height) {
        super(game, x, y, width, height, "red")
        this.duration = 200
        this.name = "Health Boost"
        this.sprite = powerupHealthSprite
    }

    startEffect() {
        super.startEffect()
        this.game.player.health += 50
    }
}

export class BulletPowerup extends Powerup {
    constructor(game, x, y, width, height) {
        super(game, x, y, width, height, "green")
        this.duration = 5500
        this.name = "Bouncing Bullets"
        this.sprite = powerupBulletSprite
    }

    startEffect() {
        super.startEffect()
        this.game.player.bouncingBullets = true
    }

    endEffect() {
        super.endEffect()
        this.game.player.bouncingBullets = false
    }
}

export class ExplosivePowerup extends Powerup {
    constructor(game, x, y, width, height) {
        super(game, x, y, width, height, "orange")
        this.duration = 5500
        this.name = "Explosive Bullets"
        this.sprite = powerupExplosiveSprite
        this.oldShotInterval = this.game.player.shotInterval
    }

    startEffect() {
        super.startEffect()
        this.game.player.explosiveBullets = true
        this.game.player.shotInterval *= 2
    }

    endEffect() {
        super.endEffect()
        this.game.player.explosiveBullets = false
        this.game.player.shotInterval *= 0.5
    }
}