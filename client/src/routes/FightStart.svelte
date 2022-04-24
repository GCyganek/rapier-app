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
        text-align: center;
        padding: 1em;
        margin: auto auto;
    }

    * :global(.startButton){
        background-color: #FF5F69;
        color: white;
        font-size: 20px;
        font-weight: bold;
        border-radius: 40px;
        width: 240px;
        height: 60px;
    }
    
    * :global(.startButton):active{
        background-color: darkred;
        color: grey;
    }
</style>