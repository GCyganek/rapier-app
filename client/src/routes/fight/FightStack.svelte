<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { Actions } from "./fight-sequence-components/Actions";
    import type { Batch } from "./fight-sequence-components/Batch";
    import FightPoints from "./modal/FightPoints.svelte";

    export let stack: Batch[];

    let isOpenPoints = false;

    function openPoints() {
        dispatch('propose');
        isOpenPoints = true;
    }

    function closePoints() {
        isOpenPoints = false;
    }

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
        <button on:click={() => openPoints()}> Zaproponuj punkty </button>
        <FightPoints stack={stack} isOpenModal={isOpenPoints} on:closeModal={closePoints} />
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
        height: 27.5vh;
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