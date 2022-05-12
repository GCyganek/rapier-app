<script lang="ts">
    import Icon from '@iconify/svelte';
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
    batch.currentComponent = Components.SelectArea;
    batch.nextComponent = Components.SelectColour;

    const stepBack = () => {
        dispatch('clicked', {});
    }

    const headHit = () => {
        batch.action = Actions.HEAD;
        batch.colour = Colours.ROSE;
        dispatch('clicked', batch);
    }

    const bodyHit = () => {
        batch.action = Actions.BODY;
        batch.colour = Colours.ORANGE;
        dispatch('clicked', batch);
    }

    const handHit = () => {
        batch.action = Actions.HAND;
        batch.colour = Colours.YELLOW;
        dispatch('clicked', batch);
    }

</script>

<div class="container">
    <button class="head"  on:click="{headHit}" >
        <Icon icon="mdi:head-outline" color="white" width="2.5em" height="2.5em" />
        <br>
        Trafienie w głowę
    </button>
    <button class="body" on:click="{bodyHit}">
        <Icon icon="healthicons:body" color="white" width="2.5em" height="2.5em" />
        <br>
        Trafienie w tułów
    </button>
    <button class="hand"  on:click="{handHit}" >
        <Icon icon="akar-icons:hand" color="white" width="2.5em" height="2.5em" />
        <br>
        Trafienie w rękę
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

    button.head, button.body, button.hand {
        width: 30vw;  
        height: 100%;
        color: white;
        font-size:calc(8px + 1.5vw);
        border-radius: 2vw;
        margin: 0;
    }

    button.head {
        background-color: #E37087;
        margin-right: 1vw;
    }

    button.body {
        background-color: #FF886A;
        margin-left: 1vw;
        margin-right: 1vw;
    }

    button.hand {
        background-color: #FFC453;
        margin-left: 1vw;
    }
</style>