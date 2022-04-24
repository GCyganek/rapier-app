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
    batch.currentComponent = Components.SelectResult;

    const stepBack = () => {
        dispatch('clicked', {});
    }

    const succeedHandle = () => {
        batch.action = Actions.SUCCESS;
        batch.colour = Colours.GREEN;
        batch.nextComponent = Components.SelectArea;
        dispatch('clicked', batch);
    }

    const failHandle = () => {
        batch.action = Actions.FAILURE;
        batch.colour = Colours.GRAY;
        batch.nextComponent = Components.SelectFighter;
        dispatch('clicked', batch);
    }

</script>

<button class="back" on:click="{stepBack}">
    <Icon icon="bi:arrow-left-circle" color="#ff5f69" width="30" height="30" />
</button>

<div class="container">
    <button class="succeed"  on:click="{succeedHandle}" >
        <Icon icon="healthicons:yes-outline" color="white" width="45" height="45" />
        <br>
        Natarcie
    </button>
    <button class="fail" on:click="{failHandle}">
        <Icon icon="clarity:no-access-line" color="white" width="45" height="45" />
        <br>
        Nieskuteczny
    </button>
</div>


<style>
    button.back {
        margin-left: 1vw;
        margin-top: 1vh;
        display: block;
    }

    div.container {
        width: 100%;
        height: 100%;
        margin: auto auto;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    button.succeed, button.fail {
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

    button.succeed {
        background-color: #009766;
        margin-right: 1vw;
    }

    button.fail {
        background-color: #A6A0D6;
        margin-left: 1vw;
    }

</style>