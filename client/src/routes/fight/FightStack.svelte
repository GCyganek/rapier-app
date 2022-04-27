<script lang="ts">
    import { Actions } from "./fight-sequence-components/Actions";
    import type { Batch } from "./fight-sequence-components/Batch";
    import Button, {Label} from "@smui/button";
    import FightPoints from "./modal/FightPoints.svelte";

    export let stack: Batch[];

    let isOpenPoints = false;

    function openPoints() {
        isOpenPoints = true;
    }

    function closePoints() {
        isOpenPoints = false;
    }

    function deleteSequence(){
        console.log("clicked delete sequence!")
    }
</script>

<div>
    {#each stack as batch}
        <p style="background-color: {batch.colour}"> 
            {Actions[batch.action]} 
        </p>
        <span> &#8594; </span>
    {/each}
</div>
<div class="buttons">
    <Button class="deleteButton" on:click={() => deleteSequence()}>
        <Label>Usuń ciąg</Label>
    </Button>
    <Button class="pointsButton" on:click={() => openPoints()}>
        <Label>Zaproponuj punkty</Label>
    </Button>
    <FightPoints stack={stack} isOpenModal={isOpenPoints} on:closeModal={closePoints} />
</div>

<style>
    div {
        border-top: 1px dimgray solid;
    }

    p {
        font-size: 1em;
        padding: 0.5em 0.8em;
        border-radius: 1.5em;
        margin: 5px 2px;
        width: max-content;
        color: white;
        display: inline-block;
        position: relative;
    }

    span:last-child {
        display: none;
    }

    * :global(Button){
        width: 40%;
        height: 3em;
        border-radius: 2em;
        color: white;
        margin: 0 1em;
    }

    .buttons{
        display: flex;
        align-items: center;
        justify-content: center;
    }

    * :global(.pointsButton){
        background-color: #4161FE;
    }

    * :global(.deleteButton){
        color: #4161FE;
        border-color: #4161FE;
    }
</style>