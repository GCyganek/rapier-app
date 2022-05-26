<script lang="ts">
    import type { Response } from "model/Communication";
 
    export let suggestion: Response.Suggestion;
</script>

{#if suggestion}
    <div class={suggestion.judgeColor.toLowerCase()}>
        <span class="red-points"> 
            {suggestion.redPlayerPoints}
        </span>
        
        <span class="blue-points">
            {suggestion.bluePlayerPoints}
        </span>
    </div>
{:else}
    <div>
        [oczekuję na propozycję sędziego]
    </div>
{/if}

<style>
    div.red {
        border: 1px var(--red-fighter) solid;
    }

    div.blue {
        border: 1px var(--blue-fighter) solid;
    }

    span {
        padding: .125rem .5rem;
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