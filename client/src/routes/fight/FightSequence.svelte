<script lang="ts" context="module">
    import { writable, Writable } from 'svelte/store';
    import type { Batch } from './fight-sequence-components/Batch';

    const fightSequence: Writable<Batch[]> = writable([]);
    const activeComponent: Writable<any> = writable(SelectColour);

    const options = {
        [Components.SelectAction]:  SelectAction, 
        [Components.SelectTiming]:  SelectTiming, 
        [Components.SelectArea]:    SelectArea,
        [Components.SelectColour]:  SelectColour, 
        [Components.SelectFighter]: SelectFighter, 
        [Components.SelectResult]:  SelectResult
    };

    let previousComponents: Components[] = [];
    
    const clear = () => {
        fightSequence.set([]);
        previousComponents = [];
        activeComponent.set(SelectColour);
    }

    const pop = () => {
        fightSequence.update(fs => (fs.pop(), fs));
        activeComponent.set(options[previousComponents.pop()]);
    }

    const push = (batch: Batch) => {
        previousComponents.push(batch.currentComponent);
        activeComponent.set(options[batch.nextComponent]);
        fightSequence.update(fs => [...fs, batch]);
    }

    export { fightSequence, clear, pop };

</script>

<script lang="ts">
    import SelectColour from './fight-sequence-components/SelectColour.svelte';
    import SelectResult from './fight-sequence-components/SelectResult.svelte';
    import SelectFighter from './fight-sequence-components/SelectFighter.svelte';
    import SelectAction from './fight-sequence-components/SelectAction.svelte';
    import SelectTiming from './fight-sequence-components/SelectTiming.svelte';
    import SelectArea from './fight-sequence-components/SelectArea.svelte';
    import { Components } from './fight-sequence-components/Components';

    const logAction = (e: CustomEvent<Batch>) => {
        e.detail.nextComponent === undefined
            ? pop()
            : push(e.detail);
    }

</script>

<div class="fightSequence">
    <svelte:component this={$activeComponent} on:clicked={logAction} />
</div>

<style>
    div {
        box-sizing: border-box;
        border-bottom: 2px solid #4161FE;
        padding: 0.5rem 0;
    }
</style>
