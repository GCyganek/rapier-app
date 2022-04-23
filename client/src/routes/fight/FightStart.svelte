<script lang="ts">
    import Button, { Label } from '@smui/button';

    let started = false;

    function handleClick() {
        started = true;
    }
</script>

<main>
    {#if !started}
        <div class="startDiv">
            <Button class="startButton" on:click={handleClick}>
                <Label class="label">Rozpocznij pojedynek</Label>
            </Button>
        </div>
    {:else}
        <p>todo tutaj pozostałe komponenty</p>
    {/if}
</main>



<style>
    main {
        text-align: center;
        padding: 1em;
        width: 360px;
        height: 640px;
        margin: 0 auto;
        border: 1px solid;
    }

    .startDiv{
        background-image: url("../../src/resources/start_background.jpg");
    }

    * :global(.startButton){
        background-color: #FF5F69;
        color: white;
        font-size: 20px;
        font-weight: bold;
        border-radius: 40px;
        width: 230px;
        height: 62px;
        position: relative;
        top: 302px;
    }
    * :global(.startButton):active{
        background-color: darkred;
        color: grey;
    }

    @media (min-width: 640px) {
        main {
            max-width: none;
        }
    }
</style>