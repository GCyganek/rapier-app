<script lang="ts">
    import Icon from '@iconify/svelte';
    import FighterInfo, { Fighter } from './bar/FighterInfo.svelte';
    import FightTime from './bar/FightTime.svelte';

    export let red: Fighter;
    export let blue: Fighter;

</script>

<div class="container">
    <div class="upper-bar">
        <FighterInfo type={"red"} fighter={red} />
        <FighterInfo type={"blue"} fighter={blue} />
    </div>
    
    <div class="timer">
        <FightTime time={20} on:action on:return />
    </div>
</div>

<style>
    div.container {
        position: relative;
        box-sizing: content-box;
    }

    div.upper-bar {
        display: flex;
        flex-direction: row;
        position: relative;
        height: 8.75vh;
        border-bottom: 2px solid #2F4858;
    }

    div.timer {
        height: 7.5vh;
    }

</style>
