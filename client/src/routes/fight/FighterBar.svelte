<script lang="ts">
    import Icon from '@iconify/svelte';
    import FighterInfo, { Fighter } from './bar/FighterInfo.svelte';
    import FightTime from './bar/FightTime.svelte';

    export let red: Fighter;
    export let blue: Fighter;

</script>

<div class="container">
    <div class="center-icon">
        <Icon icon="akar-icons:double-sword" width="4em" color="white" height="4em" />
    </div>
    
    <div class="upper-bar">
        <FighterInfo type={"red"} fighter={red} />
        <FighterInfo type={"blue"} fighter={blue} />
    </div>
    
    <FightTime time={20} on:action on:return />
</div>

<style>
    div.container {
        position: relative;
        box-sizing: border-box;
        height: 16vh;
    }

    div.upper-bar {
        display: flex;
        flex-direction: row;
        position: relative;
    }

    div.center-icon {
        position: absolute;
        top: 1em;
        left: calc(50% - 2em);
        z-index: 1;
    }

</style>
