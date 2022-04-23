<script lang="ts">
    import FightStart from "./fight/FightStart.svelte"
</script>

<main>
    <FightStart/>
</main>

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