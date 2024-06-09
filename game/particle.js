import { explosion1Sprite, explosion2Sprite, explosion3Sprite, explosion4Sprite } from "./assets.js"

export class Particle {
    constructor(game, x, y, width, height, speedX, speedY, color, lifeTime) {
        this.game = game
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.speedX = speedX
        this.speedY = speedY
        this.color = color
        this.lifeTime = lifeTime
        this.markedForDeletion = false
    }

    update(deltaTime) {
        this.x += this.speedX * deltaTime
        this.y += this.speedY * deltaTime
        if (this.lifeTime <= 0) this.markedForDeletion = true
        else this.lifeTime -= deltaTime
    }

    draw(ctx) {
        ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, this.width, this.height)
    }
}

export class Explosion extends Particle {
    constructor(game, x, y, width, height, speedX, speedY, damage, hitTarget, playerExplosion = false, lifeTime=500) {
        super(game, x, y, width, height, speedX, speedY, null, lifeTime)
        this.damage = damage
        this.playerExplosion = playerExplosion
        this.targetsHit = [hitTarget]
        this.frameInterval = lifeTime / 4
        this.x = this.x - this.width/2
        this.y = this.y - this.height/2
    }

    draw(ctx) {
        if(this.game.currentInputs.includes("f")) {
            ctx.fillStyle = "orange"
            ctx.fillRect(this.x, this.y, this.width, this.height)
        }
        if (this.lifeTime >= this.frameInterval*3) ctx.drawImage(explosion1Sprite, this.x, this.y, this.width, this.height)
        else if (this.lifeTime >= this.frameInterval*2) ctx.drawImage(explosion2Sprite, this.x, this.y, this.width, this.height)
        else if (this.lifeTime >= this.frameInterval*1) ctx.drawImage(explosion3Sprite, this.x, this.y, this.width, this.height)
        else ctx.drawImage(explosion4Sprite, this.x, this.y, this.width, this.height)
    }

    onContact(target) {
        if (!this.targetsHit.includes(target)) {
            target.takeDamage(this.damage, false)
            this.targetsHit.push(target)
        }
    }
}

export class NumberParticle extends Particle {
    constructor(game, x, y, size, speedX, speedY, color, lifeTime, text) {
        super(game, x, y, null, null, speedX, speedY, color, lifeTime)
        this.text = text
        this.size = size
    }

    update(deltaTime) {
        super.update(deltaTime)
        this.y -= 0.08 * deltaTime
    }

    draw(ctx) {
        ctx.font = this.size + "px Dashhorizon"
        ctx.fillStyle = this.color
        ctx.fillText(this.text, this.x, this.y)
    }
} 