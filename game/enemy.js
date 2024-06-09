import { enemyShipSprite, enemyTankSprite, enemySpeederSprite, enemyBossSprite, enemyExplosiveProjectileSprite, enemyProjectileSprite, exclamationPointSprite, enemyShieldSprite } from "./assets.js"
import { randomInt, canvas } from "./game.js"
import { Projectile, ExplosiveProjectile, BouncingProjectile } from "./projectile.js"
import { NumberParticle, Explosion } from "./particle.js"

export class Enemy {
    constructor(game, shooting, hp = randomInt(200,50), projectileDamage = 25, collisionDamage = 50) {
        this.game = game
        this.height = 190
        this.width = 120
        this.x = 1750
        this.y = randomInt(canvas.height - this.height-50, 0)
        this.speedX = -1
        this.speedY = 0
        this.speedMultiplier = Math.random() * 2 + 0.1
        this.shooting = shooting
        this.ammo = randomInt(10,3)
        this.shotTimer = 1000
        this.shotInterval = randomInt(1000,250) // in ms
        this.shotSpeed = this.speedX * this.speedMultiplier - 0.35
        this.projectileWidth = 100
        this.projectileHeight = 30
        this.projectileDamage = projectileDamage
        this.collisionDamage = collisionDamage
        this.health = hp
        this.maxHealth = hp
        this.invincible = false
        this.dropchance = 0.1
        this.markedForDeletion = false
        this.score = 20
        this.sprite = enemyShipSprite
        this.boss = false
    }
    
    update(deltaTime) {
        this.x += this.speedX * this.speedMultiplier * deltaTime
        this.y += this.speedY * this.speedMultiplier * deltaTime
        if (this.x + this.width < 0) this.markedForDeletion = true
        this.shotTimer += deltaTime
        if (this.shotTimer >= this.shotInterval) {
            this.shoot()
            this.shotTimer = 0
        }
        }
    
        draw(ctx) {
        if(this.game.currentInputs.includes("f")) {
            ctx.fillStyle = "red"
            ctx.fillRect(this.x, this.y, this.width, this.height)
        }
        ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height)
        
        //hp bar
        ctx.fillStyle = "red"
        ctx.fillRect(this.x, this.y - 30, this.width * (this.health / this.maxHealth), 10)
    }

    shoot() {
        if(this.shooting && this.ammo > 0) {
            this.game.enemyProjectiles.push(new Projectile(this.game, enemyProjectileSprite, this.x - this.projectileWidth - 0.1, this.y + this.height / 2  - this.projectileHeight/2, this.projectileWidth, this.projectileHeight, this.shotSpeed, this.projectileDamage))
            this.ammo --
        }
    }

    takeDamage(damage, bullet = true) {
        if(this.invincible == false && this.x < 1650) {
            this.health -= damage
            if(this.health <= 0) this.destory()
            if(bullet == false)this.game.particles.push(new NumberParticle(this.game, this.x + this.width/2 - 20, this.y - 10, 75, 0, 0, "lightblue", 300, damage))
        }
    }

    destory() {
        this.game.score += this.score
        this.game.particles.push(new Explosion(this.game, this.x + this.width/4, this.y + this.height/2, this.width, this.height, this.speedX * this.speedMultiplier / 10, 0, null))
        if(Math.random() <= this.dropchance) this.game.powerups.push(this.game.randomPowerup(this.game, this.x, this.y, 100, 100))
        this.markedForDeletion = true
    }
}

export class Ship extends Enemy {
    constructor(game, shooting, hp = 125, projectileDamage = 25, collisionDamage = 50) {
        super(game, shooting, hp, projectileDamage, collisionDamage)
        this.height = 160
        this.width = 160
        this.speedMultiplier = Math.random() * 2 + 0.15
        this.shotSpeed = this.speedX * this.speedMultiplier - 0.25
        this.dropchance = 0.2  
        this.score = 25
        this.sprite = enemyShipSprite
    }
}

export class Speeder extends Enemy {
    constructor(game, hp = 60, projectileDamage = 15, collisionDamage = 25, dropchance = 0.2, invincible = true) {
        super(game, null, hp, projectileDamage, collisionDamage)
        this.height = 100
        this.width = 160
        this.invincible = invincible
        this.y = this.game.player.y
        this.speedMultiplier = (Math.random() + 0.35) * 3
        this.shotSpeed = this.speedX * this.speedMultiplier - 0.25
        this.dropchance = dropchance
        this.score = 20
        this.timer = 0
        this.timerInterval = 500
        this.sprite = enemySpeederSprite
        this.shield = {
            x : this.x - 30,
            y : this.y - 25,
            width : this.width/8*2,
            height : this.height+50,
        }
    }

    update(deltaTime) {
        if(this.timer <= this.timerInterval)  this.timer += deltaTime
        else super.update(deltaTime)
        if(this.invincible) {
            this.shield = {
                x : this.x - 45,
                y : this.y - 25,
                width : this.width/8*3,
                height : this.height+50,
            }
            this.game.playerProjectiles.forEach(projectile => {
                if (this.game.checkCollision(projectile, this.shield)) {
                    projectile.markedForDeletion = true
                    if(projectile.explosive) projectile.onHit(null)
                    this.game.particles.push(new NumberParticle(this.game, this.x, this.y, 50, this.speedX * this.speedMultiplier, this.speedY * this.speedMultiplier, "yellow", 500, "shielded"))

                }
            })
        }
    }

