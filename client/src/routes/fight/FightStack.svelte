<script lang="ts">
    import { Actions } from "./fight-sequence-components/Actions";
    import type { Batch } from "./fight-sequence-components/Batch";

    export let stack: Batch[];
</script>

<div>
    {#each stack as batch}
        <p style="background-color: {batch.colour}"> 
            {Actions[batch.action]} 
        </p>
        <span> &#8594; </span>
    {/each}
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
</style>