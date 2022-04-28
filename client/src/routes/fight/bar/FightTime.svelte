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
        <Icon icon="bx:left-arrow-circle" color="#2f4858" height="6vh"/>
    </button>

    <div class="info">
        {showTime(current)}
    </div>

    <button class="previous" on:click={paused ? startTimer : pauseTimer}>
        {#if paused}
            <Icon icon="bx:play-circle" color="#2f4858" height="6vh"/>
        {:else}
            <Icon icon="carbon:pause-outline" color="#2f4858" height="6vh"/>
        {/if}
    </button>
</div>

<style>
    div {
        display: flex;
        height: 7.5vh;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #2F4858;
    }

    button {
        border-radius:  .5em;
        box-sizing:     content-box;
        padding:        0;
        margin:         5px;
        height:         6vh;
        border:         1px #2F4858 solid;
        width:          6vh;
    }

    div.info {
        background-color:   #333;
        height:             6vh;
        width:              27.8vw;
        border-radius:      .3em;
        text-align:         center;
        font-size:          2vw;
        padding:            1vh 2vw;
        color:              whitesmoke;
        width:              4em;
        box-sizing:         border-box;
    }

</style>