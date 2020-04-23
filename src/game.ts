import { EntityPool } from "./entities/entity-pool";
import { ISystem } from "./interfaces/system-interfaces";
import { IGameState, IPlayer } from './interfaces/game-interfaces'
import { SnakeFactory } from "./factory/SnakeFactory";
import { FoodFactory } from "./factory/FoodFactory";
import { DynamicsSystem } from "./systems/dynamics-system";
import { InputSystem } from "./systems/input-system";
import {config} from 'node-config-ts'
import { SocketEvents } from "./constants";
import { getLogger } from "./loggers";
import { CollisionSystem } from "./systems/collision-system";
import { GameManager } from "./games-manager";
import { SocketService } from "./socket-service";
import { Setting } from "./models/game-setting";
import { PowerupSystem } from "./systems/powerup-system";
import { PowerupFactory } from "./factory/PowerupFactory";


const logger = getLogger('game')

export class Game {
    private readonly roomId: string
    private readonly gameManager: GameManager = GameManager.getInstance()
    private readonly io = SocketService.io()
    private players: IPlayer[]
    private entityPool: EntityPool = new EntityPool()
    private systems: ISystem[] = []
    private state: IGameState = {entities: []}
    private timer: NodeJS.Timeout
    private _inProgress: boolean = false
    private settings:Setting = new Setting()
    private idle:number = 0

    //Temporary solution:
    private spawningPlaces = [
        [10, 10],
        [10, 290],
        [290, 10],
        [290, 290],
    ]

    constructor(roomId: string) {
        this.roomId = roomId
    }

    startGame(players: IPlayer[]) {
        this._inProgress = true
        this.players = players
        this.systems.push(new InputSystem(this.players, this.entityPool))
        this.systems.push(new CollisionSystem(this.entityPool))
        this.systems.push(new DynamicsSystem(this.entityPool, this.settings))
        this.systems.push(new PowerupSystem(this.entityPool))
        this.timer = setInterval(() => this.updateState(), config.ServerSettings.timerInterval)
        //initialize here
        let i = 0;
        players.forEach(p => {
            //TODO random position?
            let snake = SnakeFactory.create(p.id, this.spawningPlaces[i][0], this.spawningPlaces[i++][1], this.settings.snakeDefaults);
            snake.forEach(s => {
                this.entityPool.addEntity(s)
            });
        });

        this.entityPool.addEntity(new FoodFactory().create())
        this.entityPool.addEntity(new PowerupFactory().create())
    }

    private updateState() {

        this.systems.forEach(s => {
            s.calculateNextState(this.idle)
        });
        this.state.entities = []
        this.entityPool.entities.forEach(e => {
            //Can be optimized
            let changedComponents = e.components.filter(c => c.changed)
            if(changedComponents.length > 0){
                this.state.entities.push.apply(this.state.entities, changedComponents.map(c => c.serialize()).filter(o => o != undefined))
                changedComponents.forEach(c => c.changed = false)
            }
            }   
            )
        this.io.to(this.roomId).emit(SocketEvents.UPDATE, {state: this.state.entities})
        //TODO delete Debug 
        console.log("UPDATE:")
        console.log(this.state.entities)

        //Sometimes we have to reset the counter, this number won't break the rest ( % ) operation 
        this.idle = this.idle == config.ServerSettings.idleReset ? 0 : this.idle + 1
        return this.state
    }


    removePlayer(playerId: string){
        this.players = this.players.filter(player => player.id != playerId)
        if(this.players.length == 0){
            this.endGame()
        }else if(this.players.length == 1){
            //TODO this is the winner send notification about wining game
        }
    }

    endGame() {
        this._inProgress = false
        clearTimeout(this.timer)
    }

    get inProgress() {
         return this._inProgress
    }

    getEntities(){
        return this.entityPool.entities
    }
}