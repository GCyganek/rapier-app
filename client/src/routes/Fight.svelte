<script lang="ts">
    import FightBar from "./fight/FighterBar.svelte"
</script>

<main>
    <FightBar/>
    <p>tutaj reszta komponentów fight</p>
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