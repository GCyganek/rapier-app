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
    <span> 
        {fighter.firstName} {fighter.lastName} 
    </span>
    <span class="points"> {fighter.points} </span>
</div>

<style>
    .red,
    .blue {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        padding: 10px;
        width: 50%;
    }

    .red {
        background-color: #fb4141;
    }

    .blue {
        background-color: #3b3bed;
    }

    span {
        color: white;
    }

    .points {
        padding: 0px 5px;
    }
</style>
