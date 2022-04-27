<script lang="ts">
    import type { Fighter } from "./fight/bar/FighterInfo.svelte";
    import FighterBar from "./fight/FighterBar.svelte";
    import FightSequence, { fightSequence, clear, pop } from "./fight/FightSequence.svelte";
    import FightStack from "./fight/FightStack.svelte";

    const red: Fighter = {
        firstName: "Mike",
        lastName: "Wazowski",
        points: 10
    };

    const blue: Fighter = {
        firstName: "Jan",
        lastName: "Kowalsky",
        points: 9
    };

</script>

<div class="container">
    <FighterBar red={red} blue={blue} on:action={console.log} on:return={pop} />
    <FightSequence />
    <FightStack stack={$fightSequence} on:clear={clear} />
</div>

<style>
    div.container {
        display:            flex;
        justify-content:    space-between;
        flex-direction:     column;
        box-sizing:         border-box;
    }
</style>
