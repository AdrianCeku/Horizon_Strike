import { randomInt } from "./game.js"
import { alienPlanet1Sprite, alienPlanet2Sprite, bluePlanet1Sprite, bluePlanet2Sprite, redPlanet1Sprite, redPlanet2Sprite, icePlanet1Sprite, icePlanet2Sprite, lavaPlanet1Sprite, lavaPlanet2Sprite, starSprite, galaxyBlueSprite, galaxyGoldSprite, galaxyGreenSprite, galaxyPinkSprite, gasGiant1Sprite, gasGiant2Sprite, asteroid10Sprite, asteroid1Sprite, asteroid2Sprite, asteroid3Sprite, asteroid4Sprite, asteroid5Sprite, asteroid6Sprite, asteroid7Sprite, asteroid8Sprite, asteroid9Sprite, blackholeSprite} from "./assets.js"
import {Layer, CloudLayer, BackgroundColor} from "./layer.js"

export class Background {
        constructor(game) {
        this.game = game
        this.layers = []
        this.backgroundSpeed = 0.007
        this.backgroundLayers = [new CloudLayer(this.game, this.backgroundSpeed, 1700, 1300, 0), new CloudLayer(this.game, this.backgroundSpeed, 1700, 1300, 1699)]
        this.foregroundLayers = []
        this.backgroundColor = new BackgroundColor(this.game, "#141d27")
        this.backgroundParticles = []
        this.planetTimer = 30000
        this.planetInterval = 35000
        this.starTimer = randomInt(400000, 0)
        this.starInterval = 140000
        this.galaxyTimer = randomInt(900000, 0)
        this.galaxyInterval = 80000
        this.asteroidTimer = 0
        this.asteroidInterval = 5000
        this.blackholeTimer = 0
        this.blackholeInterval = 100000
        this.planetSprites = [  alienPlanet1Sprite,
                                alienPlanet2Sprite,
                                bluePlanet1Sprite,
                                bluePlanet2Sprite,
                                redPlanet1Sprite,
                                redPlanet2Sprite,
                                icePlanet1Sprite,
                                icePlanet2Sprite,
                                lavaPlanet1Sprite,
                                lavaPlanet2Sprite,
                                gasGiant1Sprite,
                                gasGiant2Sprite
                            ]
        this.starSprites = [    starSprite]
        this.galaxySprites = [  galaxyBlueSprite,
                                galaxyGreenSprite,
                                galaxyGoldSprite,
                                galaxyPinkSprite]
        this.asteroidSprites = [asteroid1Sprite,
                                asteroid2Sprite,
                                asteroid3Sprite,
                                asteroid4Sprite,
                                asteroid5Sprite,
                                asteroid6Sprite,
                                asteroid7Sprite,
                                asteroid8Sprite,
                                asteroid9Sprite,
                                asteroid10Sprite
                                ]
        this.blackholeSprites = [blackholeSprite]
        let startingAsteroid = new Layer(this.game, this.asteroidSprites[randomInt(this.asteroidSprites.length - 1, 0)], 0.1, 200, 200)
        startingAsteroid.y = 200
        this.foregroundLayers.push(startingAsteroid)
    }

    update(deltaTime) { 
        this.backgroundColor.update(deltaTime)
        this.backgroundLayers.forEach(layer => layer.update(deltaTime))
    
        this.backgroundParticles.forEach(particle => {
            particle.update(deltaTime)
            if(particle.markedForDeletion) this.backgroundParticles.splice(this.backgroundParticles.indexOf(particle), 1)
        })
    
        this.layers.forEach(layer => {
            layer.update(deltaTime)
            if (layer.markedForDeletion) this.layers.splice(this.layers.indexOf(layer), 1)
        })
    
        this.foregroundLayers.forEach(layer => {
            layer.update(deltaTime)
            if (layer.markedForDeletion) this.foregroundLayers.splice(this.foregroundLayers.indexOf(layer), 1)
        })
    
        this.planetTimer += deltaTime
        this.starTimer+= deltaTime
        this.galaxyTimer+= deltaTime
        this.asteroidTimer+= deltaTime
        this.blackholeTimer += deltaTime
    
        
        if(this.blackholeTimer > this.blackholeInterval) {
            let size = randomInt(200, 50)
            let distance = randomInt(50000, 20000)
            this.backgroundLayers.unshift(new Layer(this.game, this.blackholeSprites[randomInt(this.blackholeSprites.length - 1, 0)], size/distance + 0.0001, size, size))
            this.blackholeTimer = 0
        }
        if(this.galaxyTimer > this.galaxyInterval) {
            let size = randomInt(350, 200)
            let distance = randomInt(70000, 45000)
            this.backgroundLayers.unshift(new Layer(this.game, this.galaxySprites[randomInt(this.galaxySprites.length - 1, 0)], size/distance, size, size))
            this.galaxyTimer = 0
        }
        if(this.starTimer > this.starInterval) {
            let size = randomInt(400, 250)
            let distance = randomInt(15000, 10000)
            this.layers.unshift(new Layer(this.game, this.starSprites[randomInt(this.starSprites.length - 1, 0)], size/distance, size, size))
            this.starTimer = 0
        }
        if(this.planetTimer > this.planetInterval) {
            let size = randomInt(700, 50)
            let distance = randomInt(8000, 5000)
            this.layers.push(new Layer(this.game, this.planetSprites[randomInt(this.planetSprites.length - 1, 0)], size/distance, size, size))
            this.planetTimer = 0
        }
        if(this.asteroidTimer > this.asteroidInterval) {
            let size = randomInt(200, 50)
            let distance = randomInt(1000, 100)
            if(Math.random() < 0.25) this.foregroundLayers.push(new Layer(this.game, this.asteroidSprites[randomInt(this.asteroidSprites.length - 1, 0)], size/distance, size, size))
            else {
                distance = randomInt(400, 100)
                size = randomInt(200, 100)
                this.layers.push(new Layer(this.game, this.asteroidSprites[randomInt(this.asteroidSprites.length - 1, 0)], size/distance, size, size))
            }
            this.asteroidTimer = 0
        }
    }

    draw(ctx) {
        this.backgroundColor.draw(ctx)
        this.backgroundParticles.forEach(particle => particle.draw(ctx))
        this.backgroundLayers.forEach(layer => layer.draw(ctx))
        this.layers.forEach(layer => layer.draw(ctx))
    }
}