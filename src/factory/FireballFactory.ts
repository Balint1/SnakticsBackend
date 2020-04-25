import {EntityFactory} from "./EntityFactory";
import {Entity} from "../entities/entity";
import {PositionComponent} from "../components/position-component";
import { ColliderComponent } from "../components/collider-component";
import { TagComponent } from "../components/tag-component";
import { TagType } from "../Enums/tag-type";
import {config} from 'node-config-ts'
import { Vector2 } from "../models/position";
import { MovementComponent } from "../components/movement-component";


export class FireballFactory extends EntityFactory {
    /**
     * Creates new Food entity with initialized components
     */

    launchPosition:Vector2
    direction:Vector2


    public setPosition(launchPosition:Vector2){
        this.launchPosition = launchPosition
        return this
    }

    public setDirection(direction:Vector2){
        this.direction = direction
        return this
    }

    public create(): Entity {

        let positionComponent = new PositionComponent(this.launchPosition.x, this.launchPosition.y)

        let fireball = new Entity()
        let colliderComponent = new ColliderComponent(config.FoodDefaults.foodColliderRadius)
        let tagComponent = new TagComponent(TagType.Fireball)
        let movementComponent = new MovementComponent();
        movementComponent.speed = config.FireballDefaults.fireballSpeed
        movementComponent.direction = this.direction

        fireball.addComponent(positionComponent)
        fireball.addComponent(colliderComponent)
        fireball.addComponent(tagComponent)
        fireball.addComponent(movementComponent)

        return fireball
    }

}