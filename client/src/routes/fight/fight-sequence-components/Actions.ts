export enum Actions {
    RED, BLUE, DRAW,
    ATTACK, COUNTER_ATTACK,
    SUCCESS, FAILURE,
    TIMING, LATE,
    HEAD, BODY, HAND,
};

export namespace Actions {
    const actionMap = {
        [Actions.RED]:      "Czerwony",
        [Actions.BLUE]:     "Niebieski",
        [Actions.DRAW]:     "Remis",
        [Actions.ATTACK]:   "Atak",
        [Actions.COUNTER_ATTACK]: "Kontratak",
        [Actions.SUCCESS]:  "Udany",
        [Actions.FAILURE]:  "Nieudany",
        [Actions.TIMING]:   "W Tempo",
        [Actions.LATE]:     "Spóźniony",
        [Actions.HEAD]:     "W Głowę",
        [Actions.BODY]:     "W Ciało",
        [Actions.HAND]:     "W Rękę"
    };

    export function toHumanReadable(action: Actions) {
        return actionMap[action];
    }
}

