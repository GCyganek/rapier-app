<script lang="ts" context="module">
    export type TimerAction = "pause" | "resume";
</script>

<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Icon from '@iconify/svelte';
    import FightEnd from "../modal/FightEnd.svelte";

    let time: number = 0;
    let timeout: NodeJS.Timeout = null;
    let paused: boolean = false;

    const dispatch = createEventDispatcher();
    const interval = 1000;

    const preciseTimer = (last: number, delta: number) => {
        const now = Date.now();
        delta = delta + (now - last);

        if (delta >= interval) {
            delta -= interval
            time += 1;
        }

        timeout = setTimeout(preciseTimer, interval - delta, now, delta);
    }

    preciseTimer(Date.now(), 0);

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

        preciseTimer(Date.now(), 0);
        paused = false;
    }

    let isOpenEnd = false;

    function openEnd() {
        dispatch('end');
        isOpenEnd = true;
    }

    function closeEnd() {
        isOpenEnd = false;
    }

</script>

<div>
    <button class="returnButton" on:click={() => dispatch('return')}>
        <Icon icon="bx:left-arrow-circle" color="#2f4858" height="2rem"/>
    </button>

    <div class="info">
        {showTime(time)}
    </div>

    <div class="buttonWrapper">
        {#if paused}
            <button class="stopButton" on:click={() => openEnd()}>
                <Icon icon="mdi:stop-circle-outline" color="#2f4858" height="2rem"/>
            </button>
        {/if}
        <button class="previous" on:click={paused ? startTimer : pauseTimer}>
            {#if paused}
                <Icon icon="bx:play-circle" color="#2f4858" height="2rem"/>
            {:else}
                <Icon icon="carbon:pause-outline" color="#2f4858" height="2rem"/>
            {/if}
        </button>
        <FightEnd isOpenModal={isOpenEnd} on:closeModal={closeEnd}/>
    </div>
</div>

<style>
    div {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        border-bottom: 2px solid #2F4858;
    }

    button {
        box-sizing: content-box;
        border: none;
        background: none;
        padding: 0;
        margin: 0.5rem;
        height: 2rem;
        width: 2rem;
    }

    div.info {
        background-color:#333;
        display: flex;
        justify-content: center;
        height: 2.5rem;
        margin: 0.2rem 0;
        border-radius: .3em;
        text-align: center;
        font-size: 2rem;
        color: whitesmoke;
        width: 8rem;
        box-sizing: border-box;
    }

    div.buttonWrapper{
        display: flex;
        flex-direction: row;
        justify-content: right;
        border: none;
        position: absolute;
        right: 0;
    }

    .returnButton{
        position: absolute;
        left: 0;
    }
</style>