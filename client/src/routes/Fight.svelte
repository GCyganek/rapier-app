<script lang="ts">
    import type { TimerAction } from "./fight/bar/FightTime.svelte";
    import { FightSocket, key } from "./FightSocket";

    import FighterBar from "./fight/FighterBar.svelte";
    import FightSequence, { fightSequence, clear, pop } from "./fight/FightSequence.svelte";
    import FightStack from "./fight/FightStack.svelte";
    import FightSideProposition from "./fight/FightSideProposition.svelte";
    import { getContext } from "svelte";
    
    const socket = getContext(key) as FightSocket;

    function timerEventHandler(event: CustomEvent<TimerAction>) {
        switch (event.detail) {
            case 'pause':
                return socket.pauseTimer();

            case 'resume':
                return socket.resumeTimer();
        }
    }

</script>

<div class="container">
    {#await socket.join()}
        <!-- Bez styli! -->
        <p> Oczekuję na połączenie... </p>
    
    {:then response} 
        <FighterBar 
            red={response.redPlayer} 
            blue={response.bluePlayer} 
            on:action={timerEventHandler} 
            on:return={pop} />
        
        <FightSequence />
        <FightSideProposition/>
        <FightStack stack={$fightSequence} on:clear={clear} />
    
    {:catch err}
        <p> Error: {err} </p>

    {/await}

</div>

<style>
    div.container {
        height: 100vh;
        width: 100vw;

        display: grid;
        grid-template-rows: 7rem auto 7rem 20rem;
        box-sizing:         border-box;
    }
</style>
