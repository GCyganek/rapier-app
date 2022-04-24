<script lang="ts">
    export let time: number;
    let current = time;
    const start = Date.now();
    let timeout: NodeJS.Timeout = null;

    function preciseTimer(last) {
        const delta = Date.now() - last;
        current = time - Math.floor((Date.now() - start) / 1000);
        console.log(delta);
        timeout = setTimeout(preciseTimer, Math.max(0, 1000 - delta), Date.now());
    }

    preciseTimer(Date.now());

    $: {
        if (current <= 0 && timeout !== null) {
            clearTimeout(timeout);
            timeout = null;
        }
    }

    const showTime = (time: number) => {
        const min = Math.floor(time / 60), 
            tbs = time % 60,
            secs = tbs < 10 ? `0${tbs}` : tbs.toString();
        
        return `${min}:${secs}`
    }
    
</script>

<span> {showTime(current)} </span>

<style>
    span {
        box-sizing: border-box;
        border: 1px white solid;
        border-top: 0px;
        position: absolute;
        top: 0px;
        left: calc(50% - 3em);
        color: white;
        width: 6em;
        background: fixed #333;
        border-bottom-left-radius: 0.5em;
        border-bottom-right-radius: 0.5em;
        margin: 0px;
        padding: 2px 5px;
    }

</style>