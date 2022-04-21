<script lang="ts">
    export let time: number;

    let interval = setInterval(() => time -= 1, 1000);
    
    $: {    
        if (time <= 0 && interval) {
            clearInterval(interval);
            interval = null;
        }
    }

    const showTime = (time: number) => {
        const min = Math.floor(time / 60), 
            tbs = time % 60,
            secs = tbs < 10 ? `0${tbs}` : tbs.toString();
        
        return `${min}:${secs}`
    }
    
</script>

<p> {showTime(time)} </p>

<style>
    p {
        color: white;
        padding: 10px;
        width: 20%;
        background: linear-gradient(90deg, #fb4141, #3b3bed);
    }

</style>