<script lang="ts">
    import SelectColour from './fight-sequence-components/SelectColour.svelte';
    import SelectResult from './fight-sequence-components/SelectResult.svelte';
    import SelectFighter from './fight-sequence-components/SelectFighter.svelte';
    import SelectAction from './fight-sequence-components/SelectAction.svelte';
    import SelectTiming from './fight-sequence-components/SelectTiming.svelte';
    import SelectArea from './fight-sequence-components/SelectArea.svelte';
    import {Components} from './fight-sequence-components/Components';
    
    const options = {[Components.SelectAction]: SelectAction, [Components.SelectTiming]: SelectTiming, [Components.SelectArea]:SelectArea,
                     [Components.SelectColour]: SelectColour, [Components.SelectFighter]: SelectFighter, [Components.SelectResult]: SelectResult};

    let fightSequence = [];
    let activeComponent = SelectColour;
    let previousComponents = [];

    const logAction = (e) => {
        if (e.detail.nextComponent === undefined) {
            activeComponent = options[previousComponents.pop()];
            fightSequence.pop();
        } else {
            fightSequence.push(e.detail);
            previousComponents.push(e.detail.currentComponent);
            activeComponent = options[e.detail.nextComponent];
        }
        console.log(fightSequence);
        console.log(previousComponents);
    }
    
    let back = false;

</script>
<div class="fightSequence">
    <svelte:component this={activeComponent} bind:activeComponent={activeComponent} on:clicked={logAction}/>
</div>

<style>
    
</style>