export class Timer {
    private timeoutId: NodeJS.Timeout = null;
    private remainingMilis: number;
    private lastTimerStart: number;
    private timeEnded = false;
    
    constructor (
        public readonly timeInMinutes: number
    ) {
        this.remainingMilis = timeInMinutes * 60 * 1000;
    }

    startTimer(): boolean {
        if (this.timeoutId || this.timeEnded)
            return false;
        
        this.lastTimerStart = Date.now();
        this.timeoutId = setTimeout(this.notify, this.remainingMilis);
        return true;
    }

    pauseTimer(timeInMilisReceived: number): boolean {
        if (this.timeoutId == null || this.timeEnded) 
            return false;
        
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
        this.remainingMilis -= (timeInMilisReceived - this.lastTimerStart);
        return true;
    }

    timeoutSet(): boolean {
        return this.timeoutId != null;
    }

    endTimer(): void {
        if (this.timeoutId != null && !this.timeEnded) {
            clearTimeout(this.timeoutId)
        }
        this.timeEnded = true;
    }

    hasTimeEnded(): boolean {
        return this.timeEnded;
    }

    notify(): void {
        this.timeEnded = true;
    }
}