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

    let batch = new Batch;
    batch.currentComponent = Components.SelectColour;
    batch.nextComponent = Components.SelectResult;

    const redHandle = () => {
        batch.colour = Colours.RED;
        batch.action = Actions.ATTACK;
        dispatch('clicked', batch);
    }

    const blueHandle = () => {
        batch.colour = Colours.BLUE;
        batch.action = Actions.ATTACK;
        dispatch('clicked', batch);
    }

</script>
<div class="container">
    <button class="red"  on:click="{redHandle}" style="min-" >
        <Icon icon="akar-icons:sword" color="white" width="45" height="45"/>
        <br>
        Atak czerwonego
    </button>
    
    <button class="blue" on:click="{blueHandle}" >
        <Icon icon="akar-icons:sword" color="white" width="45" height="45" hFlip={true}/>
        <br>
        Atak niebieskiego
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
        width: 15vw;
        min-width: 60px;    
        height: 100%;
        min-height: 50px;
        color: white;
        font-size: 2vw;
        border-radius: 2vw;
        margin-bottom: 0;
        margin-top: 0;
    }
    button.red {
        background-color: #FF5F69;
        margin-right: 1vw;
    }

    button.blue {
        background-color: #4161FE;
        margin-left: 1vw;
    }
</style>