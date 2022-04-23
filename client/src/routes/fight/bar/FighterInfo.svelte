<script lang="ts" context="module">
    export type FighterType = "red" | "blue";

    export interface Fighter {
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
        padding: 1em;
        font-size: 1.25em;
        width: 50%;
        margin: 0;
    }

    .red span:last-child {
        margin-left: auto;
    }

    .blue span:last-child {
        margin-right: auto;
    }

    .points {
        font-size: 2em;
    }

    .red .points {
        margin-right: auto;
    }

    .blue .points {
        margin-left: auto;
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
        padding: 0px 5px;
    }
</style>
