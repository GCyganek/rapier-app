export default class Timer {
    private state: number;
    private timeout: NodeJS.Timeout;

    constructor(time: number) {
        this.state = 0;
    }

    private timer() {

    }

    start() {
        this.timeout = setTimeout(() => this.timer(), 0);
    }

    pause() {

    }
};