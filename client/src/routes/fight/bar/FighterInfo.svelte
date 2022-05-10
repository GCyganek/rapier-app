<script lang="ts" context="module">
    export type FighterType = "red" | "blue";

    export class Fighter {
        id: string;
        firstName: string;
        lastName: string;
        points: number = 0;
    };
</script>

<script lang="ts">
    export let type: FighterType;
    export let fighter: Fighter;
</script>

<div class={type}>    
    <span class="points"> {fighter.points ?? 0} </span>
    
    <span>
        {fighter.firstName}
        {fighter.lastName}
    </span>

    <span></span>
</div>

<style>
    .red,
    .blue {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        width: 50%;
        height: 100%;
        margin: 0;
    }

    .blue .points,
    .red span:last-child {
        margin-left: auto;
    }

    .red .points,
    .blue span:last-child {
        margin-right: auto;
    }

    .points {
        font-size: 2rem;
        padding: 0 1rem;
    }

    .red {
        background-color: var(--red-fighter);
        flex-direction: row;
    }

    .blue {
        background-color: var(--blue-fighter);
        flex-direction: row-reverse;
    }

    span {
        color: white;
    }
</style>
