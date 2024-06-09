export class InputHandler {
    constructor(game) {
        this.game = game
        this.acceptedInputs = ["arrowup", "arrowdown", "arrowleft", "arrowright","w","a","s","d", " ", "q", "e", "r", "f", "x", "enter", "1", "2"]
    
        window.addEventListener("keydown", event => {
            if ((this.acceptedInputs.includes(event.key.toLowerCase())) && !(this.game.currentInputs.includes(event.key.toLowerCase()))) {
                this.game.currentInputs.push(event.key.toLowerCase())
            }
            event.preventDefault()
        })
    
        window.addEventListener("keyup", event => {
            if (this.game.currentInputs.includes(event.key.toLowerCase())) {
                this.game.currentInputs.splice(this.game.currentInputs.indexOf(event.key.toLowerCase()), 1)
            }
        })
    }
}