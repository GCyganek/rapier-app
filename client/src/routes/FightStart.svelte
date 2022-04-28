<script lang="ts">
    import Button, { Label } from '@smui/button';
    import Fight from "./Fight.svelte"

    let started = false;

    function handleClick() {
        started = true;
    }
</script>

{#if !started}
    <div class="startDiv">
        <Button class="startButton" on:click={handleClick}>
            <Label class="label">Rozpocznij pojedynek</Label>
        </Button>
    </div>
{:else}
    <Fight/>
{/if}

<style>
    .startDiv {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-image: url("../resources/fightstart_background_semitransparent.png");
        background-repeat: repeat;
    }

    * :global(.startButton) {
        background-color: #FF5F69;
        color: white;
        font-size: 1.3em;
        font-weight: bold;
        border-radius: 2em;
        width: 12em;
        height: 3em;
    }
    
    * :global(.startButton):active {
        background-color: darkred;
        color: grey;
    }
</style>