<script lang="ts">
    import type { Response } from 'model/Communication';
    import Button, { Label } from "@smui/button";
    import { FightSocket, key } from "routes/FightSocket";
    import { getContext } from "svelte";
import FightPropositionDetails from './FightPropositionDetails.svelte';

    const socket = getContext(key) as FightSocket;

    const [red, blue] = socket.awaitSuggestions();

    function handleClick(type: Response.Color) {
        console.log("clicked! " + type)
    }
</script>

<div class="sideDiv">
    <p> Proponowane zdarzenia od sędziów bocznych: </p>
    
    <FightPropositionDetails suggestion={$red} />
    <FightPropositionDetails suggestion={$blue} />
    <!-- 
    <Button class="redButton" disabled={true} on:click={() => handleClick("RED")}>
        <Label> {$red} </Label>
    </Button>
    
    <Button class="blueButton" on:click={() => handleClick("BLUE")}>
        <Label>[informacje od niebieskiego]</Label>
    </Button> -->
</div>

<style>
    div.sideDiv {
        display: flex;
        align-items: center;
        flex-direction: column;
        gap: 0.5rem;
        padding: 0.5rem;
    }

    p {
        color: var(--blue-fighter);
        margin: 0;
    }

    * :global(.blueButton) {
        background-color: var(--blue-fighter);
    }

    * :global(.redButton) {
        background-color: var(--red-fighter);
    }
    
    * :global(Button) {
        width: 85%;
        height: 2rem;
        border-radius: 0.5rem;
        color: white;
        margin: 0;
    }
    
    * :global(Button:disabled){
        background-color: lightgray;
        border-color: lightgray;
        color: gray;
    }
</style>