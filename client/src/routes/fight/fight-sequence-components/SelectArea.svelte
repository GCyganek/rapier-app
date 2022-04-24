<script>
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
    batch.nextComponent = Components.SelectFighter;

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

<button class="back" on:click="{stepBack}">
    <Icon icon="bi:arrow-left-circle" color="#ff5f69" width="30" height="30" />
</button>

<div class="container">
    <button class="head"  on:click="{headHit}" >
        <Icon icon="mdi:head-outline" color="white" width="43" height="47" />
        <br>
        Trafienie w głowę
    </button>
    <button class="body" on:click="{bodyHit}">
        <Icon icon="healthicons:body" color="white" width="43" height="47" />
        <br>
        Trafienie w tułów
    </button>
    <button class="hand"  on:click="{handHit}" >
        <Icon icon="akar-icons:hand" color="white" width="43" height="47" />
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

    button.back {
        margin-left: 1vw;
        margin-top: 1vh;
        display: block;
    }

    button.head, button.body, button.hand {
        width: 15vw;
        min-width: 45px;    
        height: 100%;
        min-height: 35px;
        color: white;
        font-size: 2vw;
        border-radius: 2vw;
        margin-bottom: 0;
        margin-top: 0;
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