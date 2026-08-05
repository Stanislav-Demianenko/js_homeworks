function checkProbabilityTheory(count) {
    let even = 0;
    let odd = 0;

    for (let i = 0; i < count; i++) {
        let randomNumber = Math.floor(Math.random() * 901) + 100;

        if (randomNumber % 2 === 0) {
            even++;
        } else {
            odd++;
        }
    }

    let evenPercent = (even / count) * 100;
    let oddPercent = (odd / count) * 100;

console.log("Кількість згенерованих чисел: " + count);
console.log("Парних чисел: " + even);
console.log("Непарних чисел: " + odd);
console.log("Відсоток парних: " + evenPercent + "%");
console.log("Відсоток непарних: " + oddPercent + "%");
}

checkProbabilityTheory(100);