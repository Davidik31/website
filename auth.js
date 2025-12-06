// Регистрация
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const user = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            phone: document.getElementById('phone').value,
            registrationDate: new Date().toLocaleDateString()
        };

        //Проверяем, нет ли уже пользователя с таким email
        if (StorageService.findUserByEmail(user.email)) {
            alert('Пользователь с таким email уже существует!');
            return;
        }

        StorageService.saveUser(user);
        alert('Регистрация успешна!');
        window.location.href = 'login.html';
    });
}

//Вход
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('loginForm')) {
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const user = StorageService.findUserByEmail(email);
            
            if (user && user.password === password) {
                StorageService.saveUser(user);
                window.location.href = 'profile.html';
            } else {
                alert('Неверный email или пароль!');
            }
        });
    }
});