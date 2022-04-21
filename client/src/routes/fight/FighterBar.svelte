<script lang="ts" context="module">
    import FighterInfo, { Fighter } from './bar/FighterInfo.svelte';
    import FightTime from './bar/FightTime.svelte';

    const red: Fighter = {
        firstName: "Mike",
        lastName: "Wazowski",
        points: 0
    };
</script>

<div>
    <FighterInfo type={"red"} fighter={red} />
    <FightTime time={600} />
    <FighterInfo type={"blue"} fighter={red} />
</div>

<style>
    div {
        display: flex;
        align-items: center;
        flex-direction: row;
    }
       
</style>