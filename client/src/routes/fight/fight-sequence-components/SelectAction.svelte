<script lang="ts">
    import Icon from '@iconify/svelte';
    import { createEventDispatcher } from "svelte";
    import { get_current_component } from "svelte/internal";
    import { Components } from './Components';
    import { Colours } from "./Colours";
    import { SequenceElement } from 'model/SequenceElement';
    import { Actions } from './Actions';

    const component = get_current_component();
    const svelteDispatch = createEventDispatcher();

    const dispatch = (name, detail) => {
        svelteDispatch(name, detail)
        component.dispatchEvent && component.dispatchEvent(new CustomEvent(name, { detail }))
    }

    let batch = new SequenceElement;
    export let answerDisabled;
    batch.currentComponent = Components.SelectAction;

    const attackHandle = () => {
        batch.nextComponent = Components.SelectResult;
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
        flex-direction: row;
        gap: 1vw;
        justify-content: center;
        align-items: center; 
    }

    button {
        width: 46vw;  
        height: 100%;
        color: white;
        font-size: clamp(16px, 2.1vw, 54px);
        border-radius: 2vw;
        flex: 1;
        margin-bottom: 0;
        margin-top: 0;
        cursor: pointer;
    }

    button.attack {
        background-color: var(--act-btn-attack);
    }
    button.answer {
        background-color: var(--act-btn-answer);
    }

    button.answer:disabled {
        opacity: 0.3;
    }

    button.answer:disabled:hover {
        cursor: not-allowed;
    }

</style>