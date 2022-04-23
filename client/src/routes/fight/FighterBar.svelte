<script lang="ts">
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
    <FightTime time={10} on:action />
    <FighterInfo type={"blue"} fighter={red} />
</div>

<style>
    div {
        position: relative;
        display: flex;
        align-items: center;
        flex-direction: row;
    }

</style>
