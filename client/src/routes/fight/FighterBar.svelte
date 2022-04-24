<script lang="ts">
    import FighterInfo, { Fighter } from './bar/FighterInfo.svelte';
    import FightTime from './bar/FightTime.svelte';

    export let red: Fighter;
    export let blue: Fighter;

</script>

<div>
    <FighterInfo type={"red"} fighter={red} />
    <FightTime time={20} on:action />
    <FighterInfo type={"blue"} fighter={blue} />
</div>

<style>
    div {
        position: relative;
        display: flex;
        align-items: center;
        flex-direction: row;
    }
       
</style>
