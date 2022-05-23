<script lang="ts">
    import Fight from "./Fight.svelte"
    import {Events, FightSocket, key} from './FightSocket';
    import {getContext, setContext} from 'svelte';

    export let response;
    let socket = getContext(key)();


    enum FightState{
        waiting,
        started,
        finished,
    }
    let fightState = FightState.waiting;

    socket.on(Events.FinishFight, () => {
        fightState = FightState.finished;
    });

    socket.on(Events.StartFight, () => {
        fightState = FightState.started;
    });


    function handleClick() {
        socket.startFight();
    }

</script>


{#if fightState === FightState.waiting}
    <!--  TODO: Fight creation -->
    <!-- <CreateFight /> -->
    {#if response.role === "MAIN"}
        <div class="startDiv">
            <button on:click={handleClick} class="startButton">
                Rozpocznij pojedynek
            </button>
        </div>
    {:else}
        <div class="startDiv">
            <button class="startButton">
                Czekanie na rozpoczęcie spotkania...
            </button>
        </div>
    {/if}
{:else if fightState === FightState.finished}
    <!--    TODO: Fight summary-->
    <p>Finished fight!</p>
{:else if fightState === FightState.started}
    <Fight redPlayer={response.redPlayer} bluePlayer={response.bluePlayer}/>
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

    .startButton {
        background-color: #FF5F69;
        color: white;
        font-size: 2rem;
        font-weight: bold;
        border-radius: 2em;
        width: 12em;
        height: 3em;
    }

    .startButton:active {
        background-color: darkred;
        color: grey;
    }
</style>