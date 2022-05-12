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

    let batch = new Batch();
    export let answerDisabled;
    batch.currentComponent = Components.SelectAction;

    const stepBack = () => {
        dispatch('clicked', {});
    }

    const attackHandle = () => {
        batch.nextComponent = Components.SelectArea;
        batch.action = Actions.ATTACK;
        batch.colour = Colours.BLACK;
        dispatch('clicked', batch);
    }

    const answerHandle = () => {
        batch.nextComponent = Components.SelectTiming;
        batch.action = Actions.COUNTER_ATTACK;
        batch.colour = Colours.BROWN;
        dispatch('clicked', batch);
    }

</script>

<div class="container">
    <button class="attack"  on:click="{attackHandle}" >
        <Icon icon="akar-icons:sword" color="white" width="2.5em" height="2.5em" />
        <br>
        Atak
    </button>
    <button class="answer" on:click="{answerHandle}" disabled={answerDisabled}>
        <Icon icon="akar-icons:double-sword" color="white" width="2.5em" height="2.5em" />
        <br>
        Kontratak
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
        width: 46vw;  
        height: 100%;
        color: white;
        font-size: calc(12px + 1.5vw);
        border-radius: 2vw;
        margin-bottom: 0;
        margin-top: 0;
    }

    button.attack {
        background-color: #2F4858;
        margin-right: 1vw;
    }
    button.answer {
        background-color: #B17280;
        margin-left: 1vw;
    }

    button.answer:disabled {
        opacity: 0.3;
    }

</style>