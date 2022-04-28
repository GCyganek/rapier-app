<script lang="ts" context="module">
    export type FighterType = "red" | "blue";

    export class Fighter {
        firstName: string;
        lastName: string;
        points: number;
    }
</script>

<script lang="ts">
    export let type: FighterType;
    export let fighter: Fighter;
</script>

<div class={type}>    
    <span class="points"> {fighter.points} </span>
    
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
        font-size: 1.25em;
        width: 50%;
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
        font-size: 2em;
        margin-left: 0.2em;
        margin-right: 0.2em;
    }

    .red {
        background-color: var(--red-fighter);
        flex-direction: row;
        padding-right: 25px;
    }

    .blue {
        background-color: var(--blue-fighter);
        flex-direction: row-reverse;
        padding-left: 25px;
    }

    span {
        color: white;
    }
</style>
