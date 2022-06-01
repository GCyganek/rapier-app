function padToTwoDigits(number: number) {
  return number.toString().padStart(2, '0');
}

export default function millisToTime(timeInMillis: number): string {
  let seconds = Math.floor(timeInMillis / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);

  seconds %= 60;
  hours %= 60;
  hours %= 24; // fight shouldn't really last as long as to go beyond 24 hours lol

  return `${padToTwoDigits(hours)}:${padToTwoDigits(minutes)}:${padToTwoDigits(
    seconds,
  )}`;
}
