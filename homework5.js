var services = {
    "Стрижка": "60 грн",
    "Гоління": "80 грн",
    "Миття голови": "100 грн",
};
services["Розбити скло"] = "200 грн";
services.price = function() {
    let total = 0;

    for (let key in services) {
        if (typeof services[key] !== "function") {
            total = total + parseInt(services[key]);
        }
    }
    return total;
}
console.log(services.price());

services.minPrice = function() {
    let min = null;

    for (let key in services) {
        if (typeof services[key] !== "function") {
            let currentPrice = parseInt(services[key]);

            if (min === null || currentPrice < min) {
                min = currentPrice;
            }
        }
    }
    return min;
};
console.log(services.minPrice());

services.maxPrice = function() {
    let max = null;

    for (let key in services) {
        if (typeof services[key] !== "function") {
            let currentPrice = parseInt(services[key]);

            if (max === null || currentPrice > max) {
                max = currentPrice;
            }
        }

    }
    return max;
};
console.log(services.maxPrice());