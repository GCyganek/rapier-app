<script lang="ts">
    import type { SequenceElement } from "model/SequenceElement";
    import { createEventDispatcher } from "svelte";
    import { Actions } from "./fight-sequence-components/Actions";
    import FightPoints from "./modal/FightPoints.svelte";

    export let stack: SequenceElement[];

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
                {
                    Actions.toHumanReadable(batch.action)
                }
            </span>
            <span> &#8594; </span>
        {/each}
    </div>

    <div class="buttons">
        <button on:click={() => dispatch('clear')}> Usuń ciąg </button>
        <button class="propose" on:click={() => openPoints()}> Zaproponuj punkty </button>
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
        height: 20rem;
    }

    span.action {
        font-size: 1rem;
        padding: 0.3rem 0.5rem;
        border-radius: 1rem;
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
        align-items: center;
        padding-top: 0.5rem;
    }

    button {
        margin: 0;
        height: 2rem;
        width: 42%;
        color: var(--blue-fighter);
        border: 1px currentColor solid;
        border-radius: 1rem;
    }

    button.propose {
        color: white;
        background-color: var(--blue-fighter);
    }

    div.actions {
        overflow: scroll;
    }
</style>