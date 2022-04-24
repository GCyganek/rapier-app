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

<button class="back" on:click="{stepBack}">
    <Icon icon="bi:arrow-left-circle" color="#ff5f69" width="30" height="30" />
</button>

<div class="container">
    <button class="attack"  on:click="{attackHandle}" >
        <Icon icon="akar-icons:sword" color="white" width="45" height="45" />
        <br>
        Atak
    </button>
    <button class="answer" on:click="{answerHandle}">
        <Icon icon="akar-icons:double-sword" color="white" width="45" height="45" />
        <br>
        Odpowiedź
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

    button.attack, button.answer {
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

    button.attack {
        background-color: #2F4858;
        margin-right: 1vw;
    }
    button.answer {
        background-color: #A6A0D6;
        margin-left: 1vw;
    }

</style>