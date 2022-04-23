<script lang="ts">
    import FighterBar from "./fight/FighterBar.svelte";
    import FightSequence from "./fight/FightSequence.svelte";
</script>

<FighterBar />
<FightSequence />


<style>
    main {
        text-align: center;
        padding: 1em;
        margin: 0 auto;
    }


    @media (min-width: 640px) {
        main {
            max-width: none;
        }
    }
</style>
