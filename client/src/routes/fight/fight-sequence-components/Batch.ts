import type { Colours } from "./Colours";
import type { Actions } from "./Actions";
import type { Components } from "./Components";

export class Batch {
    nextComponent: Components;
    currentComponent: Components;
    action: Actions;
    colour: Colours;
}