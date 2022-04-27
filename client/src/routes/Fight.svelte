<script lang="ts">
    import type { Fighter } from "./fight/bar/FighterInfo.svelte";
    import FighterBar from "./fight/FighterBar.svelte";
    import FightSequence, { fightSequence } from "./fight/FightSequence.svelte";
    import FightStack from "./fight/FightStack.svelte";
    import FightSideProposition from "./fight/FightSideProposition.svelte";

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
    <FighterBar red={red} blue={blue} on:action={console.log} />
    <FightSequence />
    <FightSideProposition />
    <FightStack stack={$fightSequence} />
</div>

<style>
    div.container {
        display: flex;
        gap: 1em;
        flex-direction: column;
        justify-content: space-between;
    }
</style>
