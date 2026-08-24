var arr = [
    {
        userName: "Test",
        lastName: "Test",
        email: "test.test@gmail.com"
    },
    {
        userName: "Dmitro",
        lastName: "Porohov",
        email: "dmitro.porohov@yahoo.com"
    },
    {
        userName: "Andrii",
        lastName: "",
        email: "andrii@mail.ru"
    }
];
let emailRegex = /^[A-Za-z0-9]+(\.[A-Za-z0-9]+)?@(gmail\.com|yahoo\.com)$/;

let validUsers = arr.filter(function(user) {
    return emailRegex.test(user.email);
});

let validEmails = validUsers.map(function(user) {
    return user.email;
});

console.log(validEmails);