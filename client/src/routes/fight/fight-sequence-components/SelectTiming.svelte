<script>
    import Icon from '@iconify/svelte';
    import { createEventDispatcher } from "svelte";
    import { get_current_component } from "svelte/internal";
    import { Actions } from './Actions';
    import { SequenceElement } from 'model/SequenceElement';
    import { Colours } from './Colours';
    import { Components } from './Components';

    const component = get_current_component();
    const svelteDispatch = createEventDispatcher();

    const dispatch = (name, detail) => {
        svelteDispatch(name, detail)
        component.dispatchEvent && component.dispatchEvent(new CustomEvent(name, { detail }))
    }

    let batch = new SequenceElement;
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
        batch.nextComponent = Components.SelectColour;
        dispatch('clicked', batch);
    }

    const failAnswer = () => {
        batch.action = Actions.FAILURE;
        batch.colour = Colours.GREENY_BLUE_LOW;
        batch.nextComponent = Components.SelectColour;
        dispatch('clicked', batch);
    }
</script>

<div class="container">
    <button class="timing"  on:click="{timingAnswer}" >
        <Icon icon="bi:clock" color="white" width="2.5em" height="2.5em" />
        <br>
        W tempo
    </button>
    <button class="late" on:click="{lateAnswer}">
        <Icon icon="bi:clock-history" color="white" width="2.5em" height="2.5em" />
        <br>
        Spóźniony
    </button>
    <button class="fail"  on:click="{failAnswer}" >
        <Icon icon="clarity:no-access-line" color="white" width="2.5em" height="2.5em" />
        <br>
        Nieudany
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

    button.timing, button.late, button.fail {
        width: 30vw;   
        height: 100%;
        color: white;
        font-size: clamp(12px, 1.875vw, 46px);
        border-radius: 2vw;
        flex: 1;
        margin: 0;
        cursor: pointer;
    }

    button.timing {
        background-color: var(--tmg-btn-timing);
    }

    button.late {
        background-color: var(--tmg-btn-late);
    }

    button.fail {
        background-color: var(--tmg-btn-fail);
    }
</style>
