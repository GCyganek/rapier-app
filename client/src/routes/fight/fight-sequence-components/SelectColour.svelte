<script lang="ts">
    import Icon from '@iconify/svelte';
    //Event dispatch handling
    import { createEventDispatcher } from "svelte";
    import { get_current_component } from "svelte/internal";
    import { Components } from './Components';
    import { Colours } from "./Colours";
    import { Batch } from "./Batch";
    import { Actions } from './Actions';

    const component = get_current_component();
    const svelteDispatch = createEventDispatcher();

    const dispatch = (name, detail) => {
        svelteDispatch(name, detail)
        component.dispatchEvent && component.dispatchEvent(new CustomEvent(name, { detail }))
    }
    export let previousAttacker;
    export let answerDisabled;
    export let draw;
    let batch = new Batch;
    batch.currentComponent = Components.SelectColour;
    batch.nextComponent = Components.SelectAction;

    const redHandle = () => {
        if (previousAttacker === "blue") {
            answerDisabled = false;
        } else {
            answerDisabled = true;
        }
        previousAttacker = "red";
        batch.colour = Colours.RED;
        batch.action = Actions.RED;
        dispatch('clicked', batch);
    }

    const blueHandle = () => {
        if (previousAttacker === "red") {
            answerDisabled = false;    
        } else {
            answerDisabled = true;
        }
        previousAttacker = "blue";
        batch.colour = Colours.BLUE;
        batch.action = Actions.BLUE;
        dispatch('clicked', batch);
    }

    const drawHandle = () => {
        batch.colour = Colours.GRAY;
        batch.action = Actions.DRAW;
        draw = true;
        batch.nextComponent = Components.SelectColour;
        dispatch('clicked', batch);
    }

</script>
<div class="container">
    <button class="red"  on:click="{redHandle}" disabled={draw}>
        <Icon icon="akar-icons:sword" color="white" width="2.5em" height="2.5em"/>
        <br>
        Czerwony

    </button>
    
    <button class="draw" on:click="{drawHandle}" disabled={draw}>
        <Icon icon="akar-icons:double-sword" color="white" width="2.5em" height="2.5em" hFlip={true}/>
        <br>
        Remis
    </button>

    <button class="blue" on:click="{blueHandle}" disabled={draw}>
        <Icon icon="akar-icons:sword" color="white" width="2.5em" height="2.5em" hFlip={true}/>
        <br>
        Niebieski
    </button>

</div>

<style>
    div.container {
        width: 100%;
        height: 100%;
        margin: auto auto;
        display: flex;
        justify-content: center;
        align-items: center; 
    }

    button {
        width: 30vw;   
        height: 100%;
        color: white;
        font-size: calc(8px + 1.5vw);
        border-radius: 2vw;
        margin: 0;
    }

    button.red {
        background-color: #FF5F69;
        margin-right: 1vw;
    }

    button.blue {
        background-color: #4161FE;
        margin-left: 1vw;
        margin-right: 1vw;
    }

    button.draw {
        background-color: #A6A0D6;
        margin-left: 1vw;
    }

    button:disabled {
        opacity: 0.5;
    }
</style>