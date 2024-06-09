import { randomInt, canvas } from "./game.js"
import { cloudsSprite } from "./assets.js"
import { Particle } from "./particle.js"

export class Layer {
    constructor(game, sprite, speedMultiplier, width, height, sparkling = false, sparkleInterval = 500, sparkleSize = 5, sparkleColor = "white" ) {
        this.game = game  
        this.sprite = sprite
        this.speed = 1 
        this.speedMultiplier = speedMultiplier
        this.width = width
        this.height = height
        this.x = 1700
        this.y = randomInt(canvas.height - this.height, 0)
        this.markedForDeletion = false
    }
    
    update(deltaTime) {
        this.x -= this.speed * this.speedMultiplier * deltaTime
        if (this.x + this.width < 0) this.markedForDeletion = true
    }
    
    draw(ctx) {
        ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height)
    }
}

export class CloudLayer extends Layer {
    constructor(game, speedMultiplier, width, height, x) {
        super(game, cloudsSprite, speedMultiplier, width, height, false)
        this.x = x
    }

    update(deltaTime) {
        this.x -= this.speed * this.speedMultiplier * deltaTime
        if (this.x + this.width <= 0) this.x = 1699
    }
}

export class SparklingLayer extends Layer {
    constructor(game, sprite, speedMultiplier, width, height, sparkling = true, sparkleInterval = 25, sparkleSize = 4, sparkleColor = "white" ) {
        super(game, sprite, speedMultiplier, width, height)
        this.sparkling = sparkling
        this.sparkleTimer = 0
        this.sparkleInterval = sparkleInterval
        this.sparkleSize = sparkleSize
        this.sparkleColor = sparkleColor
        this.layerParticles = []
        this.bg_color = false
    }

    update(deltaTime) {
        this.x -= this.speed * this.speedMultiplier * deltaTime
        if (this.x + this.width < 0) this.markedForDeletion = true
        if (this.sparkling){ 
            if (this.sparkleTimer >= this.sparkleInterval) {
            this.sparkleTimer = 0
            this.sparkle()
            }
            this.sparkleTimer += deltaTime
        }
        this.layerParticles.forEach(particle => {
            particle.update(deltaTime)
            if(particle.markedForDeletion) this.layerParticles.splice(this.layerParticles.indexOf(particle), 1)
        })
    }

    sparkle() {
        this.layerParticles.push(new Particle(this.game, randomInt(this.x,this.x - this.width), randomInt(this.y, this.y + this.height), this.sparkleSize, this.sparkleSize, 0, 0, this.sparkleColor, 5000))
    }
}

export class BackgroundColor extends SparklingLayer {
    constructor(game, color) {
        super(game, null, 0, canvas.width, canvas.height, true, 15, 4, "white")
        this.color = color
        this.x = 0
        this.y = 0
    }

    draw(ctx) {
        ctx.fillStyle = this.color
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    sparkle() {
        this.game.background.backgroundParticles.push(new Particle(this.game, randomInt(canvas.width, 0), randomInt(canvas.height, 0), this.sparkleSize, this.sparkleSize, 0, 0, this.sparkleColor, 500))
    }
}