<script lang="ts" context="module">
    export type TimerAction = "pause" | "resume";
</script>

<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Icon from '@iconify/svelte';

    export let time: number;

    let current = time;
    let timeout: NodeJS.Timeout = null;
    let paused: boolean = true;
    
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
        paused = true;
    }

    const startTimer = () => {
        dispatch('action', {
            action: "resume"
        });

        time = current;
        preciseTimer(Date.now(), Date.now());
        paused = false;
    }

</script>

<div>
    <button on:click={() => dispatch('return')}>
        <Icon icon="fe:arrow-left" height="3em" />
    </button>

    <p> {showTime(current)} </p>

    <button class="previous" on:click={paused ? startTimer : pauseTimer}>
        {#if paused}
            <Icon icon="fe:play" height="3em" />
        {:else}
            <Icon icon="fe:pause" height="3em" />
        {/if}
    </button>
</div>

<style>
    div {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #333;
    }

    button {
        border-radius:  .5em;
        box-sizing:     content-box;
        padding:        0;
        margin:         5px;
        height:         3em;
        border:         1px #555 solid;
        width:          3em;
    }

    p {
        background-color:   #333;
        border-radius:      .3em;
        text-align:         center;
        font-size:          2em;
        padding:            .125em;
        margin:             0;
        color:              whitesmoke;
        width:              4em;
    }

</style>