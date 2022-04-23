<script>
    import FighterBar from "./fight/FighterBar.svelte";
    import FightSequence from "./fight/FightSequence.svelte";

</script>

<FighterBar on:action={console.log} />
<FightSequence />
