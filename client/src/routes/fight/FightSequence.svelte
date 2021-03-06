<script lang="ts" context="module">
  import type { Writable } from 'svelte/store';
  import { writable } from 'svelte/store';
  import { draw, emptySeq } from './fight-sequence-components/Store';
  import type { SequenceElement } from 'model/SequenceElement';

  const fightSequence: Writable<SequenceElement[]> = writable([]);
  const activeComponent: Writable<any> = writable(SelectColour);
  let attackersHistory = []; // array to track last attacker's colour (needed for "Go back" handling)
  let previousAttacker = undefined; // previous attacker's colour (is )
  let answerDisabled = true;

  const options = {
    [Components.SelectAction]: SelectAction,
    [Components.SelectTiming]: SelectTiming,
    [Components.SelectArea]: SelectArea,
    [Components.SelectColour]: SelectColour,
    [Components.SelectResult]: SelectResult,
  };

  let previousComponents: Components[] = [];

  const clear = () => {
    fightSequence.set([]);
    previousComponents = [];
    activeComponent.set(SelectColour);

    // clear sequence component
    previousAttacker = undefined;
    attackersHistory = [];
    answerDisabled = true;

    // clear draw case
    draw.set(false);
    emptySeq.set(true);
  };

  const pop = () => {
    fightSequence.update((fs) => (fs.pop(), fs));
    activeComponent.set(options[previousComponents.pop()]);
    attackersHistory.pop();
    previousAttacker = attackersHistory.at(-1);
    if (attackersHistory.length === 0) {
      previousAttacker = undefined;
      emptySeq.set(true);
    }
    draw.set(false);
  };

  const push = (batch: SequenceElement) => {
    previousComponents.push(batch.currentComponent);
    activeComponent.set(options[batch.nextComponent]);
    fightSequence.update((fs) => [...fs, batch]);
    emptySeq.set(false);
  };

  export { fightSequence, clear, pop };
</script>

<script lang="ts">
  import SelectColour from './fight-sequence-components/SelectColour.svelte';
  import SelectResult from './fight-sequence-components/SelectResult.svelte';
  import SelectAction from './fight-sequence-components/SelectAction.svelte';
  import SelectTiming from './fight-sequence-components/SelectTiming.svelte';
  import SelectArea from './fight-sequence-components/SelectArea.svelte';
  import { Components } from './fight-sequence-components/Components';

  const logAction = (e: CustomEvent<SequenceElement>) => {
    if (previousAttacker !== undefined) {
      attackersHistory.push(previousAttacker);
    }
    e.detail.nextComponent === undefined ? pop() : push(e.detail);
  };
</script>

<div class="fightSequence">
  <svelte:component
    this={$activeComponent}
    on:clicked={logAction}
    bind:answerDisabled
    bind:previousAttacker
  />
</div>

<style>
  div {
    box-sizing: border-box;
    border-bottom: 2px solid #4161fe;
    padding: 0.5rem 0;
  }
</style>
