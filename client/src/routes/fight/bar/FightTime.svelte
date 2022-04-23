<script lang="ts" context="module">
    export type TimerAction = "pause" | "resume";
</script>

<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let time: number;

    let current = time;
    let timeout: NodeJS.Timeout = null;
    
    const dispatch = createEventDispatcher();

    const preciseTimer = (start: number, last: number) => {
        const delta = Date.now() - last;
        current = time - Math.floor((Date.now() - start) / 1000);
        
        if (current <= 0)
            return;

        timeout = setTimeout(
            preciseTimer,
            Math.max(0, 1000 - delta), 
            start, Date.now()
        );
    }

    const showTime = (time: number) => {
        const min = Math.floor(time / 60), 
        tbs = time % 60,
        secs = tbs < 10 ? `0${tbs}` : tbs.toString();
        
        return `${min}:${secs}`
    }
    
    const pauseTimer = () => {
        dispatch('action', {
            action: "pause"
        });
            
        timeout = (clearTimeout(timeout), null);
    }

    const startTimer = () => {
        dispatch('action', {
            action: "resume"
        });

        time = current;
        preciseTimer(Date.now(), Date.now());
    }

</script>

<div>
    <p> {showTime(current)} </p>

    <button on:click={pauseTimer}> # </button>
    <button on:click={startTimer}> + </button>
</div>

<style>
    div {
        position: absolute;
        top: 0px;
        left: calc(50% - 3em);
        width: 6em;
        height: 1.9em;
        box-sizing: border-box;
    }
    
    p {
        color: white;
        background: fixed #333;
        width: 100%;
        height: 100%;
        margin: 0px;
        padding: 2px 5px;
        box-sizing: border-box;    
        
        border: 1px white solid;
        border-top: 0px;
        border-bottom-left-radius: 0.5em;
        border-bottom-right-radius: 0.5em;
    }

    button {
        background-color: #333;
        border: none;
        color: white;
        width: 2.5em;
        height: 2.5em;
        box-sizing: border-box;
        margin-top: 4px;
    }

</style>