<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { Actions } from "./fight-sequence-components/Actions";
    import type { Batch } from "./fight-sequence-components/Batch";

    export let stack: Batch[];

    const dispatch = createEventDispatcher();

</script>

<div class="container">
    <div class="actions">
        {#each stack as batch}
            <span class="action" style="background-color: {batch.colour}"> 
                {Actions[batch.action]} 
            </span>
            <span> &#8594; </span>
        {/each}
    </div>

    <div class="buttons">
        <button on:click={() => dispatch('clear')}> Usuń ciąg </button>
        <button on:click={() => dispatch('propose')}> Zaproponuj punkty </button>
    </div>
</div>

<style>
    div.container {
        border-top: 1px dimgray solid;
        padding: 1em;
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        box-sizing: border-box;
        height: 36vh;
    }

    span.action {
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

    div.buttons {
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
    }

    button {
        height: 2em;
        width: 36%;
        color: var(--blue-fighter);
        border: 1px currentColor solid;
        border-radius: 1em;
    }
</style>