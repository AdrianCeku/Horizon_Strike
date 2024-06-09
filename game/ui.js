import { playerExplosiveProjectileSprite, greyExplosiveProjectileSprite } from "./assets.js"

export class UI {
    constructor(game) {
        this.game = game
        this.fontSize = 100
        this.fontFamily = "dashhorizon"
        this.color = "white"
        this.blinking = false
        this.blinkTimer = 0
        this.blinkInterval = 700
        this.visible = true
    }
    update(deltaTime) {
        this.fps = Math.round(1000/deltaTime)
        if (this.blinking) {
            this.blinkTimer += deltaTime
            if (this.blinkTimer >= this.blinkInterval) {
                this.blinkTimer = 0
                if (this.visible == false) this.visible = true
                else this.visible = false
            }
        }
    }
    draw(ctx) {
        ctx.fillStyle = this.color
        ctx.font = this.fontSize + "px " + this.fontFamily
        if (this.game.currentInputs.includes("f")) {
            ctx.font = "75px " + this.fontFamily
            ctx.fillText("FPS: " + this.fps, 70, 1220)
            ctx.fillText("EPS: " + Math.round(this.game.spawnAcceleration/2*100)/100, 350, 1220)
            ctx.fillText("APS: " + Math.round(1000/this.game.player.ammoInterval*100)/100, 650, 1220)
            ctx.fillRect(1650, 0, 150, 1300)
            ctx.font = this.fontSize + "px " + this.fontFamily
        }
    }
}
export class MainMenuUI extends UI {
    constructor(game) {
        super(game)
        this.fontSize = 150
        this.fontFamily = "dashhorizon"
        this.color = "white"
        this.blinking = true
    }
    update(deltaTime) {
        super.update(deltaTime)
        if(this.game.currentInputs.includes("enter")) {
            this.game.gameState = "ingame"
            this.game.player.unlimitedAmmo = false
            this.game.gameTime = 0
        }
    }
    draw(ctx) {
        ctx.font = "200px " + this.fontFamily
        ctx.fillStyle = "yellow"
        ctx.fillText("Horizon    Strike", 300, 300)
        super.draw(ctx)
        if (this.visible == true) ctx.fillText("Press Enter to Start", 300, 1100)
    }
}
export class IngameUI extends UI {
    constructor(game) {
        super(game)
        this.fontSize = 100
        this.fontFamily = "dashhorizon"
        this.color = "white"
        this.blinking = true
    }
    update(deltaTime) {
        super.update(deltaTime)
    }
    draw(ctx) {
        super.draw(ctx)
        //ctx.drawImage(UISprite,35,10, 70*10,35*10)
        ctx.fillText("Health: " + Math.ceil(this.game.player.health), 50, 100)
        ctx.fillText("Ammo: " + this.game.player.currentAmmo, 50, 200)
        
        for(let i = 0; i < this.game.player.maxRocketAmmo; i++) {
            ctx.drawImage(greyExplosiveProjectileSprite, 60 + i*55, 235, 50, 50)
        }
        for(let i = 0; i < this.game.player.currentRocketAmmo; i++) {
            ctx.drawImage(playerExplosiveProjectileSprite, 60 + i*55, 235, 50, 50)
        }
        ctx.fillRect(60, 300, this.game.player.rocketTimer/this.game.player.rocketInterval*273, 5)

        ctx.fillText("Time: " + Math.round(this.game.gameTime/1000) + "s", 1150, 100)
        ctx.fillText("Score: " + this.game.score, 1150, 200)
        
        if(this.game.bossInterval - this.game.bossTimer <= 5000) {
            if(this.visible){
                ctx.fillStyle = "red"
                ctx.font = "200px " + this.fontFamily
                ctx.fillText("Boss Incoming", 350, 1150)
            }
        }
    }
}

export class GameOverUI extends UI {
    constructor(game) {
        super(game)
        this.fontSize = 150
        this.fontFamily = "dashhorizon"
        this.color = "white"
        this.blinking = true
    }
    update(deltaTime) {
        super.update(deltaTime)
        if(this.game.currentInputs.includes("enter")) {
            this.game.startNewGame()
    }
    }
    draw(ctx) {
        ctx.font = "250px " + this.fontFamily
        ctx.fillStyle = "red"
        ctx.fillText("Game Over", 400, 300)
        super.draw(ctx)
        ctx.fillText("Score: " + this.game.score, 450, 600)
        ctx.fillText("Time: " + Math.round(this.game.endTime / 1000) + "s", 450, 750)
        if (this.visible == true) {
            ctx.fillStyle = "white"
            ctx.fillText("Press Enter to Restart", 250, 1100)
        }
    }
}
export class LevelUpUI extends UI {
    constructor(game) {
        super(game)
        this.fontSize = 100
        this.timer = 0
        this.upgrades = []
        this.leaving = false
        this.blinking = true
        this.blinkInterval = 250
    }

    update(deltaTime) {
        super.update(deltaTime)
        if(this.leaving) {
            this.timer += deltaTime
            if(this.timer >= 1500) {
            this.leave()
            }
        }
        if(this.game.currentInputs.includes("1")){
            this.leaving = true
        }

        else if(this.game.currentInputs.includes("2")){
            this.leaving = true
        }

        else if(this.game.currentInputs.includes("3")){
            this.leaving = true
        }
    }

    draw(ctx) {
        super.draw(ctx)
        if(this.visible && this.leaving)ctx.fillText("Choose your upgrade. Press 1-3", 300, 1100)
        else if(this.leaving == false)ctx.fillText("Choose your upgrade. Press 1-3", 300, 1100)
        }

    leave() {
        this.game.gameState = "ingame"
        this.game.player.unlimitedAmmo = false
        this.game.levelUpUI = new LevelUpUI(this.game)
    }
}