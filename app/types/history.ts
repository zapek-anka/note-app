export interface Command {
    type: string
    undo: () => void
    redo: () => void
}