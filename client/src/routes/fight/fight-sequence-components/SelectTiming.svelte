<script>
    import Icon from '@iconify/svelte';
    import { createEventDispatcher } from "svelte";
    import { get_current_component } from "svelte/internal";
    import { Actions } from './Actions';
    import { Batch } from './Batch';
    import { Colours } from './Colours';
    import { Components } from './Components';

    const component = get_current_component();
    const svelteDispatch = createEventDispatcher();

    const dispatch = (name, detail) => {
        svelteDispatch(name, detail)
        component.dispatchEvent && component.dispatchEvent(new CustomEvent(name, { detail }))
    }

    let batch = new Batch;
    batch.currentComponent = Components.SelectTiming;

    const stepBack = () => {
        dispatch('clicked', {});
    }

    const timingAnswer = () => {
        batch.action = Actions.TIMING;
        batch.colour = Colours.GREENY_BLUE_HIGH;
        batch.nextComponent = Components.SelectArea;
        dispatch('clicked', batch);
    }

    const lateAnswer = () => {
        batch.action = Actions.LATE;
        batch.colour = Colours.GREENY_BLUE_MED;
        batch.nextComponent = Components.SelectFighter;
        dispatch('clicked', batch);
    }

    const failAnswer = () => {
        batch.action = Actions.FAILURE;
        batch.colour = Colours.GREENY_BLUE_LOW;
        batch.nextComponent = Components.SelectFighter;
        dispatch('clicked', batch);
    }
</script>


<button class="back" on:click="{stepBack}">
    <Icon icon="bi:arrow-left-circle" color="#ff5f69" width="30" height="30" />
</button>

<div class="container">
    <button class="timing"  on:click="{timingAnswer}" >
        <Icon icon="bi:clock" color="white" width="45" height="45" />
        <br>
        W tempo
    </button>
    <button class="late" on:click="{lateAnswer}">
        <Icon icon="bi:clock-history" color="white" width="45" height="45" />
        <br>
        Spóźniona
    </button>
    <button class="fail"  on:click="{failAnswer}" >
        <Icon icon="clarity:no-access-line" color="white" width="45" height="45" />
        <br>
        Nieskuteczna
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

    button.timing, button.late, button.fail {
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

    button.timing {
        background-color: #039590;
        margin-right: 1vw;
    }

    button.late {
        background-color: #4BBC8E;
        margin-left: 1vw;
        margin-right: 1vw;
    }

    button.fail {
        background-color: #9BDE7E;
        margin-left: 1vw;
    }
</style>
