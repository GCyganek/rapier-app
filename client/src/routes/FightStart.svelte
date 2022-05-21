<script lang="ts">
    import Button, { Label } from '@smui/button';
    import Fight from "./Fight.svelte"
    import { FightSocket, key } from './FightSocket';
    import { mockedFight } from 'model/MockedFight';
    import { setContext } from 'svelte';
    // import CreateFight from './CreateFight.svelte';

    let socket = new FightSocket(mockedFight.id, mockedFight.mainJudgeId);
    setContext(key, socket);

    let started = false;

    function handleClick() {
        started = true;
    }

</script>

{#if !started}
    <!--  TODO: Fight creation -->
    <!-- <CreateFight /> -->

    <div class="startDiv">
        <button on:click={() => started = true} class="startButton">
            Rozpocznij pojedynek
        </button>

        <!-- <Button class="startButton" on:click={handleClick}>
            <Label class="label">Rozpocznij pojedynek</Label>
        </Button> -->
    </div>
{:else}
    <Fight/>
{/if}

<style>
    .startDiv {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-image: url("../resources/fightstart_background_semitransparent.png");
        background-repeat: repeat;
    }

    /* * :global(.startButton) */
    .startButton {
        background-color: #FF5F69;
        color: white;
        font-size: 2rem;
        font-weight: bold;
        border-radius: 2em;
        width: 12em;
        height: 3em;
    }
    
    /* * :global(.startButton):active */
    .startButton:active {
        background-color: darkred;
        color: grey;
    }
</style>