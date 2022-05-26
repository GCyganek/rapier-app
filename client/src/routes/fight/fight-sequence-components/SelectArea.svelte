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
        W głowę
    </button>
    <button class="body" on:click="{bodyHit}">
        <Icon icon="healthicons:body" color="white" width="2.5em" height="2.5em" />
        <br>
        W Ciało
    </button>
    <button class="hand"  on:click="{handHit}" >
        <Icon icon="akar-icons:hand" color="white" width="2.5em" height="2.5em" />
        <br>
        W Rękę
    </button>
</div>


<style>
    div.container {
        width: 100%;
        height: 100%;
        margin: auto auto;
        display: flex;
        flex-direction: row;
        gap: 1vw;
        justify-content: center;
        align-items: center; 
    }

    button.head, button.body, button.hand {
        width: 30vw;  
        height: 100%;
        color: white;
        font-size: clamp(12px, 1.875vw, 46px);
        border-radius: 2vw;
        flex: 1;
        margin: 0;
        cursor: pointer;
    }

    button.head {
        background-color: var(--area-btn-head);
    }

    button.body {
        background-color: var(--area-btn-body);
    }

    button.hand {
        background-color: var(--area-btn-hand);
    }
</style>