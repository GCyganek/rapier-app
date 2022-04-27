<script lang="ts" context="module">
    import { writable, Writable } from 'svelte/store';
    import type { Batch } from './fight-sequence-components/Batch';

    const fightSequence: Writable<Batch[]> = writable([]);

    export { fightSequence };
</script>

<script lang="ts">
    import SelectColour from './fight-sequence-components/SelectColour.svelte';
    import SelectResult from './fight-sequence-components/SelectResult.svelte';
    import SelectFighter from './fight-sequence-components/SelectFighter.svelte';
    import SelectAction from './fight-sequence-components/SelectAction.svelte';
    import SelectTiming from './fight-sequence-components/SelectTiming.svelte';
    import SelectArea from './fight-sequence-components/SelectArea.svelte';
    import { Components } from './fight-sequence-components/Components';
    
    const options = {
        [Components.SelectAction]:  SelectAction, 
        [Components.SelectTiming]:  SelectTiming, 
        [Components.SelectArea]:    SelectArea,
        [Components.SelectColour]:  SelectColour, 
        [Components.SelectFighter]: SelectFighter, 
        [Components.SelectResult]:  SelectResult
    };

    let activeComponent = SelectColour;
    let previousComponents = [];

    const logAction = (e: CustomEvent<Batch>) => {
        console.log(e.detail);

        if (e.detail.nextComponent === undefined) {
            fightSequence.update(fs => (fs.pop(), fs));
            activeComponent = options[previousComponents.pop()];
        
        } else {
            previousComponents.push(e.detail.currentComponent);
            activeComponent = options[e.detail.nextComponent];
            fightSequence.update(fs => [...fs, e.detail]);
        }
        console.log(previousComponents);
    }
    
    fightSequence.subscribe(console.log);
    // let back = false; ???

</script>

<div class="fightSequence">
    <svelte:component this={activeComponent} bind:activeComponent={activeComponent} on:clicked={logAction} />
</div>

<style>
    div {
        height: 50vh;
    }
</style>