    draw(ctx) {
        super.draw(ctx)
        if(this.timer < this.timerInterval) ctx.drawImage(exclamationPointSprite, 100, this.y + this.height/2 - 60, 40, 120)
        if(this.invincible) {
            ctx.drawImage(enemyShieldSprite, this.x - 45, this.y - 25, this.width/8*3, this.height+50)
            if(this.game.currentInputs.includes("f")) {
                ctx.fillStyle = "white"
                ctx.fillRect(this.shield.x, this.shield.y, this.shield.width, this.shield.height)
            }
        }
    }
}

export class Tank extends Enemy {
    constructor(game, shooting, hp = 200,  projectileDamage = 35, collisionDamage = 75) {
        super(game, shooting, hp, projectileDamage, collisionDamage)
        this.height = 256
        this.width = 256
        this.speedMultiplier = Math.random() + 0.01
        this.shotSpeed = this.speedX * this.speedMultiplier - 0.25
        this.dropchance = 0.35
        this.score = 35
        this.sprite = enemyTankSprite
    }
}

export class Boss extends Enemy {
        constructor(game, hp=5000, projectileDamage = 50, collisionDamage = 100) {
        super(game, false, hp, projectileDamage, collisionDamage)
        this.height = 56 * 9
        this.width = 52 * 9
        this.invincible = false
        this.speedMultiplier = Math.random() + 0.01
        this.shotSpeed = this.speedX * this.speedMultiplier - 0.25
        this.dropchance = 0.5
        this.score = 350
        this.sprite = enemyBossSprite
        this.boss = true
        this.phase = 0
        this.shotInterval = 3000
        this.speedMultiplier = 0.5
        this.y = canvas.height / 2 - this.height / 2
        this.health = this.maxHealth * 1
        this.game.spawnEnemies = false
        this.shotSpeed = -0.5
    }

    update(deltaTime) {
        this.x += this.speedX * this.speedMultiplier * deltaTime
        this.y += this.speedY * this.speedMultiplier * deltaTime
        this.shotTimer += deltaTime
        if(this.y >= canvas.height - this.height - 50 || this.y <= 100) this.speedY *= -1
        if(this.phase == 0) {
            if(this.x <= 1150) {
            this.phase = 1
            this.speedX = 0
            this.speedY = 1
            this.shotInterval = 1500 
            this.shoot()
            }
        }
        else if(this.phase == 1) {
            if (this.shotTimer >= this.shotInterval) {
            this.shoot()
            this.shotTimer = 0
            }
            if(this.health <= this.maxHealth * 0.75) {
            this.phase = 2
            this.shotInterval = 1500
            }
        }
        else if(this.phase == 2) {
            if (this.shotTimer >= this.shotInterval) {
            this.shoot()
            this.shotTimer = 0
            }
            if(this.health <= this.maxHealth * 0.5) {
            this.phase = 3
            this.shotInterval = 2500
            }
        }
        else if(this.phase == 3) {
            if (this.shotTimer >= this.shotInterval) {
            this.shoot()
            this.shotTimer = 0
            }
            if(this.health <= this.maxHealth * 0.35) {
            this.phase = 4
            this.shotInterval = 1500
            }
        }
        else if(this.phase == 4) {
            if (this.shotTimer >= this.shotInterval) {
            this.shoot()
            this.shotTimer = 0
            }
            if(this.health <= this.maxHealth * 0.15) {
            this.phase = 5
            this.shotInterval = 2200
            this.shotspeed = -0.2
            }
        }
        else if(this.phase == 5) {
            if (this.shotTimer >= this.shotInterval) {
            this.shoot()
            this.shotTimer = 0
            }
        }
    }    

    draw(ctx) {
        super.draw(ctx)
    }

    shoot() {
        if(this.phase == 1 || this.phase == 5) {
            this.game.enemyProjectiles.push(new BouncingProjectile(this.game, enemyProjectileSprite, this.x - this.projectileWidth - 0.1, this.y + this.height / 2 - this.projectileHeight/2, this.projectileWidth, this.projectileHeight, this.shotSpeed, this.projectileDamage, -this.shotSpeed*2))
            this.game.enemyProjectiles.push(new BouncingProjectile(this.game, enemyProjectileSprite, this.x - this.projectileWidth - 0.1, this.y + this.height / 2 - this.projectileHeight/2, this.projectileWidth, this.projectileHeight, this.shotSpeed, this.projectileDamage, this.shotSpeed*2))
        }
        if(this.phase >= 3 ) {
            this.game.enemies.push(new Speeder(this.game, 50, 15, 25, 0.4, false))
        }
    
        if(this.phase != 1 && this.phase != 5) {
            let angle_to_player = (this.game.player.y - this.y) / 2000 //dont ask
            this.game.enemyProjectiles.push(new ExplosiveProjectile(this.game, enemyExplosiveProjectileSprite, this.x - this.projectileWidth - 0.1, this.y + this.height / 2 - this.projectileHeight/2, 100, 50, this.shotSpeed, this.projectileDamage,250, angle_to_player, false, true))
        }
    }

    destory() {
        this.game.spawnEnemies = true
        this.markedForDeletion = true
        this.game.score += this.score
        if(this.game.player.health < 200) this.game.player.health = 200
        //this.game.gameState = "levelup"
        this.game.enemies = []
        this.game.enemyProjectiles = []
        this.game.playerProjectiles = []

        this.game.collectedPowerups.forEach(powerup => {
            if (powerup.activated) powerup.endEffect()
        })
    }
}
