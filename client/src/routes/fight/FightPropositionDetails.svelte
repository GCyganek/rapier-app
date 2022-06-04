<script lang="ts">
    import { Label } from "@smui/button";
    import { createEventDispatcher } from "svelte";
    import Button from "@smui/button/src/Button.svelte";
    import type { Response } from "model/Communication";
    import FightSuggestion from "./modal/FightSuggestion.svelte";

    const dispatch = createEventDispatcher();
    export let suggestion: Response.Suggestion;
    let isOpenModal = false;

    function openModal(suggestion) {
        dispatch("suggestion");
        isOpenModal = true;
    }

    function closeModal() {
        isOpenModal = false;
        suggestion = undefined;
    }
</script>

{#if suggestion!==undefined}
    <div class={suggestion.judgeColor.toLowerCase()}>
        <button class="suggestion" 
                style="background-color: {suggestion.judgeColor.toLowerCase()==="red" ? 'var(--red-fighter)' : 'var(--blue-fighter)'}" 
                on:click={() => openModal(suggestion)}>
                Czerwony: {suggestion.redPlayerPoints}, Niebieski: {suggestion.bluePlayerPoints}
        </button>
        <FightSuggestion suggestion={suggestion} isOpenModal={isOpenModal} on:closeModal={closeModal} />
    </div>
{:else}
    <div>
        [oczekuję na propozycję sędziego]
    </div>
{/if}

<style>
    div.red, div.blue {
        width: 100%;
    }

    button.suggestion {
        width: 100%;
        padding: .125rem .5rem;
        border-radius: 0.25em;
        color: white;
        text-align: center;
    }

    .red-points {
        border-top-left-radius: .5rem;
        border-bottom-left-radius: .5rem;
        background-color: var(--red-fighter);
    }

    .blue-points {
        border-top-right-radius: .5rem;
        border-bottom-right-radius: .5rem;
        background-color: var(--blue-fighter);
    }

</style>