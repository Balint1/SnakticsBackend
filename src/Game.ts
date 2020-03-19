import { EntityPool } from "./EntityPool";
import { ISystem } from "./Systems/ISystem";
import { GameConstants } from "./constants";

export class Game{
    entityPool: EntityPool
    systems: ISystem[]
    private timer: NodeJS.Timeout
    counter: number = 0

    startGame(){
        this.timer = setInterval(() => this.updateState(), GameConstants.timerInterval)
    }

    updateState() {
        // this.systems.forEach(system => {
        //     system.calculateNextState(this.entityPool.entities)
        // });
        this.counter++
    }

    endGame(){
        clearTimeout(this.timer)
        this.counter = 0
    }
}