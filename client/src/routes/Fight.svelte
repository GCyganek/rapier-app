<script lang="ts">
    import type { Fighter } from "./fight/bar/FighterInfo.svelte";
    import FighterBar from "./fight/FighterBar.svelte";
    import FightSequence from "./fight/FightSequence.svelte";

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

<FighterBar red={red} blue={blue} on:action={console.log} />
<FightSequence />


<style>

</style>

