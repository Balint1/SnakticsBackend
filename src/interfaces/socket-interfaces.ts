
export interface ISocketId {
    id: string
}

export interface IJoinResult {
    id: string
    message: string
}

export interface INewPlayerJoined {
    nickname: string,
    id: string
}

export interface IActionResult {
    succes: boolean
    error: string
}