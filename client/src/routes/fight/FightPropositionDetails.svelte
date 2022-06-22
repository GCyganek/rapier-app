<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Response } from 'model/Communication';
  import FightSuggestion from './modal/FightSuggestion.svelte';

  const dispatch = createEventDispatcher();
  export let suggestion: Response.Suggestion;
  let isOpenModal = false;

  function openModal(suggestion) {
    dispatch('suggestion');
    isOpenModal = true;
  }

  function closeAndCleanModal() {
    isOpenModal = false;
    suggestion = undefined;
  }

  function toggleModal() {
    isOpenModal = false;
  }
</script>

{#if suggestion !== undefined}
  <button
    class="suggestion"
    style="background-color: {suggestion.judgeColor.toLowerCase() == 'red'
      ? 'var(--red-fighter)'
      : 'var(--blue-fighter)'}"
    on:click={() => openModal(suggestion)}
  >
    Czerwony: {suggestion.redPlayerPoints}, Niebieski: {suggestion.bluePlayerPoints}
  </button>
  <FightSuggestion
    {suggestion}
    {isOpenModal}
    on:discardSuggestion={closeAndCleanModal}
    on:toggleModal={toggleModal}
  />
{:else}
  <button class="suggestion-await" disabled={true}>
    Oczekiwanie na propozycję sędzi bocznego...
  </button>
{/if}

<style>
  button {
    width: 80%;
    padding: 0.125rem 0.5rem;
    border-radius: 0.25em;
    text-align: center;
    display: block;
  }

  button.suggestion-await {
    color: black;
  }

  button.suggestion {
    color: white;
  }
</style>
