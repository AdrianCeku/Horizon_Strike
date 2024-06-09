import { canvas } from "./game.js"
import { Explosion, NumberParticle } from "./particle.js"

export class Projectile {
    constructor(game, sprite, x, y, width, height, speed, damage, playerProjectile = false) {
        this.game = game
        this.sprite = sprite
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.speedX = speed
        this.damage = damage
        this.playerProjectile = playerProjectile
        this.markedForDeletion = false
    }

    update(deltaTime) {
        this.x += this.speedX * deltaTime
        if (this.x + this.width < 0 || this.x + this.width > 1700 ) this.markedForDeletion = true
    }

    draw(ctx) {
        if(this.game.currentInputs.includes("f")) {
            ctx.fillStyle = "green"
            ctx.fillRect(this.x, this.y, this.width, this.height)
        } 
        if(this.playerProjectile) {
            ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height)
        }
        else {
            ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height)
        }
    }

    onHit(target) {
        if (this.playerProjectile) this.game.particles.push(new Explosion(this.game, this.x + this.width, this.y + this.height/2, 70, 70, target.speedX * target.speedMultiplier, target.speedY * target.speedMultiplier, 0, target, false, 200))
        else this.game.particles.push(new Explosion(this.game, this.x - this.width, this.y + this.height/2, 70, 70, 0, 0, 0, target, false, 200))
        
        if (target.invincible) {
            if(this.playerProjectile)this.game.particles.push(new NumberParticle(this.game, this.x + this.width, this.y + this.height/2 - 20, 50, target.speedX * target.speedMultiplier, target.speedY * target.speedMultiplier, "yellow", 300, "shielded"))
            else this.game.particles.push(new NumberParticle(this.game, this.x + this.width, this.y + this.height/2 - 20, 50, 0 , 0 , "yellow", 300, "shielded"))
        }
        else if(this.playerProjectile)this.game.particles.push(new NumberParticle(this.game, this.x + this.width, this.y + this.height/2 - 20, 50, target.speedX * target.speedMultiplier, target.speedY * target.speedMultiplier, "lightblue", 300, this.damage))
        else this.game.particles.push(new NumberParticle(this.game, this.x + this.width, this.y + this.height/2 - 20, 50, 0, 0, "red", 300, this.damage))
        this.markedForDeletion = true
        target.takeDamage(this.damage)
    }
}

export class BouncingProjectile extends Projectile {
    constructor(game, sprite, x, y, width, height, speed, damage, speedY, playerProjectile = false) {
        super(game, sprite, x, y, width, height, speed, damage, playerProjectile)
        this.speedY = speedY
        this.padding = 50
    }

    update(deltaTime) {
        super.update(deltaTime)
        this.y += this.speedY * deltaTime
        if (this.y + this.height + this.padding > canvas.height || this.y < 0 + this.padding) this.speedY *= -1
    }
}
export class ExplosiveProjectile extends BouncingProjectile {
    constructor(game, sprite, x, y, width, height, speed, damage, explosionSize, SpeedY = 0, playerProjectile = false, delayedExplosion = false,) {
        super(game, sprite, x, y, width, height, speed, damage, SpeedY, playerProjectile)
        this.explosionSize = explosionSize
        this.delayedExplosion = delayedExplosion
        this.explosive = true
    }

    update(deltaTime) {
        super.update(deltaTime)
        if(this.x >= 1300 && this.playerProjectile && this.delayedExplosion) this.onHit(null)
        if(this.x >= 1300 && this.playerProjectile && this.delayedExplosion) this.onHit(null)
        if(this.x <= 100 && !this.playerProjectile) this.onHit(null)
    }

    draw(ctx) {
        if(this.delayedExplosion) {
            ctx.fillStyle = "red"
            ctx.fillRect(this.x - this.detectionRange/2 + this.width/2, this.y - this.detectionRange/2 + this.height/2, this.detectionRange, this.detectionRange)
        }
        super.draw(ctx)
    }

    onHit(target) {
        if(this.playerProjectile) {
            this.game.playerExplosions.push(new Explosion(this.game, this.x + this.width, this.y + this.height/2, this.explosionSize, this.explosionSize, 0, 0, this.damage, target, true, 400))
            if(target != null) {
                if (target.invincible)this.game.particles.unshift(new NumberParticle(this.game, this.x + this.width, this.y + this.height/2 - 20, 50, target.speedX * target.speedMultiplier, target.speedY * target.speedMultiplier, "yellow", 300, "shielded"))
                else this.game.particles.unshift(new NumberParticle(this.game, this.x + this.width, this.y + this.height/2 - 20, 50, target.speedX * target.speedMultiplier, target.speedY * target.speedMultiplier, "lightblue", 300, this.damage))
            }
        }
        else {
            this.game.enemyExplosions.push(new Explosion(this.game, this.x + this.width, this.y + this.height/2, this.explosionSize, this.explosionSize, 0, 0, this.damage, target, false, 300))
            if (target != null) {
                if (target.invincible == true) this.game.particles.unshift(new NumberParticle(this.game, this.x + this.width, this.y + this.height/2 - 20, 50, 0, 0, "yellow", 300, "shielded"))
                else this.game.particles.unshift(new NumberParticle(this.game, this.x + this.width, this.y + this.height/2 - 20, 50, 0, 0, "red", 300, this.damage))
            }
        }
        if (target != null)target.takeDamage(this.damage)
        this.markedForDeletion = true
    }
}